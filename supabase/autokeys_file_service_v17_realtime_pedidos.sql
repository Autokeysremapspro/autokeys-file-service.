-- =========================================================
-- AK CLOUD — Activar tiempo real en pedidos y notificaciones (v17)
-- Sin esto, las suscripciones postgres_changes del navegador no reciben
-- nada — Supabase Realtime solo envía cambios de tablas añadidas
-- explícitamente a la publicación "supabase_realtime".
-- Segura de volver a ejecutar aunque ya hubieras corrido una versión
-- anterior de este archivo (comprueba antes de añadir cada tabla).
-- =========================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'file_service_pedidos'
  ) then
    alter publication supabase_realtime add table public.file_service_pedidos;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'file_service_notificaciones'
  ) then
    alter publication supabase_realtime add table public.file_service_notificaciones;
  end if;
end $$;
