-- =========================================================
-- AK CLOUD — Planes por periodo (días) + límite diario (v21)
-- Añade, además del precio libre por servicio ya montado:
--   - duracion_dias: cuántos días dura el plan antes de necesitar
--     renovación (ej. 30 = mensual).
--   - limite_diario_pedidos: cuántos pedidos como máximo puede crear
--     un distribuidor de este plan CADA DÍA (no créditos — un tope
--     de "archivos al día"). Vacío/null = sin límite.
-- =========================================================

alter table public.akcloud_planes add column if not exists duracion_dias integer default 30;
alter table public.akcloud_planes add column if not exists limite_diario_pedidos integer;

alter table public.akcloud_distribuidores add column if not exists plan_inicio_at timestamptz;
alter table public.akcloud_distribuidores add column if not exists plan_expira_at timestamptz;

comment on column public.akcloud_planes.duracion_dias is 'Días que dura el plan activo antes de necesitar renovación.';
comment on column public.akcloud_planes.limite_diario_pedidos is 'Máximo de pedidos al día para este plan. Null = sin límite.';
comment on column public.akcloud_distribuidores.plan_inicio_at is 'Cuándo empezó el periodo actual del plan.';
comment on column public.akcloud_distribuidores.plan_expira_at is 'Cuándo caduca el periodo actual del plan (plan_inicio_at + duracion_dias del plan).';

notify pgrst, 'reload schema';
