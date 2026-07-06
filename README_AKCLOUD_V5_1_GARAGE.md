# AK Cloud v5.1 — Garage Premium

## Instalación

Copia el contenido de este ZIP encima del repo `autokeys-file-service`.

Después:

```bash
git add .
git commit -m "AK Cloud v5.1 Garage Premium"
git push
```

## Incluye

- Rediseño completo de `/garage`.
- Agrupación automática de pedidos por vehículo/ECU.
- Ficha de vehículo en `/garage/[key]`.
- Historial de trabajos por vehículo.
- Servicios usados.
- Descarga rápida de ORI/MOD asociados.
- Sin SQL nuevo.

## Notas

El garaje se construye desde la tabla `file_service_pedidos`, usando los pedidos del usuario autenticado.
