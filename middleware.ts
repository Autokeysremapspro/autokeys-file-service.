import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareSupabaseClient } from '@/lib/supabase/middleware'

// Public commercial/SEO pages must stay accessible to search engines and
// visitors without an AK Cloud account. Authenticated application areas remain
// protected below.
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/paypal',
  '/embed',
  '/restablecer-contrasena',
  '/legal',
  '/robots.txt',
  '/sitemap.xml',
  '/file-service-ecu',
  '/stage-1-file-service',
  '/ecu-file-service',
  '/file-service-herramientas',
  '/en/ecu-file-service',
  '/en/stage-1-file-service',
  '/en/file-service-tools',
]
const STAFF_ONLY_PATHS = ['/admin']
const STAFF_ROLES = ['admin', 'desarrollo', 'laboratorio', 'atencion_cliente']

function matches(pathname: string, list: string[]) {
  return list.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { supabase, response } = createMiddlewareSupabaseClient(request)

  const { data: { user } } = await supabase.auth.getUser()

  if (matches(pathname, PUBLIC_PATHS)) return response

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }

  // Comparte identidad de staff con Core. Mantener esta lista sincronizada
  // con public.is_staff() evita que un técnico de laboratorio quede bloqueado
  // en AK Cloud mientras sí tiene permisos internos en Core/Supabase.
  const { data: usuario } = await supabase
    .from('usuarios_app')
    .select('rol, activo')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  const esStaff = !!usuario && usuario.activo !== false && STAFF_ROLES.includes(usuario.rol)
  if (esStaff) return response

  if (matches(pathname, STAFF_ONLY_PATHS)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname.startsWith('/pendiente-aprobacion')) return response

  const { data: distribuidor } = await supabase
    .from('akcloud_distribuidores')
    .select('estado')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!distribuidor || distribuidor.estado !== 'activo') {
    return NextResponse.redirect(new URL('/pendiente-aprobacion', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$).*)'],
}
