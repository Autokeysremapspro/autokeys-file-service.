import { NextResponse } from 'next/server'
import { CONVERSION_EVENTS, recordConversionEvent, type ConversionEventName } from '@/lib/analytics/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const PUBLIC_EVENTS = new Set<ConversionEventName>(['landing_view', 'register_cta', 'register_view'])

export async function POST(request: Request) {
  try {
    if (Number(request.headers.get('content-length') || 0) > 12_000) {
      return NextResponse.json({ error: 'Solicitud demasiado grande' }, { status: 413 })
    }

    const body = await request.json()
    const eventName = String(body?.eventName || '') as ConversionEventName
    if (!CONVERSION_EVENTS.includes(eventName)) {
      return NextResponse.json({ error: 'Evento no válido' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!PUBLIC_EVENTS.has(eventName) && !user) {
      return NextResponse.json({ error: 'Sesión requerida' }, { status: 401 })
    }

    const result = await recordConversionEvent({
      eventName,
      userId: user?.id,
      sessionId: body?.sessionId,
      pagePath: body?.pagePath,
      source: body?.source,
      medium: body?.medium,
      campaign: body?.campaign,
      metadata: body?.metadata,
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (error: any) {
    console.error('[conversion-event]', error?.message || error)
    return NextResponse.json({ error: 'No se pudo registrar el evento' }, { status: 500 })
  }
}
