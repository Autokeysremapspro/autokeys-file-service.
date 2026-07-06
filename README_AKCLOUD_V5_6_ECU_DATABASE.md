# AK Cloud v5.6 — AK ECU Database / Detection Engine

## Instalación

1. Ejecuta en Supabase:

```sql
supabase/autokeys_file_service_v5.6_ecu_database.sql
```

2. Copia el ZIP encima del repo `autokeys-file-service`.
3. Commit + push.

## Incluye

- Motor de detección AK Detection Engine.
- Nueva tabla `ak_ecu_detection_rules`.
- Reglas iniciales de detección.
- Página admin `/admin/ecu-database`.
- Añadir reglas de ECU, patrones, tamaños, herramientas y servicios.
- Detección por puntuación y confianza.
- Si no detecta, muestra “no identificado” y permite continuar manualmente.

No requiere variables nuevas.
