-- AK Cloud: create distributor intake at auth signup time.
-- This makes registration independent from an authenticated browser session,
-- which does not exist yet when Supabase email confirmation is enabled.

create or replace function public.akcloud_handle_new_distributor_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_email text := lower(coalesce(new.email, ''));
  v_empresa text := nullif(btrim(meta->>'empresa'), '');
  v_nombre text := nullif(btrim(meta->>'nombre'), '');
begin
  if coalesce(meta->>'tipo_usuario', '') <> 'distribuidor' then
    return new;
  end if;

  if v_email = '' then
    return new;
  end if;

  if not exists (
    select 1
    from public.akcloud_solicitudes_distribuidores s
    where s.auth_user_id = new.id
       or lower(s.email) = v_email
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
