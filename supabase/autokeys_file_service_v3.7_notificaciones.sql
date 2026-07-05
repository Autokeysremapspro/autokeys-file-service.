-- AK CLOUD v3.7 - Notificaciones en tiempo real

create table if not exists file_service_notificaciones (
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

alter table file_service_notificaciones enable row level security;

drop policy if exists "fs_notif_select" on file_service_notificaciones;
create policy "fs_notif_select"
on file_service_notificaciones
for select
using (true);

drop policy if exists "fs_notif_insert" on file_service_notificaciones;
create policy "fs_notif_insert"
on file_service_notificaciones
for insert
with check (true);

drop policy if exists "fs_notif_update" on file_service_notificaciones;
create policy "fs_notif_update"
on file_service_notificaciones
for update
using (true);

drop policy if exists "fs_notif_delete" on file_service_notificaciones;
create policy "fs_notif_delete"
on file_service_notificaciones
for delete
using (true);

create index if not exists idx_file_service_notificaciones_user_created
on file_service_notificaciones (user_id, created_at desc);

create index if not exists idx_file_service_notificaciones_pedido
on file_service_notificaciones (pedido_id);

create or replace function crear_file_service_notificacion(
  p_user_id uuid,
  p_pedido_id uuid,
  p_titulo text,
  p_mensaje text,
  p_tipo text default 'info',
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_id uuid;
begin
  insert into file_service_notificaciones (user_id, pedido_id, titulo, mensaje, tipo, metadata)
  values (p_user_id, p_pedido_id, p_titulo, p_mensaje, coalesce(p_tipo, 'info'), coalesce(p_metadata, '{}'::jsonb))
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function notificar_cambio_estado_file_service()
returns trigger
language plpgsql
security definer
as $$
begin
  if tg_op = 'UPDATE' and old.estado is distinct from new.estado then
    perform crear_file_service_notificacion(
      new.user_id,
      new.id,
      case
        when new.estado = 'en_proceso' then 'Tu pedido está en proceso'
        when new.estado = 'finalizado' then 'Archivo MOD listo para descargar'
        when new.estado = 'cancelado' then 'Pedido cancelado'
        else 'Estado del pedido actualizado'
      end,
      coalesce(new.numero, 'Pedido') || ' · ' || coalesce(new.ecu, 'ECU pendiente'),
      case
        when new.estado = 'finalizado' then 'success'
        when new.estado = 'cancelado' then 'danger'
        when new.estado = 'en_proceso' then 'info'
        else 'warning'
      end,
      jsonb_build_object('estado', new.estado, 'numero', new.numero)
    );
  end if;

  if tg_op = 'UPDATE' and old.mod_path is distinct from new.mod_path and new.mod_path is not null then
    perform crear_file_service_notificacion(
      new.user_id,
      new.id,
      'Tu archivo está listo',
      coalesce(new.mod_nombre, 'Archivo MOD') || ' ya está disponible para descargar.',
      'success',
      jsonb_build_object('mod_path', new.mod_path, 'numero', new.numero)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_file_service_notificar_estado on file_service_pedidos;
create trigger trg_file_service_notificar_estado
after update on file_service_pedidos
for each row
execute function notificar_cambio_estado_file_service();
