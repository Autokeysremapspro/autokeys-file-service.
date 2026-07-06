# AK Cloud v4.2 — PayPal Checkout automático

## Antes de desplegar

En Vercel añade estas variables en el proyecto `autokeys-file-service`:

```env
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=98U4052999559522N
PAYPAL_ENV=live
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://autokeys-file-service.vercel.app
```

`SUPABASE_SERVICE_ROLE_KEY` se saca de Supabase → Project Settings → API Keys → service_role. No debe ser pública.

## SQL

Ejecuta en Supabase:

```text
supabase/autokeys_file_service_v4.2_paypal.sql
```

## Qué añade

- Pago automático con PayPal desde `/comprar-creditos`.
- Crea orden PayPal desde `/api/paypal/create-order`.
- Captura pago al volver a `/paypal/success`.
- Webhook en `/api/paypal/webhook`.
- Suma créditos automáticamente.
- Marca recarga como aprobada.
- Registra movimiento de créditos.
- Guarda pago en `ak_paypal_pagos`.

## Webhook URL en PayPal

```text
https://autokeys-file-service.vercel.app/api/paypal/webhook
```

Eventos recomendados:

- PAYMENT.CAPTURE.COMPLETED
- CHECKOUT.ORDER.APPROVED

