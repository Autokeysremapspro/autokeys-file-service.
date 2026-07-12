-- =========================================================
-- AK CLOUD — Planes por grupo de servicio (v18)
-- Essential: solo anulaciones (EGR/DPF/AdBlue/DTC/Flaps OFF) con
--            descuento de plan. Stage 1/2 y personalizado se pueden
--            pedir igual, pero sin el descuento — se pagan al precio
--            completo, "aparte" del plan.
-- Performance: descuento en anulaciones Y en tuning (Stage 1/2,
--              Pops & Bangs, Hardcut, Launch Control).
-- =========================================================

-- ---------------------------------------------------------
-- 1) Columna nueva en servicios: a qué grupo de facturación pertenece.
--    (Distinta de "categoria", que ya se usa para agrupar visualmente
--    en el catálogo — esta es para saber si un plan lo cubre o no.)
-- ---------------------------------------------------------
alter table public.akcloud_servicios add column if not exists grupo_facturacion text;

update public.akcloud_servicios set grupo_facturacion = 'anulacion'
where slug in ('dpf-off', 'egr-off', 'adblue-off', 'dtc-off', 'flaps-off');

update public.akcloud_servicios set grupo_facturacion = 'tuning'
where slug in ('stage-1', 'stage-2', 'pops-bangs', 'hardcut', 'launch-control', 'personalizado');

-- Si no existía "Flaps OFF" como servicio, se añade (los demás ya deberían existir).
insert into public.akcloud_servicios (nombre, slug, categoria, descripcion, precio, creditos, icono, orden, activo, grupo_facturacion)
select 'Flaps OFF', 'flaps-off', 'Anticontaminación', 'Desactivación de flaps de admisión según solicitud del profesional.', 20, 20, '🎛️', 45, true, 'anulacion'
where not exists (select 1 from public.akcloud_servicios where slug = 'flaps-off');

-- ---------------------------------------------------------
-- 2) Columnas nuevas en planes: qué grupos cubre con descuento, y de cuánto.
-- ---------------------------------------------------------
alter table public.akcloud_planes add column if not exists grupos_incluidos text[] default '{}';
alter table public.akcloud_planes add column if not exists descuento_plan_pct numeric default 0;

-- ---------------------------------------------------------
-- 3) Sustituir los planes actuales por los dos nuevos.
--    (Confirmado: no hay distribuidores reales enganchados a un plan
--    todavía, así que es seguro reemplazar en vez de solo añadir.)
-- ---------------------------------------------------------
delete from public.akcloud_planes;

insert into public.akcloud_planes (nombre, slug, descripcion, precio_mensual, creditos_mes, ventajas, destacado, orden, grupos_incluidos, descuento_plan_pct, activo)
values
  (
    'Essential',
    'essential',
    'Anulaciones con descuento — EGR, DPF, AdBlue, DTC y Flaps OFF.',
    50,
    50,
    array['EGR / DPF / AdBlue / DTC / Flaps OFF con descuento', 'Stage 1, Stage 2 y personalizado se pagan aparte', 'Soporte estándar'],
    false,
    10,
    array['anulacion'],
    15,
    true
  ),
  (
    'Performance',
    'performance',
    'Todo incluido con descuento: anulaciones + Stage 1, Stage 2, Pops & Bangs, Hardcut y más.',
    110,
    120,
    array['EGR / DPF / AdBlue / DTC / Flaps OFF con descuento', 'Stage 1, Stage 2, Pops & Bangs y Hardcut con descuento', 'Soporte preferente'],
    true,
    20,
    array['anulacion', 'tuning'],
    15,
    true
  );

-- ---------------------------------------------------------
-- 4) Nota
-- ---------------------------------------------------------
-- Los números de precio_mensual/creditos_mes/descuento_plan_pct (50€/50cr,
-- 110€/120cr, 15% descuento) son un punto de partida razonable a partir de
-- tus planes anteriores — ajústalos tú mismo en el Table Editor de Supabase
-- (tabla akcloud_planes) según lo que quieras cobrar de verdad.
