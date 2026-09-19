-- Permite medir el abandono dentro del asistente de nuevo pedido.
alter table public.akcloud_conversion_events
  drop constraint if exists akcloud_conversion_events_event_name_check;

alter table public.akcloud_conversion_events
  add constraint akcloud_conversion_events_event_name_check
  check (event_name in (
    'landing_view',
    'register_cta',
    'register_view',
    'registration_completed',
    'email_confirmed',
    'login_completed',
    'dashboard_view',
    'first_order_started',
    'order_step_file',
    'order_step_vehicle',
    'order_step_services',
    'order_step_review',
    'checkout_started',
    'payment_completed'
  ));
