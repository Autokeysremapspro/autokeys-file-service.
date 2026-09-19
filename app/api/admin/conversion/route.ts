import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireStaff } from '@/lib/supabase/server'
import { CONVERSION_EVENTS } from '@/lib/analytics/server'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Falta la configuración de Supabase')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(request: Request) {
  try {
    await requireStaff()
    const url = new URL(request.url)
    const requestedDays = Number(url.searchParams.get('days') || 30)
    const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 30
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await adminClient()
      .from('akcloud_conversion_events')
      .select('event_name,actor_key,user_id,session_id,source,medium,campaign,created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(20_000)

    if (error) throw error

    const rows = data || []
    const stages = CONVERSION_EVENTS.map((eventName) => ({
      eventName,
      count: new Set(rows.filter((row) => row.event_name === eventName).map((row) => row.actor_key)).size,
    }))

    const campaignMap = new Map<string, { source: string; medium: string; campaign: string; visits: Set<string>; registrations: Set<string>; checkouts: Set<string>; payments: Set<string> }>()
    for (const row of rows) {
      const source = row.source || 'directo'
      const medium = row.medium || '—'
      const campaign = row.campaign || 'sin campaña'
      const key = `${source}|${medium}|${campaign}`
      if (!campaignMap.has(key)) campaignMap.set(key, { source, medium, campaign, visits: new Set(), registrations: new Set(), checkouts: new Set(), payments: new Set() })
      const item = campaignMap.get(key)!
      if (row.event_name === 'landing_view') item.visits.add(row.actor_key)
      if (row.event_name === 'registration_completed') item.registrations.add(row.actor_key)
      if (row.event_name === 'checkout_started') item.checkouts.add(row.actor_key)
      if (row.event_name === 'payment_completed') item.payments.add(row.actor_key)
    }

    const campaigns = Array.from(campaignMap.values()).map((item) => ({
      source: item.source,
      medium: item.medium,
      campaign: item.campaign,
      visits: item.visits.size,
      registrations: item.registrations.size,
      checkouts: item.checkouts.size,
      payments: item.payments.size,
    })).sort((a, b) => b.visits - a.visits || b.registrations - a.registrations)

    return NextResponse.json({ ok: true, days, events: rows.length, stages, campaigns })
  } catch (error: any) {
    const unauthorized = error?.message === 'No autorizado'
    return NextResponse.json({ error: unauthorized ? 'No autorizado' : error?.message || 'No se pudo cargar el embudo' }, { status: unauthorized ? 403 : 500 })
  }
}
