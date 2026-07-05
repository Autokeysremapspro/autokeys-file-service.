-- AK Cloud v3.6 - Chat técnico por pedido

create table if not exists file_service_mensajes (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references file_service_pedidos(id) on delete cascade,
  user_id uuid null,
  autor_nombre text null,
  autor_tipo text not null default 'cliente',
  mensaje text not null,
  leido boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_file_service_mensajes_pedido_id on file_service_mensajes(pedido_id);
create index if not exists idx_file_service_mensajes_created_at on file_service_mensajes(created_at);

alter table file_service_mensajes enable row level security;

drop policy if exists "fs_mensajes_select_all" on file_service_mensajes;
create policy "fs_mensajes_select_all"
on file_service_mensajes
for select
using (true);

drop policy if exists "fs_mensajes_insert_all" on file_service_mensajes;
create policy "fs_mensajes_insert_all"
on file_service_mensajes
for insert
with check (true);

drop policy if exists "fs_mensajes_update_all" on file_service_mensajes;
create policy "fs_mensajes_update_all"
on file_service_mensajes
for update
using (true);

drop policy if exists "fs_mensajes_delete_all" on file_service_mensajes;
create policy "fs_mensajes_delete_all"
on file_service_mensajes
for delete
using (true);
