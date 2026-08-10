-- AK Cloud hardening v1
-- Review in Supabase SQL editor before applying to production.
-- Goal: client isolation for orders/chat and private file-service storage.

begin;

alter table public.file_service_pedidos enable row level security;
alter table public.file_service_mensajes enable row level security;

-- Orders: clients can only read their own orders.
drop policy if exists "akcloud_client_read_own_orders" on public.file_service_pedidos;
create policy "akcloud_client_read_own_orders"
on public.file_service_pedidos
for select
to authenticated
using (user_id = auth.uid());

-- Do not grant client INSERT/UPDATE/DELETE here. Order creation/payment and
-- laboratory changes should go through trusted server/admin paths.

-- Chat: a client may read messages only when the parent order belongs to them.
drop policy if exists "akcloud_client_read_own_messages" on public.file_service_mensajes;
create policy "akcloud_client_read_own_messages"
on public.file_service_mensajes
for select
to authenticated
using (
  exists (
    select 1 from public.file_service_pedidos p
    where p.id = file_service_mensajes.pedido_id
      and p.user_id = auth.uid()
  )
);

-- Client messages must belong to the authenticated user's own order and are
-- forced to be client messages. Admin/system messages must use trusted paths.
drop policy if exists "akcloud_client_insert_own_messages" on public.file_service_mensajes;
create policy "akcloud_client_insert_own_messages"
on public.file_service_mensajes
for insert
to authenticated
with check (
  user_id = auth.uid()
  and autor_tipo = 'cliente'
  and exists (
    select 1 from public.file_service_pedidos p
    where p.id = file_service_mensajes.pedido_id
      and p.user_id = auth.uid()
  )
);

-- Storage bucket must be private. The app uses paths:
-- ori/<auth.uid()>/<timestamp>-file
-- mod/<pedido_id>/<timestamp>-file
update storage.buckets set public = false where id = 'file-service';

-- Clients can upload ORIs only inside their own folder.
drop policy if exists "akcloud_client_upload_own_ori" on storage.objects;
create policy "akcloud_client_upload_own_ori"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'file-service'
  and (storage.foldername(name))[1] = 'ori'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Clients can read their own ORIs.
drop policy if exists "akcloud_client_read_own_ori" on storage.objects;
create policy "akcloud_client_read_own_ori"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'file-service'
  and (storage.foldername(name))[1] = 'ori'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Clients can read MOD files only for one of their own paid orders.
drop policy if exists "akcloud_client_read_paid_mod" on storage.objects;
create policy "akcloud_client_read_paid_mod"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'file-service'
  and (storage.foldername(name))[1] = 'mod'
  and exists (
    select 1 from public.file_service_pedidos p
    where p.id::text = (storage.foldername(name))[2]
      and p.user_id = auth.uid()
      and coalesce(p.pagado, false) = true
      and p.mod_path = storage.objects.name
  )
);

commit;
