import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareSupabaseClient } from '@/lib/supabase/middleware'

// Público: landing, login, alta de distribuidor, confirmación de PayPal, y el
// widget embebible de potencias (pensado para insertarse en webs externas).
const PUBLIC_PATHS = ['/', '/login', '/register', '/paypal', '/embed', '/restablecer-contrasena']
// Solo staff interno de Autokeys puede entrar sin más (comparte usuarios_app con Core).
const STAFF_ONLY_PATHS = ['/admin']

function matches(pathname: string, list: string[]) {
  return list.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { supabase, response } = createMiddlewareSupabaseClient(request)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (matches(pathname, PUBLIC_PATHS)) {
    return response
  }

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Un miembro del staff de Autokeys (tabla usuarios_app, compartida con Core)
  // puede entrar a CUALQUIER parte del portal, sea o no también distribuidor.
  const { data: usuario } = await supabase
    .from('usuarios_app')
    .select('rol, activo')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  const esStaff = !!usuario && usuario.activo !== false && ['admin', 'desarrollo', 'atencion_cliente'].includes(usuario.rol)

  if (esStaff) {
    return response
  }

  // No es staff: las rutas /admin quedan cerradas, y el resto exige ser
  // distribuidor aprobado y activo.
  if (matches(pathname, STAFF_ONLY_PATHS)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname.startsWith('/pendiente-aprobacion')) {
    return response
  }

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
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$).*)',
  ],
}
