import type { ConversionEventName } from './server'

const SESSION_KEY = 'akcloud_analytics_session'
const ATTRIBUTION_KEY = 'akcloud_attribution'

type Attribution = { source?: string; medium?: string; campaign?: string }

export function getAnalyticsSessionId() {
  if (typeof window === 'undefined') return null
  let sessionId = window.localStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID().replace(/-/g, '')
    window.localStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const incoming: Attribution = {
    source: params.get('utm_source') || undefined,
    medium: params.get('utm_medium') || undefined,
    campaign: params.get('utm_campaign') || undefined,
  }

  if (incoming.source || incoming.medium || incoming.campaign) {
    window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(incoming))
    return incoming
  }

  try {
    return JSON.parse(window.localStorage.getItem(ATTRIBUTION_KEY) || '{}')
  } catch {
    return {}
  }
}

export function getConversionContext() {
  return { sessionId: getAnalyticsSessionId(), ...getAttribution() }
}

export async function trackConversion(eventName: ConversionEventName, metadata?: Record<string, string | number | boolean | null>) {
  if (typeof window === 'undefined') return
  const context = getConversionContext()
  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({ eventName, pagePath: window.location.pathname, ...context, metadata }),
    })
  } catch {
    // La medición nunca debe bloquear el uso del portal.
  }
}
