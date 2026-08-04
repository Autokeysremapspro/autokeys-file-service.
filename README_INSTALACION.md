# AK LAB OS — TITAN V5 REAL

Esta versión sustituye la capa visual real del portal autenticado.

## Copiar

1. Copia `components/ak/AKPageShell.tsx`.
2. Copia `components/ak/AKSidebar.tsx`.
3. Copia `app/dashboard/page.tsx`.
4. Copia `app/titan-v5.css`.
5. Al final de `app/globals.css`, añade:

```css
@import './titan-v5.css';
```

## Qué conserva

- Supabase y autenticación.
- Pedidos y servicios existentes.
- Roles y panel de laboratorio.
- Actualización en tiempo real.
- Rutas actuales.

## Importante

No copies la carpeta raíz completa. Copia únicamente los archivos anteriores respetando sus rutas.
