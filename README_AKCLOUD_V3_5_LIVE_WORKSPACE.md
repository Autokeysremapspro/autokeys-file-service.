# AK Cloud v3.5 — Live Workspace

Copia estos archivos encima del repositorio `autokeys-file-service` y haz commit + push.

## Incluye

- Dashboard convertido en Live Workspace.
- Nuevo pedido con análisis visual, selección de servicios y pedido real.
- Ficha de pedido `/pedidos/[id]` con timeline, ORI/MOD y soporte.
- Página de pedidos mejorada.
- Mi Garaje `/garage`.
- Biblioteca privada `/biblioteca`.
- Componentes `AKAnalysisProgress` y `AKTimeline`.
- Servicio `lib/services/pedidos.ts` compatible con subida ORI, descarga y ficha.

## SQL

No requiere SQL nuevo si ya ejecutaste v1.2/v1.3.

## Comprobaciones

- `/dashboard`
- `/nuevo-pedido`
- `/pedidos`
- `/pedidos/[id]`
- `/garage`
- `/biblioteca`
