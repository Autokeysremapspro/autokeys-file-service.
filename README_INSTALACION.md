# AK LAB OS — Project TITAN V4

Esta versión transforma la navegación completa del portal, no solo la portada.

## Incluye
- Nueva identidad `AK LAB OS`.
- Sidebar Mission Control totalmente rediseñada.
- Cabecera operativa con estados del sistema.
- Buscador global estilo command palette.
- Navegación móvil renovada.
- Identidad visual TITAN: grafito, cobre y señal turquesa.
- Se conservan rutas, Supabase, autenticación, roles y lógica existente.

## Instalación
1. Abre el repositorio `Autokeysremapspro/autokeys-file-service.`.
2. Copia las carpetas `components` y `app` del ZIP sobre el proyecto.
3. Reemplaza los dos componentes existentes.
4. Abre `app/globals.css` y añade al final:

```css
@import './titan-v4.css';
```

5. Sube a GitHub y despliega en Vercel.

## Archivos modificados
- `components/ak/AKSidebar.tsx`
- `components/ak/AKPageShell.tsx`
- `app/titan-v4.css` (nuevo)

## Seguridad
No modifica tablas, políticas RLS, APIs, pedidos, precios, sesiones ni configuración de Supabase.
