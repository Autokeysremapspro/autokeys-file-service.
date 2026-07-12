-- =========================================================
-- AK CLOUD — Plan Free + solicitud de renovación (v22)
-- =========================================================

-- Plan "Free": pago por solución individual, sin cuota ni descuentos,
-- sin caducidad (duracion_dias null = no caduca). Es el plan al que
-- cae un distribuidor si no renueva su plan de pago.
insert into public.akcloud_planes (nombre, slug, descripcion, precio_mensual, creditos_mes, ventajas, destacado, orden, activo, duracion_dias, limite_diario_pedidos, grupos_incluidos, descuento_plan_pct)
select 'Free', 'free', 'Sin cuota mensual — cada solución se paga por separado, a precio completo.', 0, 0, array['Sin permanencia', 'Pagas solo lo que pidas'], false, 999, true, null, null, '{}', 0
where not exists (select 1 from public.akcloud_planes where slug = 'free');

-- Marca si el distribuidor ha pedido renovar su plan actual (para que el
-- staff lo vea en Core y confirme el pago/renovación).
alter table public.akcloud_distribuidores add column if not exists solicito_renovacion boolean default false;
alter table public.akcloud_distribuidores add column if not exists solicito_renovacion_at timestamptz;

notify pgrst, 'reload schema';
