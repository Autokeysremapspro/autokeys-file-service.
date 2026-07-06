create table if not exists akcloud_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  numero text unique not null,
  asunto text not null,
  categoria text,
  prioridad text not null default 'normal' check (prioridad in ('baja','normal','alta','urgente')),
  estado text not null default 'abierto' check (estado in ('abierto','en_revision','respondido','cerrado')),
  pedido_id uuid null,
  descripcion text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists akcloud_ticket_mensajes (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references akcloud_tickets(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  remitente text default 'cliente',
  mensaje text not null,
  interno boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_akcloud_tickets_user on akcloud_tickets(user_id);
create index if not exists idx_akcloud_tickets_estado on akcloud_tickets(estado);
create index if not exists idx_akcloud_ticket_mensajes_ticket on akcloud_ticket_mensajes(ticket_id);

create or replace function set_akcloud_ticket_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_akcloud_tickets_updated_at on akcloud_tickets;
create trigger trg_akcloud_tickets_updated_at
before update on akcloud_tickets
for each row execute function set_akcloud_ticket_updated_at();

alter table akcloud_tickets enable row level security;
alter table akcloud_ticket_mensajes enable row level security;

drop policy if exists "akcloud_tickets_select_own" on akcloud_tickets;
create policy "akcloud_tickets_select_own"
on akcloud_tickets for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "akcloud_tickets_insert_own" on akcloud_tickets;
create policy "akcloud_tickets_insert_own"
on akcloud_tickets for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "akcloud_tickets_update_own" on akcloud_tickets;
create policy "akcloud_tickets_update_own"
on akcloud_tickets for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "akcloud_ticket_mensajes_select_own" on akcloud_ticket_mensajes;
create policy "akcloud_ticket_mensajes_select_own"
on akcloud_ticket_mensajes for select
to authenticated
using (
  exists (
    select 1 from akcloud_tickets t
    where t.id = akcloud_ticket_mensajes.ticket_id
    and t.user_id = auth.uid()
  )
);

drop policy if exists "akcloud_ticket_mensajes_insert_own" on akcloud_ticket_mensajes;
create policy "akcloud_ticket_mensajes_insert_own"
on akcloud_ticket_mensajes for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from akcloud_tickets t
    where t.id = akcloud_ticket_mensajes.ticket_id
    and t.user_id = auth.uid()
  )
);
