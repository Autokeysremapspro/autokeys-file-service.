import { createServerClient } from '@supabase/ssr'
import { type EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get('token_hash')
  const type = (request.nextUrl.searchParams.get('type') || 'signup') as EmailOtpType

  const successUrl = new URL('/login?confirmado=1', request.url)
  const errorUrl = new URL('/login?confirmacion_error=1', request.url)

  if (!tokenHash || type !== 'signup') {
    return NextResponse.redirect(errorUrl)
  }

  let response = NextResponse.redirect(successUrl)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'signup',
  })

  if (error) {
    return NextResponse.redirect(errorUrl)
  }

  return response
}
