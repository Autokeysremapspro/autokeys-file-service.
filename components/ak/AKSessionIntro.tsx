'use client'

import { useEffect, useRef, useState } from 'react'

const SESSION_KEY = 'akcloud-intro-static-v14-seen'
const INTRO_MS = 7000
const FADE_MS = 650
const INTRO_SLICES = [
  '/akcloud-intro-v13-0.jpg',
  '/akcloud-intro-v13-1.jpg',
  '/akcloud-intro-v13-2.jpg',
  '/akcloud-intro-v13-3.jpg',
]

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
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <div
          className="flex flex-col overflow-hidden"
          style={{
            width: 'min(100vw, calc(100dvh * 9 / 16))',
            height: 'min(100dvh, calc(100vw * 16 / 9))',
          }}
          aria-label="Autokeys Remaps Pro — Bienvenidos a AK Cloud"
        >
          {INTRO_SLICES.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={index === 0 ? 'Autokeys Remaps Pro — Bienvenidos a AK Cloud' : ''}
              className="block h-1/4 w-full shrink-0 object-fill"
              draggable={false}
            />
          ))}
        </div>
      </div>

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
