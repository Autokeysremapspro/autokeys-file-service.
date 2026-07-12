-- =========================================================
-- AK CLOUD — Saldo de créditos atómico (v16)
-- Hasta ahora el saldo se calculaba leyendo el último movimiento
-- ("saldo_resultante" de la fila más reciente) y luego insertando
-- uno nuevo con saldo-X. Eso funciona bien en el caso normal, pero
-- tiene una condición de carrera real: si dos peticiones leen el
-- saldo casi a la vez (dos pedidos seguidos rápido, doble clic,
-- dos pestañas), las dos pueden leer el mismo saldo antes de que
-- ninguna escriba, y gastar más créditos de los que hay.
--
-- Esta migración añade una tabla de saldo con actualización atómica
-- (el UPDATE con WHERE saldo >= X es indivisible en Postgres — no
-- puede haber dos peticiones "colándose" a la vez) y dos funciones
-- que deben usarse para CUALQUIER cambio de saldo a partir de ahora.
-- =========================================================

-- ---------------------------------------------------------
-- 1) Tabla de saldo — una fila por usuario, siempre el número real actual.
-- ---------------------------------------------------------
create table if not exists public.ak_creditos_saldos (
  user_id uuid primary key references auth.users(id) on delete cascade,
  saldo integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.ak_creditos_saldos enable row level security;
drop policy if exists "ak_creditos_saldos_select_own" on public.ak_creditos_saldos;
create policy "ak_creditos_saldos_select_own" on public.ak_creditos_saldos
  for select using (auth.uid() = user_id or is_staff());
-- Sin política de insert/update para "authenticated": el saldo SOLO
-- cambia a través de las funciones de abajo (security definer) o de
-- service_role — nunca por una escritura directa a la tabla.

-- Rellena la tabla con el saldo actual de cada usuario que ya tenga movimientos,
-- calculado igual que lo hacía el código hasta ahora (último saldo_resultante).
insert into public.ak_creditos_saldos (user_id, saldo)
select distinct on (user_id) user_id, coalesce(saldo_resultante, 0)
from public.ak_creditos_movimientos
where user_id is not null
order by user_id, created_at desc
on conflict (user_id) do update set saldo = excluded.saldo, updated_at = now();

-- ---------------------------------------------------------
-- 2) Descontar créditos de forma atómica. Falla (excepción) si no
--    hay saldo suficiente — nunca deja un saldo negativo.
-- ---------------------------------------------------------
create or replace function public.ak_consumir_creditos(
  p_user_id uuid,
  p_creditos integer,
  p_concepto text,
  p_pedido_id uuid default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nuevo_saldo integer;
begin
  if p_creditos <= 0 then
    raise exception 'p_creditos debe ser mayor que 0';
  end if;

  insert into public.ak_creditos_saldos (user_id, saldo)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  update public.ak_creditos_saldos
  set saldo = saldo - p_creditos, updated_at = now()
  where user_id = p_user_id and saldo >= p_creditos
  returning saldo into v_nuevo_saldo;

  if v_nuevo_saldo is null then
    raise exception 'saldo_insuficiente';
  end if;

  insert into public.ak_creditos_movimientos (user_id, tipo, concepto, pedido_id, creditos, saldo_resultante)
  values (p_user_id, 'consumo', p_concepto, p_pedido_id, -p_creditos, v_nuevo_saldo);

  return v_nuevo_saldo;
end;
$$;

-- ---------------------------------------------------------
-- 3) Añadir créditos de forma atómica (recargas, devoluciones, ajustes).
-- ---------------------------------------------------------
create or replace function public.ak_anadir_creditos(
  p_user_id uuid,
  p_creditos integer,
  p_concepto text,
  p_tipo text default 'ajuste',
  p_pedido_id uuid default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nuevo_saldo integer;
begin
  if p_creditos <= 0 then
    raise exception 'p_creditos debe ser mayor que 0';
  end if;
  if p_tipo not in ('recarga', 'devolucion', 'ajuste') then
    raise exception 'tipo no válido para añadir créditos: %', p_tipo;
  end if;

  insert into public.ak_creditos_saldos (user_id, saldo)
  values (p_user_id, p_creditos)
  on conflict (user_id) do update set saldo = ak_creditos_saldos.saldo + p_creditos, updated_at = now()
  returning saldo into v_nuevo_saldo;

  insert into public.ak_creditos_movimientos (user_id, tipo, concepto, pedido_id, creditos, saldo_resultante)
  values (p_user_id, p_tipo, p_concepto, p_pedido_id, p_creditos, v_nuevo_saldo);

  return v_nuevo_saldo;
end;
$$;

-- ---------------------------------------------------------
-- 4) IMPORTANTE — restringir quién puede ejecutar estas funciones.
--    Son SECURITY DEFINER a propósito (para poder escribir en la
--    tabla de saldo y en movimientos sin depender de RLS), pero eso
--    significa que SE SALTAN RLS — si cualquier usuario logueado
--    pudiera llamarlas, podría darse créditos gratis directamente
--    desde el navegador. Solo el backend (rutas API con
--    SUPABASE_SERVICE_ROLE_KEY) debe poder invocarlas.
-- ---------------------------------------------------------
revoke execute on function public.ak_consumir_creditos(uuid, integer, text, uuid) from public, anon, authenticated;
revoke execute on function public.ak_anadir_creditos(uuid, integer, text, text, uuid) from public, anon, authenticated;
grant execute on function public.ak_consumir_creditos(uuid, integer, text, uuid) to service_role;
grant execute on function public.ak_anadir_creditos(uuid, integer, text, text, uuid) to service_role;

-- ---------------------------------------------------------
-- 5) Nota para cuando conectes el código a esto (siguiente paso)
-- ---------------------------------------------------------
-- A partir de ahora, cualquier cambio de saldo debe hacerse llamando
-- a estas dos funciones (supabase.rpc('ak_consumir_creditos', {...}) /
-- supabase.rpc('ak_anadir_creditos', {...})) SIEMPRE desde una ruta
-- server-side que use SUPABASE_SERVICE_ROLE_KEY — nunca desde el
-- cliente del navegador (fallará con "permission denied", que es
-- justo lo que debe pasar si alguien lo intenta).
