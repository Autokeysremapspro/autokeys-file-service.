-- =====================================================
-- AK CLOUD v4.1
-- Mejora flujo de pagos / recargas manuales
-- Compatible con instalaciones anteriores
-- =====================================================

alter table if exists ak_creditos_recargas
  add column if not exists updated_at timestamptz default now();

create index if not exists idx_ak_creditos_recargas_metodo_pago on ak_creditos_recargas(metodo_pago);
create index if not exists idx_ak_creditos_recargas_user_estado on ak_creditos_recargas(user_id, estado);

-- Asegura notificaciones para avisar al distribuidor cuando se aprueba/rechaza una recarga.
create table if not exists ak_notificaciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  tipo text default 'sistema',
  titulo text not null,
  mensaje text,
  leida boolean default false,
  created_at timestamptz default now()
);

alter table ak_notificaciones enable row level security;

drop policy if exists "ak_notificaciones_select_all" on ak_notificaciones;
drop policy if exists "ak_notificaciones_insert_all" on ak_notificaciones;
drop policy if exists "ak_notificaciones_update_all" on ak_notificaciones;
drop policy if exists "ak_notificaciones_delete_all" on ak_notificaciones;

create policy "ak_notificaciones_select_all"
on ak_notificaciones
for select
using (true);

create policy "ak_notificaciones_insert_all"
on ak_notificaciones
for insert
with check (true);

create policy "ak_notificaciones_update_all"
on ak_notificaciones
for update
using (true)
with check (true);

create policy "ak_notificaciones_delete_all"
on ak_notificaciones
for delete
using (true);

create index if not exists idx_ak_notificaciones_user_id on ak_notificaciones(user_id);
create index if not exists idx_ak_notificaciones_leida on ak_notificaciones(leida);
create index if not exists idx_ak_notificaciones_created_at on ak_notificaciones(created_at desc);
