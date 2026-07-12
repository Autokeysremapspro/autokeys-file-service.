-- =========================================================
-- AK CLOUD — Parche adicional: ak_creditos_recargas
-- Se quedó fuera de autokeys_file_service_v10_security_fix.sql
-- por descuido. Ejecutar en el mismo proyecto Supabase,
-- después de los dos anteriores.
-- =========================================================

alter table public.ak_creditos_recargas enable row level security;

drop policy if exists "ak_creditos_recargas_select_all" on public.ak_creditos_recargas;
drop policy if exists "ak_creditos_recargas_insert_all" on public.ak_creditos_recargas;
drop policy if exists "ak_creditos_recargas_update_all" on public.ak_creditos_recargas;
drop policy if exists "ak_creditos_recargas_delete_all" on public.ak_creditos_recargas;
drop policy if exists "ak_creditos_recargas_select_own" on public.ak_creditos_recargas;
drop policy if exists "ak_creditos_recargas_insert_own" on public.ak_creditos_recargas;
drop policy if exists "ak_creditos_recargas_update_staff" on public.ak_creditos_recargas;

-- El distribuidor ve solo sus propias recargas (o staff, que las ve todas)
create policy "ak_creditos_recargas_select_own" on public.ak_creditos_recargas
  for select using (auth.uid() = user_id or is_staff());

-- El distribuidor puede crear su propia solicitud de recarga (queda "pendiente")
create policy "ak_creditos_recargas_insert_own" on public.ak_creditos_recargas
  for insert with check (auth.uid() = user_id);

-- Solo staff puede aprobar/rechazar (cambiar estado) — en la práctica esto
-- se hace desde /api/ak-cloud/recargas en Core con service_role, que se
-- salta RLS de todas formas; esta política es la barrera para que nadie
-- se apruebe créditos a sí mismo escribiendo directo a Supabase.
create policy "ak_creditos_recargas_update_staff" on public.ak_creditos_recargas
  for update using (is_staff()) with check (is_staff());
