# AK Cloud — Detector ECU estricto

## Política aplicada

- No se muestran ECUs probables ni alternativas al cliente.
- Un archivo solo se identifica automáticamente por:
  1. Huella SHA-256 exacta previamente confirmada por el laboratorio.
  2. Firma validada con HW exacto + SW exacto + tamaño exacto y al menos 3 confirmaciones humanas.
- Si existe cualquier ambigüedad, la respuesta es:
  `ECU NO IDENTIFICADA — añadir información faltante`.
- El nombre del archivo no se utiliza como evidencia.
- Las reglas heurísticas no pueden autorrellenar marca, modelo ni ECU.
- El aprendizaje solo ocurre cuando un usuario staff confirma la identificación real.

## Instalación

1. Despliega este proyecto.
2. Ejecuta una sola vez en Supabase SQL Editor:
   `supabase/migrations/20260719_akcloud_detector_ecu_estricto.sql`
3. Verifica en Vercel las variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Resultado esperado

- Archivo conocido exacto: identificación al 100 %.
- Firma repetida y validada 3 o más veces: identificación al 99 %.
- Cualquier otro caso: no identificada y solicitud de datos técnicos.
