# AK Cloud v5.0 — Premium Experience

Parche construido sobre el portal AK Cloud actual.

## Qué cambia

- Rediseño premium del Workspace `/dashboard`.
- Dashboard con créditos reales, pedidos abiertos, descargas listas y avisos.
- Acciones rápidas: New Job, Garage, Biblioteca y Comprar Créditos.
- Panel de cola activa y live order.
- Preview de Mi Garaje.
- Pantalla PayPal Success premium con:
  - confirmación visual,
  - créditos añadidos,
  - saldo actual,
  - datos de orden PayPal,
  - accesos a nuevo trabajo y créditos.

## Archivos incluidos

- `app/dashboard/page.tsx`
- `app/paypal/success/page.tsx`

## SQL

No requiere SQL nuevo.

## Variables requeridas en Vercel

Mantener las que ya funcionan:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `PAYPAL_ENV=live`
- `NEXT_PUBLIC_SITE_URL`

## Instalación

1. Copiar el contenido del ZIP encima del repo `autokeys-file-service`.
2. Commit + push.
3. Esperar deploy de Vercel.

## Build probado

Build local probado con variables de entorno simuladas.
