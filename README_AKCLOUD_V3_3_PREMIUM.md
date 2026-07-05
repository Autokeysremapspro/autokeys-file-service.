# AK Cloud v3.3 Premium Workspace

Actualización visual y funcional para el portal Autokeys File Service.

## Incluye

- Workspace premium estilo AK Cloud.
- Upload ORI con estética SaaS top.
- Análisis visual simulado del archivo.
- Ficha ECU premium.
- Servicios agrupados por categorías.
- Resumen lateral sticky con precio automático.
- Envío real de pedido a Supabase Storage + tabla `file_service_pedidos`.
- Precio guardado en el pedido.

## Archivos modificados

- `app/globals.css`
- `app/dashboard/page.tsx`
- `app/nuevo-pedido/page.tsx`
- `components/ak/AKButton.tsx`
- `components/ak/AKCard.tsx`
- `components/ak/AKSidebar.tsx`
- `components/ak/AKTopbar.tsx`
- `components/ak/AKUploader.tsx`
- `components/ak/AKAnalysisProgress.tsx`
- `components/ak/AKECUCard.tsx`
- `components/ak/AKServiceCard.tsx`
- `components/ak/AKOrderSummary.tsx`
- `lib/services/pedidos.ts`

## Notas

No requiere SQL nuevo si ya ejecutaste la v1.2 de pedidos reales.
