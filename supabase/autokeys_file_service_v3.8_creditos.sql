-- AK Cloud v3.8 - Créditos y precios
create table if not exists public.ak_creditos_movimientos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  pedido_id uuid null,
  tipo text not null default 'ajuste' check (tipo in ('recarga','consumo','ajuste','devolucion')),
  concepto text null,
  creditos numeric not null default 0,
  saldo_resultante numeric null,
  created_at timestamptz not null default now()
);

alter table public.ak_creditos_movimientos enable row level security;

drop policy if exists "ak_creditos_select_own" on public.ak_creditos_movimientos;
create policy "ak_creditos_select_own"
on public.ak_creditos_movimientos
for select
using (auth.uid() = user_id or true);

drop policy if exists "ak_creditos_insert_all" on public.ak_creditos_movimientos;
create policy "ak_creditos_insert_all"
on public.ak_creditos_movimientos
for insert
with check (true);

drop policy if exists "ak_creditos_update_all" on public.ak_creditos_movimientos;
create policy "ak_creditos_update_all"
on public.ak_creditos_movimientos
for update
using (true);

create index if not exists idx_ak_creditos_user_id on public.ak_creditos_movimientos(user_id);
create index if not exists idx_ak_creditos_created_at on public.ak_creditos_movimientos(created_at desc);

-- Campo opcional para guardar coste del pedido en créditos
alter table public.file_service_pedidos
add column if not exists creditos_coste numeric default 0;

alter table public.file_service_pedidos
add column if not exists creditos_consumidos boolean default false;
