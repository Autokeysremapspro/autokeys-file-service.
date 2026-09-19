'use client'

import { useEffect } from 'react'
import { trackConversion } from '@/lib/analytics/client'
import type { ConversionEventName } from '@/lib/analytics/server'

export default function ConversionTracker({ eventName }: { eventName: ConversionEventName }) {
  useEffect(() => { void trackConversion(eventName) }, [eventName])
  return null
}
