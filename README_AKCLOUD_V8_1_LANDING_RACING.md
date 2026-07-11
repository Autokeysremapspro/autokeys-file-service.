# AK Cloud v8.1 — Landing Racing Experience

## Instalación
1. Descomprime este ZIP.
2. Copia su contenido encima de la raíz del repositorio `autokeys-file-service`.
3. Confirma la sustitución de `app/page.tsx`.
4. Haz commit + push.
5. Vercel desplegará automáticamente.

## Incluye
- Landing pública totalmente maquetada y funcional.
- Hero racing con imagen integrada como fondo, no como captura completa pegada.
- Botones funcionales hacia `/register` y `/login`.
- Mockup visual del workspace.
- Servicios, flujo de alta, ventajas, métricas y CTA final.
- Diseño responsive para escritorio, tablet y móvil.

## Base de datos
No requiere SQL nuevo.

## Verificación
El proyecto compiló correctamente y superó la comprobación de tipos. La prueba local se detuvo al recopilar las rutas PayPal porque no estaban cargadas las variables de Supabase en el entorno local; en Vercel ya están configuradas.
