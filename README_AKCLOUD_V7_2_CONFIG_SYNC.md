# AK Cloud v7.2 — Config Sync desde Autokeys Core

## Qué cambia

- AK Cloud deja de usar planes fijos en el código.
- `/comprar-creditos` lee planes activos desde `akcloud_planes`.
- PayPal crea órdenes usando los planes configurados desde Core.
- `/nuevo-pedido` lee servicios activos desde `akcloud_servicios`.
- Reglas de packs desde `akcloud_reglas_precios`.
- `/creditos` muestra precios de servicios desde Core.
- Métodos de pago activos desde `akcloud_metodos_pago`.
- Añadido Bizum como método manual configurable.

## Instalación

1. Ejecutar SQL:

```sql
supabase/akcloud_v7_2_config_sync.sql
```

2. Copiar archivos encima del repo `autokeys-file-service`.
3. Commit + push.
4. Redeploy Vercel.

## Importante

Para que PayPal use planes dinámicos, los slugs de planes en Core son los que se envían como `packKey`.
