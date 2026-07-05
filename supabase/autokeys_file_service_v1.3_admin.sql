alter table if exists file_service_pedidos
add column if not exists urgente boolean default false,
add column if not exists notas_internas text,
add column if not exists mod_bucket text,
add column if not exists mod_path text,
add column if not exists mod_nombre text,
add column if not exists updated_at timestamptz default now();

alter table file_service_pedidos enable row level security;

drop policy if exists "fs_admin_all_v13" on file_service_pedidos;
create policy "fs_admin_all_v13"
on file_service_pedidos
for all
using (true)
with check (true);
