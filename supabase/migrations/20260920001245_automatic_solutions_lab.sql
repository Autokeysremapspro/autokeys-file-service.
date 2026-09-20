-- AK Cloud · Soluciones automáticas (laboratorio)
-- Esta migración se conserva en la rama de desarrollo y NO debe aplicarse a
-- producción hasta que el módulo haya superado las pruebas técnicas.

insert into storage.buckets (id, name, public, file_size_limit)
values ('ak-auto-solutions', 'ak-auto-solutions', false, 67108864)
on conflict (id) do nothing;

create table public.ak_auto_solutions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 140),
  service_code text not null check (service_code ~ '^[a-z0-9][a-z0-9_-]{1,48}$'),
  service_name text not null check (char_length(service_name) between 2 and 100),
  ecu text not null check (char_length(ecu) between 2 and 80),
  hw text,
  sw text,
  vehicle_notes text,
  ori_sha256 text not null check (ori_sha256 ~ '^[a-f0-9]{64}$'),
  ori_size bigint not null check (ori_size > 0 and ori_size <= 67108864),
  ori_bucket text not null default 'ak-auto-solutions',
  ori_path text not null,
  ori_name text not null,
  mod_sha256 text not null check (mod_sha256 ~ '^[a-f0-9]{64}$'),
  mod_size bigint not null check (mod_size > 0 and mod_size <= 67108864),
  mod_bucket text not null default 'ak-auto-solutions',
  mod_path text not null,
  mod_name text not null,
  price numeric(10,2) not null default 44.90 check (price = 44.90),
  status text not null default 'draft' check (status in ('draft', 'testing', 'verified', 'published', 'retired')),
  verification_suite jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  verified_by uuid references auth.users(id),
  verified_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (ori_sha256, service_code)
);

create table public.ak_auto_solution_tests (
  id uuid primary key default gen_random_uuid(),
  solution_id uuid not null references public.ak_auto_solutions(id) on delete cascade,
  test_type text not null check (test_type in ('ori_integrity', 'mod_integrity', 'exact_matching')),
  status text not null check (status in ('passed', 'failed')),
  expected_value text,
  actual_value text,
  notes text,
  tested_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (solution_id, test_type)
);

create table public.ak_auto_solution_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ori_bucket text not null default 'ak-auto-solutions',
  ori_path text not null unique,
  ori_name text not null,
  ori_sha256 text check (ori_sha256 is null or ori_sha256 ~ '^[a-f0-9]{64}$'),
  ori_size bigint check (ori_size is null or (ori_size > 0 and ori_size <= 67108864)),
  status text not null default 'awaiting_upload' check (status in ('awaiting_upload', 'analyzed', 'matched', 'no_match', 'converted_to_order', 'expired')),
  match_count integer not null default 0 check (match_count >= 0),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now(),
  analyzed_at timestamptz
);

create table public.ak_auto_solution_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  solution_id uuid not null references public.ak_auto_solutions(id) on delete restrict,
  scan_id uuid not null references public.ak_auto_solution_scans(id) on delete restrict,
  amount numeric(10,2) not null default 44.90 check (amount = 44.90),
  currency text not null default 'EUR' check (currency = 'EUR'),
  payment_provider text not null check (payment_provider in ('sumup', 'paypal')),
  status text not null default 'awaiting_payment' check (status in ('awaiting_payment', 'paid', 'delivered', 'cancelled', 'failed', 'refunded')),
  paypal_order_id text unique,
  sumup_checkout_id text unique,
  sumup_checkout_reference text unique,
  paid_at timestamptz,
  delivered_at timestamptz,
  download_count integer not null default 0 check (download_count between 0 and 5),
  last_download_at timestamptz,
  legal_version text not null,
  legal_accepted_at timestamptz not null,
  solution_snapshot jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ak_auto_solution_audit (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  solution_id uuid references public.ak_auto_solutions(id) on delete set null,
  order_id uuid references public.ak_auto_solution_orders(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index ak_auto_solutions_match_idx on public.ak_auto_solutions (ori_sha256, ori_size, status);
create index ak_auto_solutions_status_idx on public.ak_auto_solutions (status, updated_at desc);
create index ak_auto_solution_tests_solution_idx on public.ak_auto_solution_tests (solution_id, status);
create index ak_auto_solution_scans_user_idx on public.ak_auto_solution_scans (user_id, created_at desc);
create index ak_auto_solution_scans_expiry_idx on public.ak_auto_solution_scans (expires_at) where status not in ('converted_to_order', 'expired');
create index ak_auto_solution_orders_user_idx on public.ak_auto_solution_orders (user_id, created_at desc);
create index ak_auto_solution_orders_solution_idx on public.ak_auto_solution_orders (solution_id, created_at desc);
create index ak_auto_solution_audit_solution_idx on public.ak_auto_solution_audit (solution_id, created_at desc);
create index ak_auto_solution_audit_order_idx on public.ak_auto_solution_audit (order_id, created_at desc) where order_id is not null;

alter table public.ak_auto_solutions enable row level security;
alter table public.ak_auto_solution_tests enable row level security;
alter table public.ak_auto_solution_scans enable row level security;
alter table public.ak_auto_solution_orders enable row level security;
alter table public.ak_auto_solution_audit enable row level security;

revoke all on table public.ak_auto_solutions from anon, authenticated;
revoke all on table public.ak_auto_solution_tests from anon, authenticated;
revoke all on table public.ak_auto_solution_scans from anon, authenticated;
revoke all on table public.ak_auto_solution_orders from anon, authenticated;
revoke all on table public.ak_auto_solution_audit from anon, authenticated;
revoke all on sequence public.ak_auto_solution_audit_id_seq from anon, authenticated;

comment on table public.ak_auto_solutions is 'Biblioteca privada de pares ORI/MOD verificados para entrega automática exacta.';
comment on table public.ak_auto_solution_orders is 'Compras unitarias de soluciones automáticas a 44,90 EUR.';
comment on column public.ak_auto_solutions.ori_sha256 is 'La coincidencia automática exige igualdad SHA-256 y tamaño; HW/SW solo son informativos.';
