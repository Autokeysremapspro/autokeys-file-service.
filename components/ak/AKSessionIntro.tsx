'use client'

import { useEffect, useRef, useState } from 'react'

const SESSION_KEY = 'akcloud-intro-static-v7-seen'
const INTRO_MS = 7000
const FADE_MS = 650
const INTRO_SRC = '/api/ak-intro-image?v=7'

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
      timers.current.push(window.setTimeout(closeIntro, INTRO_MS))
    } catch {
      setVisible(true)
      timers.current.push(window.setTimeout(closeIntro, INTRO_MS))
    }

    return () => timers.current.forEach(window.clearTimeout)
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[200] overflow-hidden bg-black transition-opacity duration-700 ${leaving ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenido a AK Cloud"
    >
      <img
        src={INTRO_SRC}
        alt="Autokeys Remaps Pro — Bienvenidos a AK Cloud"
        className="absolute inset-0 h-[100dvh] w-full object-contain object-center md:object-contain"
        draggable={false}
      />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.03),transparent_18%,transparent_82%,rgba(0,0,0,.16))]" />

      <button
        type="button"
        onClick={closeIntro}
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-30 rounded-full border border-white/20 bg-black/55 px-4 py-2 text-[10px] font-black uppercase tracking-[.18em] text-white/90 backdrop-blur-xl transition hover:border-red-400/50 hover:bg-red-500/20 hover:text-white md:right-7 md:top-7"
        aria-label="Saltar introducción"
      >
        Saltar
      </button>
    </div>
  )
}
