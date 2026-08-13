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
      className={`fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-black/65 px-4 py-8 backdrop-blur-xl transition-opacity duration-700 sm:px-8 ${leaving ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenido a AK Cloud"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(225,29,45,.22),transparent_26%),linear-gradient(180deg,rgba(2,3,5,.72),rgba(2,3,5,.92))]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:46px_46px]" />

      <section className="relative z-10 w-full max-w-[860px] motion-safe:animate-[akIntroFloatIn_1s_cubic-bezier(.2,.75,.2,1)_both]">
        <div className="absolute -inset-10 rounded-[48px] bg-red-600/10 blur-3xl motion-safe:animate-[akIntroGlow_3.4s_ease-in-out_infinite]" />
        <div className="relative overflow-hidden rounded-[30px] border border-white/15 bg-[#080a0e]/88 shadow-[0_30px_120px_rgba(0,0,0,.72),0_0_80px_rgba(220,38,38,.14)] backdrop-blur-2xl sm:rounded-[38px]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/70 to-transparent" />
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-600/10 blur-3xl" />

          <button
            type="button"
            onClick={closeIntro}
            className="absolute right-4 top-4 z-30 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-[10px] font-black uppercase tracking-[.18em] text-white/65 backdrop-blur-xl transition hover:border-red-400/45 hover:bg-red-500/10 hover:text-white sm:right-6 sm:top-6 sm:px-5 sm:py-2.5 sm:text-[11px]"
            aria-label="Saltar introducción"
          >
            Saltar
          </button>

          <div className="relative grid min-h-[520px] items-center gap-2 px-6 py-10 sm:min-h-[580px] sm:px-10 sm:py-12 lg:grid-cols-[1.04fr_.96fr] lg:px-14">
            <div className="order-2 text-center lg:order-1 lg:text-left">
              <div className="text-[10px] font-black uppercase tracking-[.42em] text-red-400/90 sm:text-xs">Autokeys Remaps Pro</div>
              <h1 className="mt-4 text-5xl font-black leading-none tracking-[.08em] text-white sm:text-6xl lg:text-7xl">AK CLOUD</h1>
              <p className="mt-5 max-w-xl text-sm font-semibold leading-6 text-white/58 sm:text-base lg:pr-8">Entorno profesional para gestionar tu trabajo de forma rápida, segura y organizada.</p>
              <div className="mt-7 flex flex-wrap justify-center gap-2 lg:justify-start">
                {['Professional', 'Secure', 'Connected'].map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[.045] px-3.5 py-2 text-[10px] font-black uppercase tracking-[.16em] text-white/55">{item}</span>
                ))}
              </div>
            </div>

            <div className="order-1 flex items-center justify-center lg:order-2">
              <div className="relative h-56 w-56 sm:h-72 sm:w-72 lg:h-80 lg:w-80">
                <div className="absolute inset-2 rounded-full border border-red-500/15 shadow-[0_0_100px_rgba(220,38,38,.24)] motion-safe:animate-[akIntroPulseRing_3s_ease-in-out_infinite]" />
                <div className="absolute inset-8 rounded-full bg-red-600/16 blur-3xl motion-safe:animate-[akIntroGlow_3s_ease-in-out_infinite]" />
                <Image
                  src="/images/brand/autokeys-logo-small-transparent.webp"
                  alt="Autokeys Remaps Pro"
                  fill
                  priority
                  sizes="(max-width: 640px) 224px, (max-width: 1024px) 288px, 320px"
                  className="object-contain drop-shadow-[0_0_46px_rgba(239,68,68,.38)] motion-safe:animate-[akIntroLogoFloat_4s_ease-in-out_infinite]"
                />
              </div>
            </div>
          </div>

          <div className="relative border-t border-white/[.07] px-6 py-4 sm:px-10">
            <div className="mb-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-[.18em] text-white/28"><span>Initializing workspace</span><span>AK Cloud</span></div>
            <div className="h-[2px] overflow-hidden rounded-full bg-white/[.06]"><div className="h-full w-full origin-left bg-gradient-to-r from-red-900 via-red-500 to-red-300 motion-safe:animate-[akIntroLoad_8.35s_linear_both]" /></div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes akIntroFloatIn {
          from { opacity: 0; transform: translateY(24px) scale(.965); filter: blur(7px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes akIntroGlow {
          0%,100% { opacity: .5; transform: scale(.95); }
          50% { opacity: 1; transform: scale(1.06); }
        }
        @keyframes akIntroPulseRing {
          0%,100% { opacity: .35; transform: scale(.96); }
          50% { opacity: .85; transform: scale(1.04); }
        }
        @keyframes akIntroLogoFloat {
          0%,100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.015); }
        }
        @keyframes akIntroLoad {
          from { transform: scaleX(0); opacity: .55; }
          to { transform: scaleX(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
