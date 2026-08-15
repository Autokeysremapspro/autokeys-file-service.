-- AK Cloud · Phase 2 final security hardening
-- Scope: only Phase 2 ECU evidence, laboratory status and Phase 2 RPC helpers.
-- This migration does not modify ECU files or automate laboratory decisions.

begin;

-- ECU learning evidence is internal-only. Keep access behind trusted server paths.
alter table public.ak_ecu_signature_evidence enable row level security;
revoke all on table public.ak_ecu_signature_evidence from public, anon, authenticated;
grant all on table public.ak_ecu_signature_evidence to service_role;

-- Verified signatures intentionally remain internal-only. RLS is already enabled;
-- keep explicit grants restricted to the service role.
alter table public.ak_ecu_verified_signatures enable row level security;
revoke all on table public.ak_ecu_verified_signatures from public, anon, authenticated;
grant all on table public.ak_ecu_verified_signatures to service_role;

-- Laboratory status is readable by portal users so the realtime banner keeps working,
-- but direct client writes are blocked by RLS. Mutations continue through guarded RPCs.
alter table public.ak_laboratory_status enable row level security;

drop policy if exists "ak_laboratory_status_public_read" on public.ak_laboratory_status;
create policy "ak_laboratory_status_public_read"
on public.ak_laboratory_status
for select
to anon, authenticated
using (true);

revoke insert, update, delete, truncate, references, trigger
on table public.ak_laboratory_status from public, anon, authenticated;
grant select on table public.ak_laboratory_status to anon, authenticated;
grant all on table public.ak_laboratory_status to service_role;

-- Trigger helpers are not public RPC endpoints.
revoke execute on function public.ak_ecu_recount_signature() from public, anon, authenticated;
revoke execute on function public.akcloud_intake_to_core() from public, anon, authenticated;
revoke execute on function public.akcloud_notify_technical_intake() from public, anon, authenticated;
grant execute on function public.ak_ecu_recount_signature() to service_role;
grant execute on function public.akcloud_intake_to_core() to service_role;
grant execute on function public.akcloud_notify_technical_intake() to service_role;

-- User-profile RPCs require an authenticated session. Their bodies already scope by auth.uid().
revoke execute on function public.get_my_akcloud_profile() from public, anon;
revoke execute on function public.update_my_akcloud_profile(text,text,text,text,text,text,text,text,text,text[]) from public, anon;
grant execute on function public.get_my_akcloud_profile() to authenticated, service_role;
grant execute on function public.update_my_akcloud_profile(text,text,text,text,text,text,text,text,text,text[]) to authenticated, service_role;

-- Laboratory schedule mutation remains callable only by signed-in users and is still
-- protected internally by is_admin(). Anonymous execution is unnecessary.
revoke execute on function public.update_laboratory_schedule(jsonb) from public, anon;
grant execute on function public.update_laboratory_schedule(jsonb) to authenticated, service_role;

-- This RPC intentionally stays public because it returns only the sanitized status payload
-- used by the portal banner. It remains SECURITY DEFINER with a fixed search_path.
grant execute on function public.get_ak_laboratory_public_status() to anon, authenticated, service_role;

commit;
