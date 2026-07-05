-- =========================================================
-- AUTOKEYS FILE SERVICE v1.2
-- Pedidos reales + Storage ORI/MOD
-- =========================================================

create extension if not exists pgcrypto;

create table if not exists file_service_pedidos (
  id uuid primary key default gen_random_uuid(),
  numero text unique,
  user_id uuid,
  cliente_nombre text,
  cliente_email text,
  marca text,
  modelo text,
  motor text,
  anio text,
  ecu text,
  hw text,
  sw text,
  cv text,
  cambio text,
  servicios text[] default '{}',
  observaciones text,
  estado text not null default 'pendiente',
  prioridad text not null default 'normal',
  ori_nombre text,
  ori_bucket text,
  ori_path text,
  ori_size bigint,
  mod_nombre text,
  mod_bucket text,
  mod_path text,
  precio numeric(10,2) default 0,
  pagado boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_file_service_pedidos_user_id on file_service_pedidos(user_id);
create index if not exists idx_file_service_pedidos_estado on file_service_pedidos(estado);
create index if not exists idx_file_service_pedidos_created_at on file_service_pedidos(created_at desc);

create or replace function set_file_service_pedido_numero()
returns trigger as $$
declare
  next_num integer;
begin
  if new.numero is null or new.numero = '' then
    select coalesce(max((regexp_replace(numero, '^FS-[0-9]{4}-', ''))::integer), 0) + 1
    into next_num
    from file_service_pedidos
    where numero like 'FS-' || to_char(now(), 'YYYY') || '-%';

    new.numero := 'FS-' || to_char(now(), 'YYYY') || '-' || lpad(next_num::text, 5, '0');
  end if;

  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_file_service_pedido_numero on file_service_pedidos;
create trigger trg_file_service_pedido_numero
before insert or update on file_service_pedidos
for each row execute function set_file_service_pedido_numero();

alter table file_service_pedidos enable row level security;

drop policy if exists "fs_select_own_or_all" on file_service_pedidos;
create policy "fs_select_own_or_all"
on file_service_pedidos
for select
using (auth.uid() = user_id or true);

-- Durante desarrollo dejamos permisos abiertos. Más adelante los cerraremos por rol.
drop policy if exists "fs_insert_all" on file_service_pedidos;
create policy "fs_insert_all"
on file_service_pedidos
for insert
with check (true);

drop policy if exists "fs_update_all" on file_service_pedidos;
create policy "fs_update_all"
on file_service_pedidos
for update
using (true);

drop policy if exists "fs_delete_all" on file_service_pedidos;
create policy "fs_delete_all"
on file_service_pedidos
for delete
using (true);

-- Storage bucket para ORI/MOD
insert into storage.buckets (id, name, public)
values ('file-service', 'file-service', false)
on conflict (id) do nothing;

drop policy if exists "file_service_storage_select" on storage.objects;
create policy "file_service_storage_select"
on storage.objects
for select
using (bucket_id = 'file-service');

drop policy if exists "file_service_storage_insert" on storage.objects;
create policy "file_service_storage_insert"
on storage.objects
for insert
with check (bucket_id = 'file-service');

drop policy if exists "file_service_storage_update" on storage.objects;
create policy "file_service_storage_update"
on storage.objects
for update
using (bucket_id = 'file-service');

drop policy if exists "file_service_storage_delete" on storage.objects;
create policy "file_service_storage_delete"
on storage.objects
for delete
using (bucket_id = 'file-service');
