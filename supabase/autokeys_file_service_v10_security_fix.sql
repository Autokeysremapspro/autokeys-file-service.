-- =========================================================
-- AK CLOUD (autokeys-file-service) — Parche de seguridad
-- Ejecutar en el MISMO proyecto Supabase que Autokeys Core
-- (comparten base de datos), después de aplicar
-- autokeys_core_v9_security_fix.sql — este archivo reutiliza
-- las funciones is_staff() / is_admin() definidas allí.
-- =========================================================

-- ---------------------------------------------------------
-- ak_creditos_movimientos — el distribuidor ve solo sus movimientos;
-- solo staff (o rutas server con service_role) puede insertar/editar.
-- ---------------------------------------------------------
drop policy if exists "ak_creditos_select_own" on public.ak_creditos_movimientos;
drop policy if exists "ak_creditos_insert_all" on public.ak_creditos_movimientos;
drop policy if exists "ak_creditos_update_all" on public.ak_creditos_movimientos;

create policy "ak_creditos_select_own" on public.ak_creditos_movimientos
  for select using (auth.uid() = user_id or is_staff());

create policy "ak_creditos_insert_staff" on public.ak_creditos_movimientos
  for insert with check (is_staff());

create policy "ak_creditos_update_staff" on public.ak_creditos_movimientos
  for update using (is_staff()) with check (is_staff());

-- Nota: los movimientos "reales" (compra de créditos, consumo por pedido)
-- deben crearse desde rutas API server-side con SUPABASE_SERVICE_ROLE_KEY,
-- que se salta RLS igualmente — esta política cierra el hueco de que el
-- NAVEGADOR del cliente pueda insertarse créditos gratis directamente.

-- ---------------------------------------------------------
-- file_service_pedidos — el distribuidor ve/crea solo los suyos;
-- solo staff puede cambiar estado/asignación.
-- ---------------------------------------------------------
alter table public.file_service_pedidos enable row level security;

drop policy if exists "pedidos_select_all" on public.file_service_pedidos;
drop policy if exists "pedidos_insert_all" on public.file_service_pedidos;
drop policy if exists "pedidos_update_all" on public.file_service_pedidos;

create policy "pedidos_select_own" on public.file_service_pedidos
  for select using (auth.uid() = user_id or is_staff());

create policy "pedidos_insert_own" on public.file_service_pedidos
  for insert with check (auth.uid() = user_id);

create policy "pedidos_update_staff" on public.file_service_pedidos
  for update using (is_staff()) with check (is_staff());

-- ---------------------------------------------------------
-- Notificaciones y mensajería — cada uno ve lo suyo
-- ---------------------------------------------------------
do $$
declare
  t text;
  own_tables text[] := array['file_service_notificaciones', 'ak_notificaciones', 'file_service_mensajes'];
begin
  foreach t in array own_tables loop
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = t) then
      execute format('alter table public.%I enable row level security;', t);
      execute format('drop policy if exists "select_all" on public.%I;', t);
      execute format('drop policy if exists "insert_all" on public.%I;', t);
      execute format('drop policy if exists "update_all" on public.%I;', t);
      execute format('create policy "%1$s_select_own" on public.%1$I for select using (auth.uid() = user_id or is_staff());', t);
      execute format('create policy "%1$s_insert_staff" on public.%1$I for insert with check (is_staff());', t);
      execute format('create policy "%1$s_update_own" on public.%1$I for update using (auth.uid() = user_id or is_staff()) with check (auth.uid() = user_id or is_staff());', t);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------
-- Pagos PayPal — nunca editables desde el cliente, solo lectura propia
-- ---------------------------------------------------------
alter table public.ak_paypal_pagos enable row level security;
drop policy if exists "select_all" on public.ak_paypal_pagos;
drop policy if exists "insert_all" on public.ak_paypal_pagos;
drop policy if exists "update_all" on public.ak_paypal_pagos;

create policy "paypal_select_own" on public.ak_paypal_pagos
  for select using (auth.uid() = user_id or is_staff());
-- Sin política de insert/update para el rol authenticated:
-- solo las rutas server (service_role) escriben aquí, que es como debe ser
-- para un registro de pagos.

-- ---------------------------------------------------------
-- Catálogo público (planes, servicios, métodos de pago, reglas de precio,
-- reglas de detección ECU): lectura abierta para cualquier distribuidor
-- logueado, escritura solo staff.
-- ---------------------------------------------------------
do $$
declare
  t text;
  catalog_tables text[] := array[
    'akcloud_planes', 'akcloud_servicios', 'akcloud_metodos_pago',
    'akcloud_reglas_precios', 'ak_ecu_detection_rules'
  ];
begin
  foreach t in array catalog_tables loop
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = t) then
      execute format('alter table public.%I enable row level security;', t);
      execute format('drop policy if exists "select_all" on public.%I;', t);
      execute format('drop policy if exists "insert_all" on public.%I;', t);
      execute format('drop policy if exists "update_all" on public.%I;', t);
      execute format('create policy "%1$s_select_auth" on public.%1$I for select using (auth.role() = ''authenticated'');', t);
      execute format('create policy "%1$s_write_staff" on public.%1$I for insert with check (is_staff());', t);
      execute format('create policy "%1$s_update_staff" on public.%1$I for update using (is_staff()) with check (is_staff());', t);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------
-- Tickets de soporte
-- ---------------------------------------------------------
do $$
declare
  t text;
  ticket_tables text[] := array['akcloud_tickets', 'akcloud_ticket_mensajes'];
begin
  foreach t in array ticket_tables loop
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = t) then
      execute format('alter table public.%I enable row level security;', t);
      execute format('drop policy if exists "select_all" on public.%I;', t);
      execute format('drop policy if exists "insert_all" on public.%I;', t);
      execute format('drop policy if exists "update_all" on public.%I;', t);
      execute format('create policy "%1$s_select_own" on public.%1$I for select using (auth.uid() = user_id or is_staff());', t);
      execute format('create policy "%1$s_insert_own" on public.%1$I for insert with check (auth.uid() = user_id or is_staff());', t);
      execute format('create policy "%1$s_update_staff" on public.%1$I for update using (is_staff()) with check (is_staff());', t);
    end if;
  end loop;
end $$;
