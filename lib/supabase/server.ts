import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Ignorable si se llama desde un contexto de solo lectura.
          }
        },
      },
    }
  )
}

export async function requireStaff() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { data: usuario } = await supabase
    .from('usuarios_app')
    .select('rol, activo')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  const esStaff = !!usuario && usuario.activo !== false && ['admin', 'desarrollo', 'atencion_cliente'].includes(usuario.rol)
  if (!esStaff) throw new Error('No autorizado')

  return { user }
}
