# AK Cloud v5.5 — Detector real de archivo ECU

## Qué incluye

- Detector progresivo real del ORI/BIN al subir archivo.
- Ya no fuerza Audi A4 / EDC17C64 por defecto.
- Lee nombre, tamaño y strings internas del archivo.
- Intenta detectar ECU, familia, marca, modelo, HW y SW.
- Muestra confianza de detección.
- Muestra “No identificado automáticamente” si no hay coincidencia suficiente.
- Servicios compatibles dinámicos según familia ECU.
- El pedido se guarda con los datos detectados, o vacío si no se identifica.

## Archivos modificados

- `app/nuevo-pedido/page.tsx`
- `components/ak/AKECUCard.tsx`
- `lib/services/pedidos.ts`
- `lib/services/ecuDetector.ts`

## Nota

Esta es la primera versión realista del detector. No promete identificar el 100% de ECUs todavía. La detección irá mejorando añadiendo reglas y futura base de datos técnica.

## Instalación

Copiar encima del repo `autokeys-file-service`, commit y push.

No requiere SQL nuevo.
