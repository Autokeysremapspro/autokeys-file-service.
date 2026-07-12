-- =========================================================
-- AK CLOUD — Políticas de Storage para el bucket 'file-service'
-- Ejecutar en el mismo proyecto Supabase, después de los
-- parches anteriores (usa is_staff()).
--
-- ANTES de ejecutar esto, comprueba en Supabase → Storage →
-- bucket "file-service" → que NO esté marcado como "Public bucket".
-- Si lo está, cualquiera con la URL puede leer los archivos sin
-- pasar por estas políticas — desmárcalo primero.
-- =========================================================

-- Estructura de rutas real usada por el código:
--   ORI:  ori/{auth.uid()}/{timestamp}-{nombre}
--   MOD:  {numero_pedido}/MOD/{timestamp}-{nombre}   (subido solo por staff)
-- Como el MOD no lleva el user_id en la ruta, la propiedad se resuelve
-- consultando file_service_pedidos (que sí sabe de quién es cada pedido).

drop policy if exists "file_service_select" on storage.objects;
drop policy if exists "file_service_insert_own" on storage.objects;
drop policy if exists "file_service_insert_staff" on storage.objects;
drop policy if exists "file_service_update_staff" on storage.objects;
drop policy if exists "file_service_delete_staff" on storage.objects;

-- Lectura: el distribuidor solo ve los archivos (ORI o MOD) de SUS PROPIOS
-- pedidos; el staff ve todo.
create policy "file_service_select" on storage.objects
for select using (
  bucket_id = 'file-service'
  and (
    is_staff()
    or exists (
      select 1 from public.file_service_pedidos p
      where p.user_id = auth.uid()
        and (p.ori_path = storage.objects.name or p.mod_path = storage.objects.name)
    )
  )
);

-- Subida de ORI: el propio distribuidor puede subir a su propia carpeta
-- ori/{su-uid}/... — nunca a la carpeta de otro.
create policy "file_service_insert_own" on storage.objects
for insert with check (
  bucket_id = 'file-service'
  and (storage.foldername(name))[1] = 'ori'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Subida de MOD (y cualquier otra escritura administrativa): solo staff.
create policy "file_service_insert_staff" on storage.objects
for insert with check (
  bucket_id = 'file-service' and is_staff()
);

create policy "file_service_update_staff" on storage.objects
for update using (bucket_id = 'file-service' and is_staff())
with check (bucket_id = 'file-service' and is_staff());

create policy "file_service_delete_staff" on storage.objects
for delete using (bucket_id = 'file-service' and is_staff());
