import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/diagnostico — ábrelo directamente en el navegador.
// No expone ningún secreto (solo longitud/prefijo), pero prueba la clave
// de verdad contra Supabase y te dice exactamente qué falla.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const resultado: Record<string, any> = {
    NEXT_PUBLIC_SUPABASE_URL: url ? `OK — ${url}` : '❌ FALTA esta variable en Vercel',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey ? `OK — presente, empieza por "${anonKey.slice(0, 12)}...", longitud ${anonKey.length}` : '❌ FALTA esta variable en Vercel',
    SUPABASE_SERVICE_ROLE_KEY: serviceKey
      ? `presente, empieza por "${serviceKey.slice(0, 12)}...", longitud ${serviceKey.length}`
      : '❌ FALTA esta variable en Vercel',
  }

  if (!url || !serviceKey) {
    return NextResponse.json({ resultado, conclusion: 'Faltan variables — revisa Vercel → Settings → Environment Variables.' }, { status: 200 })
  }

  // Prueba real: intenta listar 1 usuario con la clave service_role.
  // Si la clave está mal, aquí sale el motivo exacto que da Supabase.
  try {
    const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 1 })

    if (error) {
      resultado.prueba_service_role = `❌ FALLÓ: ${error.message} (código: ${(error as any).status || 'desconocido'})`
      resultado.conclusion =
        (error as any).status === 401 || /invalid/i.test(error.message)
          ? 'La clave SUPABASE_SERVICE_ROLE_KEY no es válida — probablemente pegaste la "anon" en vez de la "service_role", o hay un espacio/salto de línea de más al copiarla.'
          : 'La clave responde pero algo falla — revisa el mensaje de error de arriba.'
    } else {
      resultado.prueba_service_role = `✅ Funciona — se pudo listar usuarios (encontrados: ${data.users.length > 0 ? 'sí' : 'ninguno aún'})`
      resultado.conclusion = 'La clave service_role funciona bien. Si el registro sigue fallando, el problema está en otro sitio — dime y seguimos mirando.'
    }
  } catch (err: any) {
    resultado.prueba_service_role = `❌ Excepción: ${err.message}`
    resultado.conclusion = 'Error inesperado al conectar con Supabase — revisa que NEXT_PUBLIC_SUPABASE_URL sea la URL correcta de tu proyecto.'
  }

  return NextResponse.json({ resultado }, { status: 200 })
}
