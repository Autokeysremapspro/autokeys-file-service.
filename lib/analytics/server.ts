import { createClient } from '@supabase/supabase-js'

export const CONVERSION_EVENTS = [
  'landing_view',
  'register_cta',
  'register_view',
  'registration_completed',
  'email_confirmed',
  'login_completed',
  'dashboard_view',
  'first_order_started',
  'order_step_file',
  'order_step_vehicle',
  'order_step_services',
  'order_step_review',
  'checkout_started',
  'payment_completed',
] as const

export type ConversionEventName = typeof CONVERSION_EVENTS[number]

type ConversionEvent = {
  eventName: ConversionEventName
  userId?: string | null
  sessionId?: string | null
  pagePath?: string | null
  source?: string | null
  medium?: string | null
  campaign?: string | null
  metadata?: Record<string, string | number | boolean | null>
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Falta la configuración de Supabase')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function clean(value: string | null | undefined, max = 120) {
  const normalized = String(value || '').trim().slice(0, max)
  return normalized || null
}

function validSessionId(value?: string | null) {
  const sessionId = clean(value, 80)
  return sessionId && /^[a-zA-Z0-9_-]{16,80}$/.test(sessionId) ? sessionId : null
}

export async function recordConversionEvent(input: ConversionEvent) {
  const sessionId = validSessionId(input.sessionId)
  const userId = clean(input.userId, 80)
  const actorKey = userId ? `user:${userId}` : sessionId ? `session:${sessionId}` : null
  if (!actorKey) return { recorded: false }

  const metadata = Object.fromEntries(
    Object.entries(input.metadata || {}).slice(0, 12).map(([key, value]) => [
      key.slice(0, 40),
      typeof value === 'string' ? value.slice(0, 160) : value,
    ])
  )

  const admin = adminClient()
  let source = clean(input.source, 80)
  let medium = clean(input.medium, 80)
  let campaign = clean(input.campaign, 120)

  if (userId && !source && !medium && !campaign) {
    const { data: attribution } = await admin
      .from('akcloud_conversion_events')
      .select('source,medium,campaign')
      .eq('user_id', userId)
      .or('source.not.is.null,medium.not.is.null,campaign.not.is.null')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    source = clean(attribution?.source, 80)
    medium = clean(attribution?.medium, 80)
    campaign = clean(attribution?.campaign, 120)
  }

  const { error } = await admin
    .from('akcloud_conversion_events')
    .upsert({
      event_name: input.eventName,
      actor_key: actorKey,
      user_id: userId,
      session_id: sessionId,
      page_path: clean(input.pagePath),
      source,
      medium,
      campaign,
      metadata,
    }, { onConflict: 'actor_key,event_name', ignoreDuplicates: true })

  if (error) throw error
  return { recorded: true }
}

export async function recordConversionEventSafe(input: ConversionEvent) {
  try {
    return await recordConversionEvent(input)
  } catch (error) {
    console.error('[conversion-event]', input.eventName, error)
    return { recorded: false }
  }
}

export function analyticsSessionFromUser(user: { user_metadata?: Record<string, any> | null } | null | undefined) {
  return validSessionId(user?.user_metadata?.analytics_session_id)
}
