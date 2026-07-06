# AK Cloud v5.4 — AK Intelligence

## Instalación

1. Copia todo el contenido de este ZIP encima del repositorio `autokeys-file-service`.
2. Haz commit + push.
3. Vercel desplegará automáticamente.

No requiere SQL nuevo.

## Incluye

- Nueva página `/intelligence`.
- Nuevo panel `AKIntelligencePanel`.
- Servicio local `lib/services/intelligence.ts`.
- Nuevo flujo en `/nuevo-pedido` con análisis visual AK Intelligence.
- Servicios compatibles dinámicos según ECU detectada.
- Datos de marca/modelo/ECU/HW/SW guardados en el pedido.
- Menú lateral actualizado con AK Intelligence.

## Nota

La detección es visual/simulada por nombre de archivo para preparar la UX.
Más adelante se puede sustituir `analizarArchivoLocal(...)` por un detector real de ECU/HW/SW.
