-- AK Cloud v7.2 - Sync configuración desde Autokeys Core
-- Seguro de ejecutar varias veces. Crea/asegura tablas compartidas para que AK Cloud lea planes, servicios, pagos y reglas desde Core.

create table if not exists public.akcloud_servicios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text unique not null,
  categoria text not null default 'reprogramacion',
  descripcion text,
  precio numeric(10,2) not null default 0,
  creditos integer not null default 0,
  icono text default '⚙️',
  activo boolean not null default true,
  orden integer not null default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.akcloud_planes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text unique not null,
  descripcion text,
  precio_mensual numeric(10,2) not null default 0,
  creditos_mes integer not null default 0,
  ventajas text[] default '{}',
  destacado boolean not null default false,
  activo boolean not null default true,
  orden integer not null default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.akcloud_metodos_pago (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  nombre text not null,
  descripcion text,
  activo boolean not null default true,
  automatico boolean not null default false,
  instrucciones text,
  orden integer not null default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.akcloud_reglas_precios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  servicio_principal_slug text not null,
  servicios_gratis text[] not null default '{}',
  descuentos jsonb not null default '{}'::jsonb,
  solo_planes text[] not null default '{}',
  solo_distribuidores uuid[] not null default '{}',
  activo boolean not null default true,
  orden integer not null default 100,
  nota text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists akcloud_servicios_slug_idx on public.akcloud_servicios(slug);
create index if not exists akcloud_servicios_activo_idx on public.akcloud_servicios(activo);
create index if not exists akcloud_planes_slug_idx on public.akcloud_planes(slug);
create index if not exists akcloud_planes_activo_idx on public.akcloud_planes(activo);
create index if not exists akcloud_reglas_precios_principal_idx on public.akcloud_reglas_precios(servicio_principal_slug);
create index if not exists akcloud_reglas_precios_activo_idx on public.akcloud_reglas_precios(activo);

alter table public.akcloud_servicios enable row level security;
alter table public.akcloud_planes enable row level security;
alter table public.akcloud_metodos_pago enable row level security;
alter table public.akcloud_reglas_precios enable row level security;

drop policy if exists "akcloud_servicios_read" on public.akcloud_servicios;
create policy "akcloud_servicios_read" on public.akcloud_servicios for select using (true);

drop policy if exists "akcloud_planes_read" on public.akcloud_planes;
create policy "akcloud_planes_read" on public.akcloud_planes for select using (true);

drop policy if exists "akcloud_metodos_pago_read" on public.akcloud_metodos_pago;
create policy "akcloud_metodos_pago_read" on public.akcloud_metodos_pago for select using (true);

drop policy if exists "akcloud_reglas_precios_read" on public.akcloud_reglas_precios;
create policy "akcloud_reglas_precios_read" on public.akcloud_reglas_precios for select using (true);

-- Policies de escritura abiertas para mantener compatibilidad con el admin interno de Core.
-- Si después quieres cerrarlo a roles admin, lo hacemos con RLS por usuarios.
drop policy if exists "akcloud_servicios_write" on public.akcloud_servicios;
create policy "akcloud_servicios_write" on public.akcloud_servicios for all using (true) with check (true);

drop policy if exists "akcloud_planes_write" on public.akcloud_planes;
create policy "akcloud_planes_write" on public.akcloud_planes for all using (true) with check (true);

drop policy if exists "akcloud_metodos_pago_write" on public.akcloud_metodos_pago;
create policy "akcloud_metodos_pago_write" on public.akcloud_metodos_pago for all using (true) with check (true);

drop policy if exists "akcloud_reglas_precios_write" on public.akcloud_reglas_precios;
create policy "akcloud_reglas_precios_write" on public.akcloud_reglas_precios for all using (true) with check (true);

insert into public.akcloud_servicios (nombre, slug, categoria, descripcion, precio, creditos, icono, orden)
values
  ('Stage 1', 'stage-1', 'Reprogramación', 'Optimización de potencia segura para uso diario.', 40, 40, '🚀', 10),
  ('Stage 2', 'stage-2', 'Reprogramación', 'Calibración avanzada para vehículos con hardware modificado.', 65, 65, '🏁', 20),
  ('DPF OFF', 'dpf-off', 'Anticontaminación', 'Solución para sistema DPF según solicitud del profesional.', 35, 35, '🚫', 30),
  ('EGR OFF', 'egr-off', 'Anticontaminación', 'Solución para sistema EGR según solicitud del profesional.', 25, 25, '🌿', 40),
  ('AdBlue OFF', 'adblue-off', 'Anticontaminación', 'Solución SCR / AdBlue.', 45, 45, '💧', 50),
  ('IMMO OFF', 'immo-off', 'Electrónica', 'Solución inmovilizador para trabajos de laboratorio.', 50, 50, '🔑', 60),
  ('Pops & Bangs', 'pops-bangs', 'Opciones racing', 'Configuración de petardeo bajo solicitud.', 30, 30, '💥', 70),
  ('Hardcut', 'hardcut', 'Opciones racing', 'Limitador tipo hardcut según configuración solicitada.', 25, 25, '🍿', 80),
  ('Launch Control', 'launch-control', 'Opciones racing', 'Salida asistida bajo configuración técnica.', 30, 30, '🏁', 90),
  ('Start/Stop OFF', 'start-stop-off', 'Opciones técnicas', 'Desactivación Start/Stop.', 15, 15, '⏱️', 100)
on conflict (slug) do nothing;

insert into public.akcloud_planes (nombre, slug, descripcion, precio_mensual, creditos_mes, ventajas, destacado, orden)
values
  ('Starter', 'starter', 'Para distribuidores que empiezan a trabajar con AK Cloud.', 29, 100, array['100 créditos','Soporte estándar','Historial de pedidos'], false, 10),
  ('PRO', 'pro', 'Plan recomendado para talleres activos.', 59, 250, array['250 créditos','Prioridad media','Soporte preferente'], true, 20),
  ('Elite', 'elite', 'Para distribuidores con alto volumen de trabajos.', 149, 700, array['700 créditos','Prioridad máxima','Soporte premium'], false, 30)
on conflict (slug) do nothing;

insert into public.akcloud_metodos_pago (codigo, nombre, descripcion, activo, automatico, instrucciones, orden)
values
  ('paypal', 'PayPal / Tarjeta', 'Pago automático mediante PayPal Checkout.', true, true, 'El cliente paga online y los créditos se activan automáticamente.', 10),
  ('bizum', 'Bizum', 'Pago manual mediante Bizum.', true, false, 'Envía Bizum al número configurado e indica tu email de AK Cloud como concepto.', 20),
  ('transferencia', 'Transferencia bancaria', 'Pago manual por transferencia.', true, false, 'Realiza transferencia y añade el justificante o referencia.', 30)
on conflict (codigo) do nothing;

insert into public.akcloud_reglas_precios (nombre, servicio_principal_slug, servicios_gratis, activo, orden, nota)
values
  ('Stage 1 incluye extras básicos', 'stage-1', array['egr-off','start-stop-off'], true, 10, 'Ejemplo inicial configurable desde Core.'),
  ('Stage 2 incluye opciones racing', 'stage-2', array['hardcut','launch-control'], true, 20, 'Ejemplo inicial configurable desde Core.')
on conflict do nothing;
