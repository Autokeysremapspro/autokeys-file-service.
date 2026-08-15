'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import part00 from './intro-data/part00'
import part01 from './intro-data/part01'
import part02 from './intro-data/part02'
import part03 from './intro-data/part03'
import part04 from './intro-data/part04'
import part05 from './intro-data/part05'

const SESSION_KEY = 'akcloud-phase2-intro-seen'
const INTRO_MS = 8000
const FADE_MS = 700
const VIDEO_SRC = `data:video/mp4;base64,${part00}${part01}${part02}${part03}${part04}${part05}`

export default function AKSessionIntro() {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
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
      timers.current.push(window.setTimeout(closeIntro, INTRO_MS))
      return () => timers.current.forEach(window.clearTimeout)
    } catch {
      // La intro nunca debe bloquear la navegación si sessionStorage no está disponible.
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
      {!videoFailed && (
        <>
          <video
            src={VIDEO_SRC}
            autoPlay
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            onCanPlay={() => setVideoReady(true)}
            onEnded={closeIntro}
            onError={() => setVideoFailed(true)}
            className={`absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-2xl transition-opacity duration-700 ${videoReady ? 'opacity-45' : 'opacity-0'}`}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center px-0 sm:px-6">
            <video
              src={VIDEO_SRC}
              autoPlay
              muted
              playsInline
              preload="auto"
              aria-label="Introducción de Autokeys Remaps Pro y AK Cloud"
              onCanPlay={() => setVideoReady(true)}
              onEnded={closeIntro}
              onError={() => setVideoFailed(true)}
              className={`h-full max-h-[100dvh] w-auto max-w-full object-cover shadow-[0_0_120px_rgba(0,0,0,.75)] transition-all duration-700 sm:rounded-[28px] sm:border sm:border-white/10 ${videoReady ? 'scale-100 opacity-100' : 'scale-[1.02] opacity-0'}`}
            />
          </div>
        </>
      )}

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,3,5,.28),transparent_28%,transparent_68%,rgba(2,3,5,.78))]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/75 to-transparent" />

      {(!videoReady || videoFailed) && (
        <div className="absolute inset-0 grid place-items-center bg-[#020305]">
          <div className="relative h-52 w-52 sm:h-64 sm:w-64">
            <div className="absolute inset-0 rounded-full bg-red-600/15 blur-3xl" />
            <Image src="/images/brand/autokeys-logo-small-transparent.webp" alt="Autokeys Remaps Pro" fill priority className="object-contain drop-shadow-[0_0_36px_rgba(239,68,68,.3)]" />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={closeIntro}
        className="absolute right-4 top-4 z-30 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-[10px] font-black uppercase tracking-[.18em] text-white/70 backdrop-blur-xl transition hover:border-red-400/40 hover:bg-red-500/15 hover:text-white sm:right-7 sm:top-7"
        aria-label="Saltar introducción"
      >
        Saltar
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-7 z-20 flex flex-col items-center px-5 text-center sm:bottom-10">
        <p className="text-[9px] font-black uppercase tracking-[.42em] text-white/55 sm:text-[10px]">Autokeys Remaps Pro</p>
        <h1 className="mt-2 text-3xl font-black tracking-[.14em] text-white drop-shadow-2xl sm:text-5xl">AK CLOUD</h1>
        <div className="mt-4 h-px w-36 bg-gradient-to-r from-transparent via-red-400/80 to-transparent sm:w-52" />
      </div>
    </div>
  )
}
