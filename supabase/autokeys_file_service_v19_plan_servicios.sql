-- =========================================================
-- AK CLOUD — Servicios por plan, uno a uno (v19)
-- Sustituye/complementa el sistema de "grupos" (anulacion/tuning)
-- por control fino: para cada plan, decides servicio por servicio
-- si está incluido con descuento, y de cuánto (puede ser distinto
-- al descuento general del plan).
-- =========================================================

create table if not exists public.akcloud_plan_servicios (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.akcloud_planes(id) on delete cascade,
  servicio_id uuid not null references public.akcloud_servicios(id) on delete cascade,
  incluido boolean not null default true,
  descuento_pct numeric, -- si es null, se usa el descuento general del plan (descuento_plan_pct)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, servicio_id)
);

alter table public.akcloud_plan_servicios enable row level security;

drop policy if exists "akcloud_plan_servicios_select_auth" on public.akcloud_plan_servicios;
drop policy if exists "akcloud_plan_servicios_write_staff" on public.akcloud_plan_servicios;

create policy "akcloud_plan_servicios_select_auth" on public.akcloud_plan_servicios
  for select using (auth.role() = 'authenticated');

create policy "akcloud_plan_servicios_write_staff" on public.akcloud_plan_servicios
  for all using (is_staff()) with check (is_staff());

-- ---------------------------------------------------------
-- Nota sobre cómo queda la prioridad de reglas al pedir un pedido
-- ---------------------------------------------------------
-- 1º Si existe una fila en akcloud_plan_servicios para (plan, servicio):
--    manda ella — "incluido" y su "descuento_pct" (o el general del plan
--    si esta fila no trae uno propio).
-- 2º Si no existe ninguna fila para ese plan+servicio: se usa el sistema
--    de grupos anterior (grupo_facturacion del servicio vs grupos_incluidos
--    del plan) como respaldo — así los planes que ya configuraste con
--    grupos siguen funcionando sin tener que rehacer nada a mano.
