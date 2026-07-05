# AK Cloud v3.4 — Ficha de Pedido Premium

Copia todo el contenido encima del repositorio `autokeys-file-service` y haz commit + push.

## Incluye

- `/pedidos/[id]`: ficha premium del pedido para distribuidor.
- `/admin/pedidos/[id]`: ficha premium interna para Autokeys.
- `/pedidos`: listado actualizado con botón Abrir.
- `lib/services/pedidos.ts`: funciones para abrir pedido, descargar ORI/MOD, cambiar estado, marcar urgente, notas internas y subir MOD.

## No requiere SQL nuevo

Usa las tablas y columnas creadas en v1.2 y v1.3.
