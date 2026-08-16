# Fase 2.2B — Base ECU / contrato de conocimiento

## Objetivo

Convertir la información ECU ya confirmada por el laboratorio en una base técnica reutilizable sin introducir identificación por heurística ni automatizar decisiones técnicas.

## Tablas canónicas existentes

### `ak_ecu_detection_rules`
Catálogo técnico curado por el laboratorio: fabricante/familia ECU, vehículos, motores, herramientas, servicios compatibles, tamaños y notas. Una regla describe conocimiento de compatibilidad, pero por sí sola no identifica automáticamente un archivo.

### `ak_ecu_fingerprints`
Evidencia de archivo exacto por SHA-256. Es la evidencia de mayor precisión para reconocer exactamente un ORI ya confirmado. `veces_visto` mide repetición, no sustituye una confirmación humana.

### `ak_ecu_verified_signatures`
Combinación exacta normalizada de HW + SW + tamaño + ECU. Solo puede habilitar identificación automática cuando alcanza el umbral humano exigido por el detector y no existe ambigüedad.

### `ak_ecu_signature_evidence`
Trazabilidad de cada confirmación humana que alimenta una firma verificada, asociada cuando sea posible al pedido y al usuario que confirma.

## Reglas de normalización 2.2B

1. No borrar ni reinterpretar conocimiento histórico automáticamente.
2. Texto técnico utilizado para matching (ECU/HW/SW) se normaliza con trim, espacios internos compactados y comparación case-insensitive; se conserva el valor de presentación cuando sea útil.
3. Valores centinela como `NA`, `N/A`, `-`, `UNKNOWN`, `DESCONOCIDO` o cadenas vacías se consideran ausencia de dato, nunca evidencia positiva.
4. Marca, modelo, motor y vehículo se limpian de espacios sobrantes antes de reutilizarlos.
5. Una cadena de marcas no debe representar varias marcas dentro de un único elemento de array. Las marcas se almacenan como elementos separados.
6. `file_size` siempre se expresa en bytes y debe ser positivo.
7. `rule_id` enlaza una huella con una regla únicamente cuando la relación haya sido confirmada; nunca por similitud aproximada.
8. Los servicios compatibles solo proceden de reglas curadas/confirmadas. Nunca se seleccionan automáticamente en un pedido.
9. Herramientas conocidas son información técnica de referencia, no garantía universal de protocolo o método de lectura.
10. La frecuencia (`veces_visto`, `confirmaciones`) aumenta evidencia, pero no convierte por sí sola una coincidencia ambigua en verdad.

## Estados derivados

No se crea una nueva tabla solo para guardar estados que puedan derivarse de la evidencia actual.

- `verificado`: evidencia exacta válida y suficiente según la política activa del detector.
- `pendiente`: conocimiento útil pero todavía sin confirmaciones suficientes o con campos críticos incompletos.
- `conflictivo`: la misma clave técnica produce datos incompatibles, existen metadatos contradictorios o la relación con una regla no puede establecerse con seguridad.

Cualquier estado conflictivo fuerza revisión del laboratorio y bloquea autorrelleno.

## Hallazgos actuales (auditoría 2.2B.1)

- Existen 1 regla, 4 huellas, 2 firmas verificadas y 2 registros de evidencia.
- Hay huellas confirmadas con `rule_id = null`; no deben enlazarse automáticamente.
- Existen diferencias de formato (mayúsculas/minúsculas, espacios finales y valores `NA`) que deben neutralizarse en la capa de normalización.
- La regla actual contiene varias marcas dentro de un solo elemento de array; debe corregirse únicamente mediante una migración de datos revisada.
- Las dos firmas actuales tienen una confirmación; siguen siendo evidencia aprendida, pero no deben saltarse el umbral humano configurado por el detector.
- El panel `/admin/ecu-database` trabaja hoy principalmente con reglas de catálogo. 2.2B debe evolucionarlo para distinguir claramente regla, huella exacta, firma y evidencia.

## Política de seguridad

- Ninguna heurística puede escribir una identificación confirmada.
- Ninguna coincidencia dudosa puede autorrellenar datos de pedido.
- Ningún servicio se activa automáticamente por una regla ECU.
- Ninguna modificación de archivo ECU se automatiza desde esta base.
- La decisión técnica final pertenece siempre al laboratorio.

## Siguiente paso 2.2B.2

Implementar una capa única de normalización/lectura para el conocimiento ECU y usarla primero en administración y consultas. Después, preparar una migración de limpieza idempotente y revisable para los datos históricos, sin cambiar aún el criterio de identificación del detector.
