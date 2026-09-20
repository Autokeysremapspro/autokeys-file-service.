# Soluciones automáticas · laboratorio

Estado: desarrollado en una rama aislada. No habilitado para clientes ni aplicado a la base de datos de producción.

## Regla de seguridad

Una solución solo puede aparecer cuando el archivo subido coincide simultáneamente en SHA-256 y tamaño con un ORI registrado. ECU, HW y SW son datos informativos y nunca autorizan por sí solos una entrega.

## Flujo de validación

1. El laboratorio carga el ORI exacto y el MOD ya preparado.
2. El servidor calcula ambos hashes desde Storage; no confía en valores enviados por el navegador.
3. La suite comprueba integridad ORI, integridad MOD y coincidencia exacta.
4. Un técnico documenta una prueba real de escritura/diagnosis y la confirma manualmente.
5. Solo entonces la solución pasa a `verified` y puede prepararse como `published`.
6. Aunque existan soluciones publicadas, el cliente no puede acceder mientras `AK_AUTO_SOLUTIONS_ENABLED` no sea exactamente `true`.

## Cobro y entrega

- Precio fijo por archivo: 44,90 EUR.
- Proveedores: SumUp o PayPal.
- El pago se verifica en el servidor contra el proveedor, incluyendo importe y moneda.
- El MOD permanece en un bucket privado.
- Después del pago se genera una URL firmada de 120 segundos.
- Cada compra admite un máximo de cinco descargas.

## Activación futura

Antes de activar el módulo se debe aplicar la migración `20260920001245_automatic_solutions_lab.sql` en un entorno de pruebas, cargar archivos conocidos, completar la suite, documentar las pruebas técnicas y revisar los pagos sandbox. La activación pública requiere una decisión expresa y configurar `AK_AUTO_SOLUTIONS_ENABLED=true`.
