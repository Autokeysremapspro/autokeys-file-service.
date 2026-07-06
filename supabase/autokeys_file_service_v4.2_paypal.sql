-- =====================================================
-- AK Cloud v4.2 - PayPal Checkout automático
-- =====================================================

alter table if exists public.ak_creditos_recargas
add column if not exists paypal_order_id text;

alter table if exists public.ak_creditos_recargas
add column if not exists paypal_capture_id text;

alter table if exists public.ak_creditos_recargas
add column if not exists pagada_at timestamptz;

create table if not exists public.ak_paypal_pagos (
  id uuid primary key default gen_random_uuid(),
  recarga_id uuid null references public.ak_creditos_recargas(id) on delete set null,
  user_id uuid null references auth.users(id) on delete set null,
  paypal_order_id text unique,
  paypal_capture_id text,
  estado text not null default 'created',
  pack_key text,
  creditos numeric not null default 0,
  importe numeric(10,2) not null default 0,
  currency text not null default 'EUR',
  raw_order jsonb,
  raw_capture jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ak_paypal_pagos enable row level security;

drop policy if exists "ak_paypal_pagos_select_all" on public.ak_paypal_pagos;
drop policy if exists "ak_paypal_pagos_insert_all" on public.ak_paypal_pagos;
drop policy if exists "ak_paypal_pagos_update_all" on public.ak_paypal_pagos;
drop policy if exists "ak_paypal_pagos_delete_all" on public.ak_paypal_pagos;

create policy "ak_paypal_pagos_select_all"
on public.ak_paypal_pagos
for select
using (true);

create policy "ak_paypal_pagos_insert_all"
on public.ak_paypal_pagos
for insert
with check (true);

create policy "ak_paypal_pagos_update_all"
on public.ak_paypal_pagos
for update
using (true)
with check (true);

create policy "ak_paypal_pagos_delete_all"
on public.ak_paypal_pagos
for delete
using (true);

create index if not exists idx_ak_paypal_pagos_user_created on public.ak_paypal_pagos(user_id, created_at desc);
create index if not exists idx_ak_paypal_pagos_estado on public.ak_paypal_pagos(estado);
create index if not exists idx_ak_paypal_pagos_order on public.ak_paypal_pagos(paypal_order_id);

-- Asegura tabla de notificaciones si no se ejecutó v3.7.
create table if not exists public.file_service_notificaciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  pedido_id uuid null,
  titulo text not null,
  mensaje text null,
  tipo text not null default 'info',
  leida boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.file_service_notificaciones enable row level security;

drop policy if exists "fs_notif_select" on public.file_service_notificaciones;
create policy "fs_notif_select" on public.file_service_notificaciones for select using (true);

drop policy if exists "fs_notif_insert" on public.file_service_notificaciones;
create policy "fs_notif_insert" on public.file_service_notificaciones for insert with check (true);

drop policy if exists "fs_notif_update" on public.file_service_notificaciones;
create policy "fs_notif_update" on public.file_service_notificaciones for update using (true) with check (true);

-- Conviene crear esta variable en Vercel:
-- SUPABASE_SERVICE_ROLE_KEY = Service role key del mismo proyecto Supabase
-- PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET / PAYPAL_WEBHOOK_ID / PAYPAL_ENV=live
