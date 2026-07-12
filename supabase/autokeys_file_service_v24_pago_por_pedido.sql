-- =========================================================
-- AK CLOUD — Pago real por pedido, sin créditos (v24)
-- El pedido ya no se paga descontando créditos de una cartera —
-- si algo no está cubierto por tu plan (o estás en el plan Free),
-- se paga el precio real en euros con PayPal en el momento de pedirlo.
--
-- Como el pago de PayPal es un proceso de dos pasos (crear la orden,
-- luego capturarla cuando el usuario aprueba en PayPal), el pedido no
-- se puede crear directamente — se guarda "en espera" aquí mientras
-- se completa el pago, y solo se convierte en un pedido real
-- (file_service_pedidos) cuando PayPal confirma el cobro.
-- =========================================================

create table if not exists public.ak_pedidos_pendientes_pago (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null,
  importe numeric not null,
  paypal_order_id text,
  estado text not null default 'pendiente', -- pendiente | pagado | cancelado | expirado
  created_at timestamptz not null default now(),
  pagado_at timestamptz
);

create index if not exists idx_pedidos_pendientes_pago_user on public.ak_pedidos_pendientes_pago(user_id);
create index if not exists idx_pedidos_pendientes_pago_order on public.ak_pedidos_pendientes_pago(paypal_order_id);

alter table public.ak_pedidos_pendientes_pago enable row level security;

drop policy if exists "ak_pedidos_pendientes_pago_select_own" on public.ak_pedidos_pendientes_pago;
create policy "ak_pedidos_pendientes_pago_select_own" on public.ak_pedidos_pendientes_pago
  for select using (auth.uid() = user_id or is_staff());
-- Sin política de insert/update para "authenticated": solo se escribe
-- desde rutas server con service_role (igual que todo lo relacionado con pagos).

notify pgrst, 'reload schema';
