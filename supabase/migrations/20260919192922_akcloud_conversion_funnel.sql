-- Embudo de conversión de AK Cloud.
-- La tabla no se expone al navegador: todos los eventos entran por rutas
-- servidoras con validación y las métricas solo las consulta el personal.

create table if not exists public.akcloud_conversion_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (event_name in (
    'landing_view',
    'register_cta',
    'register_view',
    'registration_completed',
    'email_confirmed',
    'login_completed',
    'dashboard_view',
    'first_order_started',
    'checkout_started',
    'payment_completed'
  )),
  actor_key text not null,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  page_path text,
  source text,
  medium text,
  campaign text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (actor_key, event_name)
);

alter table public.akcloud_conversion_events enable row level security;

revoke all on table public.akcloud_conversion_events from anon, authenticated;

create policy "conversion events deny direct access"
  on public.akcloud_conversion_events
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);

create index if not exists akcloud_conversion_events_created_at_idx
  on public.akcloud_conversion_events (created_at desc);
create index if not exists akcloud_conversion_events_event_created_idx
  on public.akcloud_conversion_events (event_name, created_at desc);
create index if not exists akcloud_conversion_events_user_idx
  on public.akcloud_conversion_events (user_id)
  where user_id is not null;
create index if not exists akcloud_conversion_events_campaign_idx
  on public.akcloud_conversion_events (campaign, created_at desc)
  where campaign is not null;

comment on table public.akcloud_conversion_events is
  'Hitos únicos del embudo comercial de AK Cloud; acceso exclusivo desde servidor.';
