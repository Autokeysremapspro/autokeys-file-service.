# AK Cloud v3.9 — Pagos / Recarga de créditos

## Instalación

1. Ejecuta en Supabase:

```text
supabase/autokeys_file_service_v3.9_recargas.sql
```

2. Copia el contenido del ZIP encima del repo `autokeys-file-service`.
3. Commit + push.

## Incluye

- `/comprar-creditos`
- packs de créditos
- método de pago: PayPal, transferencia, tarjeta u otro
- solicitud manual de recarga
- historial de recargas del distribuidor
- `/admin/recargas`
- aprobar/rechazar recargas
- al aprobar suma créditos automáticamente en `ak_creditos_movimientos`
- menú lateral actualizado
