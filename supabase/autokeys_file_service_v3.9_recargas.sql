-- =====================================================
-- AK CLOUD v3.9
-- Recarga manual de créditos
-- =====================================================

create table if not exists ak_creditos_recargas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  nombre_cliente text,
  email_cliente text,
  creditos integer not null default 0,
  importe numeric(10,2) default 0,
  metodo_pago text default 'manual',
  estado text not null default 'pendiente',
  referencia_pago text,
  notas_cliente text,
  notas_admin text,
  aprobada_por uuid,
  aprobada_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table ak_creditos_recargas enable row level security;

-- Durante el desarrollo mantenemos políticas abiertas como el resto del proyecto.
drop policy if exists "ak_creditos_recargas_select_all" on ak_creditos_recargas;
drop policy if exists "ak_creditos_recargas_insert_all" on ak_creditos_recargas;
drop policy if exists "ak_creditos_recargas_update_all" on ak_creditos_recargas;
drop policy if exists "ak_creditos_recargas_delete_all" on ak_creditos_recargas;

create policy "ak_creditos_recargas_select_all"
on ak_creditos_recargas
for select
using (true);

create policy "ak_creditos_recargas_insert_all"
on ak_creditos_recargas
for insert
with check (true);

create policy "ak_creditos_recargas_update_all"
on ak_creditos_recargas
for update
using (true)
with check (true);

create policy "ak_creditos_recargas_delete_all"
on ak_creditos_recargas
for delete
using (true);

create index if not exists idx_ak_creditos_recargas_user_id on ak_creditos_recargas(user_id);
create index if not exists idx_ak_creditos_recargas_estado on ak_creditos_recargas(estado);
create index if not exists idx_ak_creditos_recargas_created_at on ak_creditos_recargas(created_at desc);

-- Asegura que exista la tabla de movimientos de v3.8.
create table if not exists ak_creditos_movimientos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  pedido_id uuid,
  tipo text not null default 'ajuste',
  concepto text,
  creditos integer not null default 0,
  saldo_resultante integer,
  created_at timestamptz default now()
);

alter table ak_creditos_movimientos enable row level security;

drop policy if exists "ak_creditos_movimientos_select_all" on ak_creditos_movimientos;
drop policy if exists "ak_creditos_movimientos_insert_all" on ak_creditos_movimientos;
drop policy if exists "ak_creditos_movimientos_update_all" on ak_creditos_movimientos;
drop policy if exists "ak_creditos_movimientos_delete_all" on ak_creditos_movimientos;

create policy "ak_creditos_movimientos_select_all"
on ak_creditos_movimientos
for select
using (true);

create policy "ak_creditos_movimientos_insert_all"
on ak_creditos_movimientos
for insert
with check (true);

create policy "ak_creditos_movimientos_update_all"
on ak_creditos_movimientos
for update
using (true)
with check (true);

create policy "ak_creditos_movimientos_delete_all"
on ak_creditos_movimientos
for delete
using (true);
