-- =========================================================
-- AK CLOUD — Precio libre por servicio dentro de cada plan (v20)
-- Amplía akcloud_plan_servicios: en vez de solo "incluido + % de
-- descuento", ahora puedes poner un precio y unos créditos exactos
-- para ese servicio dentro de ese plan concreto — lo que tú quieras,
-- sin depender de ningún cálculo de porcentaje.
-- =========================================================

alter table public.akcloud_plan_servicios add column if not exists precio_override numeric;
alter table public.akcloud_plan_servicios add column if not exists creditos_override integer;

comment on column public.akcloud_plan_servicios.precio_override is 'Precio en € exacto para este servicio dentro de este plan. Si está relleno, manda sobre descuento_pct.';
comment on column public.akcloud_plan_servicios.creditos_override is 'Créditos exactos para este servicio dentro de este plan. Si está relleno, manda sobre descuento_pct.';

-- ---------------------------------------------------------
-- IMPORTANTE — por qué salía "Could not find the column in the
-- schema cache": Supabase (PostgREST) guarda en caché la forma de
-- tus tablas y a veces no se entera sola de una columna nueva al
-- instante. Esta instrucción le pide que la recargue ahora mismo —
-- solo hace falta una vez, no en cada migración futura.
-- ---------------------------------------------------------
notify pgrst, 'reload schema';
