-- Allow a professional to submit a new request after a previous rejection.
-- Pending, information-requested and approved records remain deduplicated.

create or replace function public.akcloud_handle_new_distributor_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_email text := lower(coalesce(new.email, ''));
  v_empresa text := nullif(btrim(meta->>'empresa'), '');
  v_nombre text := nullif(btrim(meta->>'nombre'), '');
begin
  if coalesce(meta->>'tipo_usuario', '') <> 'distribuidor' or v_email = '' then
    return new;
  end if;

  if not exists (
    select 1
    from public.akcloud_solicitudes_distribuidores s
    where s.auth_user_id = new.id
       or (
         lower(s.email) = v_email
         and s.estado in ('pendiente', 'informacion_solicitada', 'aprobada')
       )
  ) then
    insert into public.akcloud_solicitudes_distribuidores (
      auth_user_id,
      email,
      empresa,
      nombre,
      telefono,
      ciudad,
      observaciones,
      estado,
      updated_at
    ) values (
      new.id,
      v_email,
      coalesce(v_empresa, 'Sin empresa'),
      coalesce(v_nombre, v_empresa, 'Nuevo distribuidor'),
      nullif(btrim(meta->>'telefono'), ''),
      nullif(btrim(meta->>'ciudad'), ''),
      nullif(btrim(meta->>'mensaje'), ''),
      'pendiente',
      now()
    );
  end if;

  return new;
end;
$$;

revoke all on function public.akcloud_handle_new_distributor_signup() from public;
revoke all on function public.akcloud_handle_new_distributor_signup() from anon;
revoke all on function public.akcloud_handle_new_distributor_signup() from authenticated;

drop trigger if exists trg_akcloud_auth_signup_intake on auth.users;
create trigger trg_akcloud_auth_signup_intake
after insert on auth.users
for each row
execute function public.akcloud_handle_new_distributor_signup();

-- Recover recent registrations that were hidden by an older rejected request.
insert into public.akcloud_solicitudes_distribuidores (
  auth_user_id,
  email,
  empresa,
  nombre,
  telefono,
  ciudad,
  observaciones,
  estado,
  updated_at
)
select
  u.id,
  lower(u.email),
  coalesce(nullif(btrim(u.raw_user_meta_data->>'empresa'), ''), 'Sin empresa'),
  coalesce(
    nullif(btrim(u.raw_user_meta_data->>'nombre'), ''),
    nullif(btrim(u.raw_user_meta_data->>'empresa'), ''),
    'Nuevo distribuidor'
  ),
  nullif(btrim(u.raw_user_meta_data->>'telefono'), ''),
  nullif(btrim(u.raw_user_meta_data->>'ciudad'), ''),
  nullif(btrim(u.raw_user_meta_data->>'mensaje'), ''),
  'pendiente',
  now()
from auth.users u
where u.created_at >= now() - interval '30 days'
  and coalesce(u.raw_user_meta_data->>'tipo_usuario', '') = 'distribuidor'
  and coalesce(u.email, '') <> ''
  and not exists (
    select 1
    from public.akcloud_solicitudes_distribuidores s
    where s.auth_user_id = u.id
       or (
         lower(s.email) = lower(u.email)
         and s.estado in ('pendiente', 'informacion_solicitada', 'aprobada')
       )
  );
