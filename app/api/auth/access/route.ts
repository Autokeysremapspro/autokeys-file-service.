import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { markAkCloudAccess } from '@/lib/auth/access'
import { analyticsSessionFromUser, recordConversionEventSafe } from '@/lib/analytics/server'

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const result = await markAkCloudAccess(user.id)
    const body = await request.json().catch(() => ({}))
    await recordConversionEventSafe({
      eventName: 'login_completed',
      userId: user.id,
      sessionId: body?.analytics?.sessionId || analyticsSessionFromUser(user),
      pagePath: '/login',
      source: body?.analytics?.source,
      medium: body?.analytics?.medium,
      campaign: body?.analytics?.campaign,
    })
    if (user.email_confirmed_at) {
      await recordConversionEventSafe({
        eventName: 'email_confirmed',
        userId: user.id,
        sessionId: body?.analytics?.sessionId || analyticsSessionFromUser(user),
        pagePath: '/login',
        source: body?.analytics?.source,
        medium: body?.analytics?.medium,
        campaign: body?.analytics?.campaign,
      })
    }
    return NextResponse.json({ ok: true, ...result })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'No se pudo registrar el acceso' }, { status: 500 })
  }
}
