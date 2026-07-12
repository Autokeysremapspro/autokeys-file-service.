-- =========================================================
-- AK CLOUD — Activar tiempo real en pedidos (v17)
-- Sin esto, la suscripción postgres_changes del navegador no recibe
-- nada — Supabase Realtime solo envía cambios de tablas añadidas
-- explícitamente a la publicación "supabase_realtime".
-- =========================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'file_service_pedidos'
  ) then
    alter publication supabase_realtime add table public.file_service_pedidos;
  end if;
end $$;
