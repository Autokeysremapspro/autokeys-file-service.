-- =========================================================
-- AK CLOUD — Barrido completo de RLS (v15)
-- Igual que pasó en Core (v11): el primer parche (v10) usó una
-- lista de tablas elegida a mano y se dejó fuera varias más —
-- incluyendo el catálogo de precios, que tenía escritura TOTALMENTE
-- abierta (cualquiera, incluso sin sesión, podía cambiar precios,
-- planes y reglas de descuento). Aquí se borra CUALQUIER política
-- existente en cada tabla (sea cual sea su nombre) antes de crear
-- las nuevas, así no importa con qué migración se creó originalmente.
-- Ejecutar después de v10, v11, v13, v14. Reutiliza is_staff().
-- =========================================================

-- ---------------------------------------------------------
-- 1) Catálogo (servicios, planes, métodos de pago, reglas de precio):
--    lectura para cualquier distribuidor logueado, escritura SOLO staff.
--    Antes: escritura abierta a cualquiera con "for all using(true)".
-- ---------------------------------------------------------
do $$
declare
  t text;
  pol record;
  catalog_tables text[] := array[
    'akcloud_servicios', 'akcloud_planes', 'akcloud_metodos_pago', 'akcloud_reglas_precios'
  ];
begin
  foreach t in array catalog_tables loop
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = t) then
      execute format('alter table public.%I enable row level security;', t);
      for pol in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
        execute format('drop policy if exists %I on public.%I;', pol.policyname, t);
      end loop;
      execute format('create policy "%1$s_select_auth" on public.%1$I for select using (auth.role() = ''authenticated'');', t);
      execute format('create policy "%1$s_write_staff" on public.%1$I for all using (is_staff()) with check (is_staff());', t);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------
-- 2) file_service_pedidos: caso especial. La creación real de
--    pedidos pasa por /api/pedidos/crear (service_role), que calcula
--    precio y descuenta créditos — un distribuidor NUNCA debe poder
--    insertar aquí directo desde el navegador (se saltaría el cobro).
--    Solo staff inserta/edita manualmente desde el panel admin.
-- ---------------------------------------------------------
do $$
declare
  pol record;
begin
  alter table public.file_service_pedidos enable row level security;
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'file_service_pedidos' loop
    execute format('drop policy if exists %I on public.file_service_pedidos;', pol.policyname);
  end loop;
  create policy "file_service_pedidos_select_own" on public.file_service_pedidos
    for select using (auth.uid() = user_id or is_staff());
  create policy "file_service_pedidos_insert_staff" on public.file_service_pedidos
    for insert with check (is_staff());
  create policy "file_service_pedidos_update_staff" on public.file_service_pedidos
    for update using (is_staff()) with check (is_staff());
end $$;

-- ---------------------------------------------------------
-- 3) Resto de tablas propias de AK Cloud: cada uno ve lo suyo,
--    solo staff escribe/gestiona. Se aplica el mismo barrido
--    dinámico para no depender de adivinar nombres de política.
-- ---------------------------------------------------------
do $$
declare
  t text;
  pol record;
  own_tables text[] := array[
    'file_service_notificaciones', 'ak_creditos_recargas', 'ak_paypal_pagos',
    'ak_ecu_detection_rules', 'ak_ecu_fingerprints', 'akcloud_tickets'
  ];
begin
  foreach t in array own_tables loop
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = t) then
      execute format('alter table public.%I enable row level security;', t);
      for pol in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
        execute format('drop policy if exists %I on public.%I;', pol.policyname, t);
      end loop;

      if t in ('ak_ecu_detection_rules', 'ak_ecu_fingerprints') then
        -- Catálogo técnico: cualquier distribuidor logueado lee, solo staff escribe.
        execute format('create policy "%1$s_select_auth" on public.%1$I for select using (auth.role() = ''authenticated'');', t);
        execute format('create policy "%1$s_write_staff" on public.%1$I for insert with check (is_staff());', t);
        execute format('create policy "%1$s_update_staff" on public.%1$I for update using (is_staff()) with check (is_staff());', t);
      elsif t = 'ak_paypal_pagos' then
        -- Registro de pagos: solo lectura propia, nunca escritura desde el navegador
        -- (los pagos los confirma el webhook con service_role).
        execute format('create policy "%1$s_select_own" on public.%1$I for select using (auth.uid() = user_id or is_staff());', t);
      else
        execute format('create policy "%1$s_select_own" on public.%1$I for select using (auth.uid() = user_id or is_staff());', t);
        execute format('create policy "%1$s_insert_own_or_staff" on public.%1$I for insert with check (auth.uid() = user_id or is_staff());', t);
        execute format('create policy "%1$s_update_staff" on public.%1$I for update using (is_staff()) with check (is_staff());', t);
      end if;
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------
-- 4) ak_creditos_movimientos: caso especial, igual que pedidos.
--    El saldo de créditos NUNCA debe poder tocarse insertando
--    directo desde el navegador — todo movimiento real pasa por
--    /api/pedidos/crear o las rutas de Core (recargas, ajustes),
--    que usan service_role. Un distribuidor solo puede LEER los suyos.
-- ---------------------------------------------------------
do $$
declare
  pol record;
begin
  alter table public.ak_creditos_movimientos enable row level security;
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'ak_creditos_movimientos' loop
    execute format('drop policy if exists %I on public.ak_creditos_movimientos;', pol.policyname);
  end loop;
  create policy "ak_creditos_movimientos_select_own" on public.ak_creditos_movimientos
    for select using (auth.uid() = user_id or is_staff());
  create policy "ak_creditos_movimientos_insert_staff" on public.ak_creditos_movimientos
    for insert with check (is_staff());
  create policy "ak_creditos_movimientos_update_staff" on public.ak_creditos_movimientos
    for update using (is_staff()) with check (is_staff());
end $$;

-- ---------------------------------------------------------
-- 5) Mensajería con "dueño" en otra tabla, no en la propia fila:
--    file_service_mensajes (chat de pedido) y akcloud_ticket_mensajes
--    guardan el user_id de quien ESCRIBE cada mensaje — que puede ser
--    un técnico, no el distribuidor. Filtrar por "auth.uid() = user_id"
--    haría invisibles las respuestas del staff para el distribuidor.
--    Aquí se comprueba la propiedad a través del pedido/ticket real.
-- ---------------------------------------------------------
do $$
declare
  pol record;
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'file_service_mensajes') then
    alter table public.file_service_mensajes enable row level security;
    for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'file_service_mensajes' loop
      execute format('drop policy if exists %I on public.file_service_mensajes;', pol.policyname);
    end loop;
    create policy "file_service_mensajes_select" on public.file_service_mensajes
      for select using (
        is_staff() or exists (
          select 1 from public.file_service_pedidos p
          where p.id = file_service_mensajes.pedido_id and p.user_id = auth.uid()
        )
      );
    create policy "file_service_mensajes_insert" on public.file_service_mensajes
      for insert with check (
        is_staff() or exists (
          select 1 from public.file_service_pedidos p
          where p.id = file_service_mensajes.pedido_id and p.user_id = auth.uid()
        )
      );
  end if;

  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'akcloud_ticket_mensajes') then
    alter table public.akcloud_ticket_mensajes enable row level security;
    for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'akcloud_ticket_mensajes' loop
      execute format('drop policy if exists %I on public.akcloud_ticket_mensajes;', pol.policyname);
    end loop;
    create policy "akcloud_ticket_mensajes_select" on public.akcloud_ticket_mensajes
      for select using (
        is_staff() or exists (
          select 1 from public.akcloud_tickets tk
          where tk.id = akcloud_ticket_mensajes.ticket_id and tk.user_id = auth.uid()
        )
      );
    create policy "akcloud_ticket_mensajes_insert" on public.akcloud_ticket_mensajes
      for insert with check (
        is_staff() or exists (
          select 1 from public.akcloud_tickets tk
          where tk.id = akcloud_ticket_mensajes.ticket_id and tk.user_id = auth.uid()
        )
      );
  end if;
end $$;

-- ---------------------------------------------------------
-- 6) Nota
-- ---------------------------------------------------------
-- Con este archivo, file_service_pedidos ya queda con la política
-- correcta (solo staff inserta) sin depender de en qué orden
-- ejecutes esta migración respecto a v14 — puedes ejecutar v14 y
-- v15 en cualquier orden entre sí, el resultado final es el mismo.
