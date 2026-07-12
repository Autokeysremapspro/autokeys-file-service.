import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareSupabaseClient } from '@/lib/supabase/middleware'

// Público: landing, login, alta de distribuidor y confirmación de PayPal (usa su propio token).
const PUBLIC_PATHS = ['/', '/login', '/register', '/paypal']
// Solo staff interno de Autokeys (comparte usuarios_app con Core).
const STAFF_PATHS = ['/admin']

function matches(pathname: string, list: string[]) {
  return list.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { supabase, response } = createMiddlewareSupabaseClient(request)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (matches(pathname, PUBLIC_PATHS) && !matches(pathname, STAFF_PATHS)) {
    return response
  }

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (matches(pathname, STAFF_PATHS)) {
    const { data: usuario } = await supabase
      .from('usuarios_app')
      .select('rol, activo')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    const esStaff = !!usuario && usuario.activo !== false && ['admin', 'desarrollo', 'atencion_cliente'].includes(usuario.rol)
    if (!esStaff) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // Resto de rutas privadas: exige ser distribuidor aprobado y activo.
  const { data: distribuidor } = await supabase
    .from('akcloud_distribuidores')
    .select('estado')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!distribuidor || distribuidor.estado !== 'activo') {
    if (pathname.startsWith('/pendiente-aprobacion')) return response
    const pendingUrl = new URL('/pendiente-aprobacion', request.url)
    return NextResponse.redirect(pendingUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$).*)',
  ],
}
