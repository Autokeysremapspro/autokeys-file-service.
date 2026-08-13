'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const SESSION_KEY = 'akcloud-phase2-intro-seen'

export default function AKSessionIntro() {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return
      sessionStorage.setItem(SESSION_KEY, '1')
      setVisible(true)

      const fadeTimer = window.setTimeout(() => setLeaving(true), 1850)
      const closeTimer = window.setTimeout(() => setVisible(false), 2350)
      return () => {
        window.clearTimeout(fadeTimer)
        window.clearTimeout(closeTimer)
      }
    } catch {
      // Si sessionStorage no está disponible, no bloqueamos la navegación.
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[200] grid place-items-center overflow-hidden bg-[#030406] transition-opacity duration-500 ${leaving ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      role="status"
      aria-label="Iniciando AK Cloud"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(220,38,38,.18),transparent_30%),radial-gradient(circle_at_50%_52%,rgba(255,255,255,.035),transparent_48%)]" />
      <div className="absolute inset-x-[8%] top-1/2 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent shadow-[0_0_28px_rgba(239,68,68,.45)]" />

      <div className="relative flex flex-col items-center px-6 text-center motion-safe:animate-[akIntroRise_.75s_ease-out_both]">
        <div className="relative mb-7 h-24 w-24 sm:h-28 sm:w-28">
          <div className="absolute inset-2 rounded-full bg-red-500/10 blur-2xl" />
          <Image
            src="/images/brand/autokeys-logo-small-transparent.webp"
            alt="Autokeys Remaps Pro"
            fill
            priority
            sizes="112px"
            className="object-contain drop-shadow-[0_0_24px_rgba(239,68,68,.28)]"
          />
        </div>

        <div className="text-[10px] font-black uppercase tracking-[.42em] text-red-400/80 sm:text-xs">
          Autokeys Remaps Pro
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-[.16em] text-white sm:text-5xl">AK CLOUD</h1>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[.25em] text-white/35 sm:text-sm">
          Professional File Service
        </p>

        <div className="mt-9 h-[2px] w-40 overflow-hidden rounded-full bg-white/5 sm:w-52">
          <div className="h-full w-full origin-left bg-gradient-to-r from-red-700 via-red-500 to-red-300 motion-safe:animate-[akIntroLoad_1.8s_ease-in-out_both]" />
        </div>
      </div>

      <style jsx>{`
        @keyframes akIntroRise {
          from { opacity: 0; transform: translateY(12px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes akIntroLoad {
          from { transform: scaleX(0); opacity: .55; }
          to { transform: scaleX(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
