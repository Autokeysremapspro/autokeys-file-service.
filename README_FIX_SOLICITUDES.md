# Fix solicitudes AK Cloud → Autokeys Core

1. Copiar este ZIP encima de `autokeys-file-service`.
2. Verificar en Vercel del File Service:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
3. Commit + push.

El registro ahora crea la solicitud mediante una ruta server segura y redirige a `/pendiente-aprobacion`.
