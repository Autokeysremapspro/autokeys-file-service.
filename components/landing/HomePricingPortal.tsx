'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import PricingSection from './PricingSection'

export default function HomePricingPortal() {
  const pathname = usePathname()
  const [target, setTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (pathname !== '/') return

    const existing = document.getElementById('ak-public-pricing-slot')
    if (existing) {
      setTarget(existing)
      return
    }

    const anchor = document.getElementById('precios')
    if (!anchor?.parentElement) return

    const slot = document.createElement('div')
    slot.id = 'ak-public-pricing-slot'
    anchor.parentElement.insertBefore(slot, anchor)
    setTarget(slot)

    return () => {
      setTarget(null)
      slot.remove()
    }
  }, [pathname])

  if (pathname !== '/' || !target) return null
  return createPortal(<PricingSection />, target)
}
