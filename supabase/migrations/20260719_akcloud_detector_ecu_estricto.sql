-- AK Cloud · Detector ECU estricto y aprendizaje validado
-- Ejecutar una sola vez en Supabase SQL Editor.

create table if not exists public.ak_ecu_verified_signatures (
  id uuid primary key default gen_random_uuid(),
  signature_key text not null unique,
  hw_normalized text not null,
  sw_normalized text not null,
  file_size bigint not null check (file_size > 0),
  ecu text not null,
  vehiculo text,
  marca text,
  modelo text,
  motor text,
  confirmaciones integer not null default 1 check (confirmaciones >= 1),
  activo boolean not null default true,
  ultima_confirmacion_por uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ak_ecu_verified_signatures_lookup_idx
  on public.ak_ecu_verified_signatures (hw_normalized, sw_normalized, file_size, activo, confirmaciones desc);

alter table public.ak_ecu_verified_signatures enable row level security;

-- No se expone la base de aprendizaje al cliente. El acceso se hace exclusivamente
-- desde las rutas de servidor con service role y la confirmación exige usuario staff.
revoke all on table public.ak_ecu_verified_signatures from anon, authenticated;

comment on table public.ak_ecu_verified_signatures is
  'Firmas ECU aprendidas únicamente tras confirmaciones humanas del laboratorio. No usar como coincidencia si hay ambigüedad.';
