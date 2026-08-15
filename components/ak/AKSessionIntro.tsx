'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import part00 from './intro-data/part00'
import part01 from './intro-data/part01'
import part02 from './intro-data/part02'
import part03 from './intro-data/part03'
import part04 from './intro-data/part04'
import part05 from './intro-data/part05'

const SESSION_KEY = 'akcloud-phase2-intro-v2-mobile-seen'
const INTRO_MS = 8000
const FADE_MS = 700
const VIDEO_BASE64 = `${part00}${part01}${part02}${part03}${part04}${part05}`

function createVideoObjectUrl() {
  const binary = window.atob(VIDEO_BASE64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return URL.createObjectURL(new Blob([bytes], { type: 'video/mp4' }))
}

export default function AKSessionIntro() {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const timers = useRef<number[]>([])

  function closeIntro() {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
    setLeaving(true)
    timers.current.push(window.setTimeout(() => setVisible(false), FADE_MS))
  }

  useEffect(() => {
    let objectUrl: string | null = null

    try {
      if (sessionStorage.getItem(SESSION_KEY)) return
      sessionStorage.setItem(SESSION_KEY, '1')
      setVisible(true)

      objectUrl = createVideoObjectUrl()
      setVideoSrc(objectUrl)
      timers.current.push(window.setTimeout(closeIntro, INTRO_MS))
    } catch {
      setVideoFailed(true)
      setVisible(true)
      timers.current.push(window.setTimeout(closeIntro, INTRO_MS))
    }

    return () => {
      timers.current.forEach(window.clearTimeout)
      if (objectUrl) URL.revokeObjectURL(objectUrl)
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
      {videoSrc && !videoFailed && (
        <>
          <video
            src={videoSrc}
            autoPlay
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            onCanPlay={() => setVideoReady(true)}
            onError={() => setVideoFailed(true)}
            className={`absolute inset-0 hidden h-full w-full scale-110 object-cover opacity-40 blur-2xl transition-opacity duration-700 md:block ${videoReady ? 'opacity-40' : 'opacity-0'}`}
          />

          <div className="absolute inset-0 flex items-center justify-center md:px-8 md:py-6">
            <video
              src={videoSrc}
              autoPlay
              muted
              playsInline
              preload="auto"
              aria-label="Introducción de Autokeys Remaps Pro y AK Cloud"
              onCanPlay={() => setVideoReady(true)}
              onEnded={closeIntro}
              onError={() => setVideoFailed(true)}
              className={`absolute inset-0 h-[100dvh] w-full object-cover object-center transition-all duration-700 md:static md:h-[min(92dvh,900px)] md:w-auto md:max-w-[min(86vw,520px)] md:rounded-[28px] md:border md:border-white/10 md:shadow-[0_0_120px_rgba(0,0,0,.75)] ${videoReady ? 'scale-100 opacity-100' : 'scale-[1.015] opacity-0'}`}
            />
          </div>
        </>
      )}

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,3,5,.2),transparent_24%,transparent_72%,rgba(2,3,5,.62))] md:bg-[linear-gradient(180deg,rgba(2,3,5,.32),transparent_28%,transparent_68%,rgba(2,3,5,.78))]" />

      {(!videoReady || videoFailed) && (
        <div className="absolute inset-0 grid place-items-center bg-[#020305]">
          <div className="relative h-44 w-44 sm:h-56 sm:w-56 md:h-64 md:w-64">
            <div className="absolute inset-0 rounded-full bg-red-600/15 blur-3xl" />
            <Image src="/images/brand/autokeys-logo-small-transparent.webp" alt="Autokeys Remaps Pro" fill priority className="object-contain drop-shadow-[0_0_36px_rgba(239,68,68,.3)]" />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={closeIntro}
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-30 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[10px] font-black uppercase tracking-[.18em] text-white/80 backdrop-blur-xl transition hover:border-red-400/40 hover:bg-red-500/15 hover:text-white md:right-7 md:top-7"
        aria-label="Saltar introducción"
      >
        Saltar
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-10 z-20 hidden flex-col items-center px-5 text-center md:flex">
        <p className="text-[10px] font-black uppercase tracking-[.42em] text-white/55">Autokeys Remaps Pro</p>
        <h1 className="mt-2 text-5xl font-black tracking-[.14em] text-white drop-shadow-2xl">AK CLOUD</h1>
        <div className="mt-4 h-px w-52 bg-gradient-to-r from-transparent via-red-400/80 to-transparent" />
      </div>
    </div>
  )
}
