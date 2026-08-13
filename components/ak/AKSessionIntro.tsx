'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const SESSION_KEY = 'akcloud-phase2-intro-seen'
const INTRO_MS = 9000
const FADE_MS = 650

export default function AKSessionIntro() {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const timers = useRef<number[]>([])

  function closeIntro() {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
    setLeaving(true)
    timers.current.push(window.setTimeout(() => setVisible(false), FADE_MS))
  }

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return
      sessionStorage.setItem(SESSION_KEY, '1')
      setVisible(true)
      timers.current.push(window.setTimeout(() => setLeaving(true), INTRO_MS - FADE_MS))
      timers.current.push(window.setTimeout(() => setVisible(false), INTRO_MS))
      return () => timers.current.forEach(window.clearTimeout)
    } catch {
      // Si sessionStorage no está disponible, no bloqueamos la navegación.
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[200] overflow-hidden bg-[#020305] transition-opacity duration-700 ${leaving ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenido a AK Cloud"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(225,29,45,.24),transparent_22%),radial-gradient(circle_at_50%_52%,rgba(255,255,255,.045),transparent_44%),linear-gradient(180deg,#020305_0%,#06070a_55%,#020305_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-500/10 shadow-[0_0_120px_rgba(220,38,38,.13)] sm:h-[560px] sm:w-[560px]" />

      <button
        type="button"
        onClick={closeIntro}
        className="absolute right-4 top-4 z-20 rounded-full border border-white/15 bg-black/35 px-5 py-2.5 text-[11px] font-black uppercase tracking-[.18em] text-white/70 backdrop-blur-xl transition hover:border-red-400/45 hover:bg-red-500/10 hover:text-white sm:right-7 sm:top-7"
        aria-label="Saltar introducción"
      >
        Skip
      </button>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="motion-safe:animate-[akIntroRise_1.1s_ease-out_both]">
          <div className="relative mx-auto mb-8 h-32 w-32 sm:h-40 sm:w-40">
            <div className="absolute inset-3 rounded-full bg-red-600/15 blur-3xl motion-safe:animate-[akIntroGlow_3s_ease-in-out_infinite]" />
            <Image
              src="/images/brand/autokeys-logo-small-transparent.webp"
              alt="Autokeys Remaps Pro"
              fill
              priority
              sizes="160px"
              className="object-contain drop-shadow-[0_0_34px_rgba(239,68,68,.35)]"
            />
          </div>

          <div className="text-[10px] font-black uppercase tracking-[.48em] text-red-400/85 sm:text-xs">Bienvenido a</div>
          <div className="mt-4 text-sm font-black uppercase tracking-[.24em] text-white/75 sm:text-base">Autokeys Remaps Pro</div>
          <h1 className="mt-4 text-4xl font-black tracking-[.14em] text-white sm:text-6xl">AK CLOUD</h1>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[.28em] text-white/35 sm:text-sm">Professional File Service</p>
        </div>

        <div className="absolute bottom-12 left-1/2 w-[min(72vw,420px)] -translate-x-1/2 sm:bottom-16">
          <div className="mb-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-[.18em] text-white/25"><span>Secure workspace</span><span>AK Cloud</span></div>
          <div className="h-[2px] overflow-hidden rounded-full bg-white/[.06]">
            <div className="h-full w-full origin-left bg-gradient-to-r from-red-800 via-red-500 to-red-300 motion-safe:animate-[akIntroLoad_8.35s_linear_both]" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes akIntroRise {
          from { opacity: 0; transform: translateY(18px) scale(.975); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes akIntroGlow {
          0%,100% { opacity: .55; transform: scale(.92); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes akIntroLoad {
          from { transform: scaleX(0); opacity: .55; }
          to { transform: scaleX(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
