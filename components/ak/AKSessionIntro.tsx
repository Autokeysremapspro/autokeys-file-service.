'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const SESSION_KEY = 'akcloud-phase2-intro-seen'
const INTRO_MS = 6500
const FADE_MS = 600

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
      // La intro nunca debe bloquear la navegación si el almacenamiento de sesión falla.
    }
  }, [])

  if (!visible) return null

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#020305]/94 px-4 py-7 backdrop-blur-2xl transition-opacity duration-700 ${leaving ? 'pointer-events-none opacity-0' : 'opacity-100'}`} role="dialog" aria-modal="true" aria-label="Bienvenido a AK Cloud">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(220,38,38,.22),transparent_22%),radial-gradient(circle_at_50%_50%,rgba(255,255,255,.035),transparent_40%),linear-gradient(180deg,#020305,#05070b)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:54px_54px] [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]" />
      <div className="absolute left-1/2 top-1/2 h-[min(88vw,760px)] w-[min(88vw,760px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-500/10 motion-safe:animate-[akIntroOrbit_7s_linear_infinite]" />
      <div className="absolute left-1/2 top-1/2 h-[min(68vw,560px)] w-[min(68vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[.055] motion-safe:animate-[akIntroOrbitReverse_9s_linear_infinite]" />
      <div className="absolute left-[8%] top-[20%] h-px w-[28%] bg-gradient-to-r from-transparent via-red-500/25 to-transparent motion-safe:animate-[akIntroScan_3.2s_ease-in-out_infinite]" />
      <div className="absolute bottom-[22%] right-[7%] h-px w-[30%] bg-gradient-to-r from-transparent via-white/10 to-transparent motion-safe:animate-[akIntroScan_3.8s_ease-in-out_infinite_reverse]" />

      <button type="button" onClick={closeIntro} className="absolute right-4 top-4 z-30 rounded-full border border-white/10 bg-white/[.035] px-4 py-2 text-[10px] font-black uppercase tracking-[.18em] text-white/45 backdrop-blur-xl transition hover:border-red-400/35 hover:bg-red-500/10 hover:text-white sm:right-7 sm:top-7" aria-label="Saltar introducción">Saltar</button>

      <section className="relative z-10 flex w-full max-w-[920px] flex-col items-center text-center motion-safe:animate-[akIntroEnter_.9s_cubic-bezier(.16,.8,.2,1)_both]">
        <div className="mb-5 text-[9px] font-black uppercase tracking-[.48em] text-white/34 sm:text-[10px]">Autokeys Remaps Pro</div>

        <div className="relative flex h-60 w-60 items-center justify-center sm:h-80 sm:w-80 lg:h-[360px] lg:w-[360px]">
          <div className="absolute inset-0 rounded-full bg-red-600/12 blur-[60px] motion-safe:animate-[akIntroGlow_2.8s_ease-in-out_infinite]" />
          <div className="absolute inset-[7%] rounded-full border border-red-400/18 shadow-[0_0_80px_rgba(220,38,38,.16),inset_0_0_50px_rgba(220,38,38,.05)] motion-safe:animate-[akIntroRing_3s_ease-in-out_infinite]" />
          <div className="absolute inset-[17%] rounded-full border border-white/[.055]" />
          <span className="absolute left-1/2 top-[3%] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-red-400 shadow-[0_0_18px_rgba(248,113,113,.9)] motion-safe:animate-[akIntroDot_3s_ease-in-out_infinite]" />
          <Image src="/images/brand/autokeys-logo-small-transparent.webp" alt="Autokeys Remaps Pro" fill priority sizes="(max-width: 640px) 240px, (max-width: 1024px) 320px, 360px" className="scale-[1.08] object-contain drop-shadow-[0_18px_55px_rgba(0,0,0,.8)] drop-shadow-[0_0_42px_rgba(239,68,68,.3)] motion-safe:animate-[akIntroLogoFloat_3.8s_ease-in-out_infinite]" />
        </div>

        <div className="-mt-2 sm:-mt-4">
          <h1 className="bg-gradient-to-b from-white via-white to-white/55 bg-clip-text text-5xl font-black leading-none tracking-[.12em] text-transparent sm:text-7xl lg:text-[82px]">AK CLOUD</h1>
          <div className="mx-auto mt-4 h-px w-48 bg-gradient-to-r from-transparent via-red-400/70 to-transparent sm:w-72" />
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[.34em] text-white/36 sm:text-xs">Powered by Autokeys Remaps Pro</p>
          <p className="mx-auto mt-4 max-w-xl text-xs leading-6 text-white/36 sm:text-sm">File intelligence workspace · seguro · conectado · profesional</p>
        </div>

        <div className="mt-8 w-full max-w-md sm:mt-10">
          <div className="mb-2 flex items-center justify-between text-[8px] font-black uppercase tracking-[.2em] text-white/24"><span>Secure workspace</span><span>Initializing</span></div>
          <div className="h-px overflow-hidden bg-white/[.07]"><div className="h-full w-full origin-left bg-gradient-to-r from-red-950 via-red-500 to-white/70 motion-safe:animate-[akIntroLoad_5.9s_cubic-bezier(.2,.7,.2,1)_both]" /></div>
        </div>
      </section>

      <style jsx>{`
        @keyframes akIntroEnter { from { opacity:0; transform:translateY(18px) scale(.95); filter:blur(8px) } to { opacity:1; transform:none; filter:blur(0) } }
        @keyframes akIntroGlow { 0%,100% { opacity:.45; transform:scale(.92) } 50% { opacity:1; transform:scale(1.08) } }
        @keyframes akIntroRing { 0%,100% { opacity:.42; transform:scale(.96) } 50% { opacity:.9; transform:scale(1.035) } }
        @keyframes akIntroLogoFloat { 0%,100% { transform:translateY(0) scale(1.08) } 50% { transform:translateY(-10px) scale(1.105) } }
        @keyframes akIntroDot { 0%,100% { opacity:.45; transform:translateX(-50%) scale(.8) } 50% { opacity:1; transform:translateX(-50%) scale(1.35) } }
        @keyframes akIntroLoad { from { transform:scaleX(0); opacity:.4 } to { transform:scaleX(1); opacity:1 } }
        @keyframes akIntroOrbit { from { transform:translate(-50%,-50%) rotate(0deg) } to { transform:translate(-50%,-50%) rotate(360deg) } }
        @keyframes akIntroOrbitReverse { from { transform:translate(-50%,-50%) rotate(360deg) } to { transform:translate(-50%,-50%) rotate(0deg) } }
        @keyframes akIntroScan { 0%,100% { opacity:.15; transform:translateX(-12%) } 50% { opacity:.75; transform:translateX(12%) } }
      `}</style>
    </div>
  )
}
