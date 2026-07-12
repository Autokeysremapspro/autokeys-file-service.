-- =========================================================
-- AK CLOUD — Analizador ECU v2: huella exacta + potencia/par/motor
-- Ejecutar en el mismo proyecto Supabase, después de los
-- parches de seguridad anteriores (usa is_staff()).
-- =========================================================

-- ---------------------------------------------------------
-- 1) Ampliar la base de datos ECU con par motor (ya existía "potencia" y "motor")
-- ---------------------------------------------------------
alter table public.ak_ecu_detection_rules
  add column if not exists par_nm text; -- ej: "250-400 Nm"

alter table public.ak_ecu_detection_rules
  add column if not exists potencia_stage1 text; -- ej: "150-230 CV" (potencia orientativa tras Stage 1)

-- ---------------------------------------------------------
-- 2) Tabla de huellas exactas — el corazón del analizador v2.
--    Cada fila = un archivo real ya identificado y confirmado por un técnico.
--    La próxima vez que llegue el MISMO archivo (mismo hash), se identifica
--    al instante con 99% de confianza, sin depender de heurística.
-- ---------------------------------------------------------
create table if not exists public.ak_ecu_fingerprints (
  id uuid primary key default gen_random_uuid(),
  sha256 text not null unique,
  rule_id uuid references public.ak_ecu_detection_rules(id) on delete set null,
  vehiculo text,
  ecu text,
  marca text,
  modelo text,
  motor text,
  hw text,
  sw text,
  file_size bigint,
  confirmado_por uuid references auth.users(id) on delete set null,
  pedido_id uuid references public.file_service_pedidos(id) on delete set null,
  veces_visto integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ak_ecu_fingerprints_sha256 on public.ak_ecu_fingerprints(sha256);

alter table public.ak_ecu_fingerprints enable row level security;

drop policy if exists "ak_ecu_fingerprints_select_auth" on public.ak_ecu_fingerprints;
drop policy if exists "ak_ecu_fingerprints_write_staff" on public.ak_ecu_fingerprints;

-- Cualquier distribuidor logueado puede consultar huellas (para la detección
-- instantánea al subir un archivo), pero solo staff/rutas server confirman nuevas.
create policy "ak_ecu_fingerprints_select_auth" on public.ak_ecu_fingerprints
  for select using (auth.role() = 'authenticated');

create policy "ak_ecu_fingerprints_write_staff" on public.ak_ecu_fingerprints
  for insert with check (is_staff());

create policy "ak_ecu_fingerprints_update_staff" on public.ak_ecu_fingerprints
  for update using (is_staff()) with check (is_staff());
