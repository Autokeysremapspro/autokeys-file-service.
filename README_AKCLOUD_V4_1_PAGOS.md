# AK Cloud v4.1 — Fix Pagos / Recargas

## Instalación

1. Ejecuta en Supabase:

```text
supabase/autokeys_file_service_v4.1_pagos_fix.sql
```

2. Copia el contenido del ZIP encima del repo `autokeys-file-service`.
3. Commit + push.

## Cambios incluidos

- Mejora de `/comprar-creditos`.
- Instrucciones claras según método de pago.
- Validación de referencia obligatoria para PayPal, transferencia y tarjeta.
- Mejor flujo de aprobación en `/admin/recargas`.
- Evita aprobar dos veces la misma recarga.
- Evita aprobar recargas sin usuario asociado.
- Notificación al distribuidor al aprobar/rechazar.
- SQL compatible para índices y notificaciones.

## Build

Probado con:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_dummy npm run build
```
