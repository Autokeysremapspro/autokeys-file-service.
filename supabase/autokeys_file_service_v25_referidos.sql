-- =========================================================
-- AK CLOUD — Programa de referidos entre talleres (v25)
--
-- No usamos créditos para esto (decisión del negocio): la recompensa por
-- traer un taller nuevo es que Autokeys Remaps Pro le revise y mejore la
-- tarifa a quien refiere — eso es una decisión manual del equipo, no algo
-- que esta migración automatice. Lo que sí hace esta migración es dejar
-- registrado, de forma fiable, quién trajo a quién, para que el equipo
-- pueda decidir con datos reales.
--
-- Diseño importante: la aprobación de una solicitud (que crea la fila real
-- en akcloud_distribuidores) la hace Autokeys Core, un proyecto aparte que
-- no toca este repo. Por eso la relación de referido se resuelve con un
-- trigger a nivel de base de datos (no en código de aplicación) — así
-- funciona sin que Core tenga que enterarse de que existe el programa.
-- =========================================================

-- ---------------------------------------------------------
-- 1) Columnas nuevas
-- ---------------------------------------------------------
alter table public.akcloud_distribuidores
  add column if not exists codigo_referido text,
  add column if not exists referido_por_distribuidor_id uuid references public.akcloud_distribuidores(id) on delete set null;

create unique index if not exists akcloud_distribuidores_codigo_referido_idx
  on public.akcloud_distribuidores (codigo_referido)
  where codigo_referido is not null;

alter table public.akcloud_solicitudes_distribuidores
  add column if not exists referido_por_codigo text,
  add column if not exists referido_por_distribuidor_id uuid references public.akcloud_distribuidores(id) on delete set null;

-- ---------------------------------------------------------
-- 2) Generador de código corto y legible a partir del nombre del taller
--    (ej. "Taller Pérez S.L." -> "TALLERPEREZ-4K2Q"). Reintenta si choca.
-- ---------------------------------------------------------
create or replace function public.ak_generar_codigo_referido(p_empresa text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base text;
  v_codigo text;
  v_intentos int := 0;
begin
  v_base := upper(regexp_replace(coalesce(p_empresa, 'TALLER'), '[^a-zA-Z0-9]+', '', 'g'));
  v_base := left(nullif(v_base, ''), 12);
  if v_base is null then v_base := 'TALLER'; end if;

  loop
    v_codigo := v_base || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
    exit when not exists (select 1 from public.akcloud_distribuidores where codigo_referido = v_codigo);
    v_intentos := v_intentos + 1;
    if v_intentos > 20 then
      v_codigo := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 10));
      exit;
    end if;
  end loop;

  return v_codigo;
end;
$$;

revoke execute on function public.ak_generar_codigo_referido(text) from public, anon, authenticated;
grant execute on function public.ak_generar_codigo_referido(text) to service_role;

-- ---------------------------------------------------------
-- 3) Trigger: al crear un distribuidor (lo hace Core al aprobar una
--    solicitud), le asigna su código de referido si no tiene, y — si la
--    solicitud de origen llevaba un referido_por_distribuidor_id ya
--    resuelto — lo copia a la fila del nuevo distribuidor. Todo antes del
--    insert, sin depender de que Core sepa nada de esto.
-- ---------------------------------------------------------
create or replace function public.ak_distribuidor_antes_insertar()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referido_por uuid;
begin
  if new.codigo_referido is null then
    new.codigo_referido := public.ak_generar_codigo_referido(new.empresa);
  end if;

  if new.referido_por_distribuidor_id is null and new.solicitud_id is not null then
    select referido_por_distribuidor_id into v_referido_por
    from public.akcloud_solicitudes_distribuidores
    where id = new.solicitud_id;

    -- Nunca te puedes referir a ti mismo (por ejemplo, si el mismo email
    -- reenvía su propio código por error).
    if v_referido_por is not null and v_referido_por <> new.id then
      new.referido_por_distribuidor_id := v_referido_por;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_ak_distribuidor_antes_insertar on public.akcloud_distribuidores;
create trigger trg_ak_distribuidor_antes_insertar
  before insert on public.akcloud_distribuidores
  for each row execute function public.ak_distribuidor_antes_insertar();

-- Backfill: distribuidores ya existentes que todavía no tienen código.
do $$
declare
  r record;
begin
  for r in select id, empresa from public.akcloud_distribuidores where codigo_referido is null loop
    update public.akcloud_distribuidores
    set codigo_referido = public.ak_generar_codigo_referido(r.empresa)
    where id = r.id;
  end loop;
end $$;

-- ---------------------------------------------------------
-- 4) RPC para que un distribuidor vea su propio código y el resumen de a
--    quién ha traído — nunca expone email, teléfono ni datos internos de
--    los referidos, solo empresa/estado/fecha, y solo de los suyos.
-- ---------------------------------------------------------
create or replace function public.ak_mis_referidos()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_distribuidor_id uuid;
  v_codigo text;
  v_referidos jsonb;
  v_activos int;
  v_total int;
begin
  select id, codigo_referido into v_distribuidor_id, v_codigo
  from public.akcloud_distribuidores
  where auth_user_id = auth.uid();

  if v_distribuidor_id is null then
    return jsonb_build_object('codigo_referido', null, 'total_referidos', 0, 'referidos_activos', 0, 'referidos', '[]'::jsonb);
  end if;

  select
    coalesce(jsonb_agg(jsonb_build_object('empresa', empresa, 'estado', estado, 'creado_en', created_at) order by created_at desc), '[]'::jsonb),
    count(*) filter (where estado = 'activo'),
    count(*)
  into v_referidos, v_activos, v_total
  from public.akcloud_distribuidores
  where referido_por_distribuidor_id = v_distribuidor_id;

  return jsonb_build_object(
    'codigo_referido', v_codigo,
    'total_referidos', v_total,
    'referidos_activos', v_activos,
    'referidos', v_referidos
  );
end;
$$;

revoke execute on function public.ak_mis_referidos() from public, anon;
grant execute on function public.ak_mis_referidos() to authenticated, service_role;

-- ---------------------------------------------------------
-- 5) Nota
-- ---------------------------------------------------------
-- La mejora de tarifa por referir sigue siendo una decisión manual del
-- equipo (vía distribuidor_precios en Core), a la vista de cuántos
-- referidos activos tiene cada distribuidor. Esta migración solo deja el
-- dato disponible y fiable; no cambia precios por sí sola.
