'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const SESSION_KEY = 'akcloud-intro-video-v4-seen'
const INTRO_MS = 13000
const FADE_MS = 650
const VIDEO_SRC = '/api/ak-intro?v=4'

export default function AKSessionIntro() {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const timers = useRef<number[]>([])
  const videoRef = useRef<HTMLVideoElement | null>(null)

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

  useEffect(() => {
    if (!visible || !videoRef.current) return
    const video = videoRef.current
    video.muted = true
    const playPromise = video.play()
    if (playPromise) playPromise.catch(() => setVideoFailed(true))
  }, [visible])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[200] overflow-hidden bg-[#020305] transition-opacity duration-700 ${leaving ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenido a AK Cloud"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(220,38,38,.16),transparent_32%),linear-gradient(180deg,#020305,#05070b)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:52px_52px]" />

      {!videoFailed && (
        <div className="absolute inset-0 flex items-center justify-center md:px-8 md:py-6">
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            autoPlay
            muted
            playsInline
            preload="auto"
            poster="/images/brand/autokeys-logo-small-transparent.webp"
            aria-label="Introducción de Autokeys Remaps Pro y AK Cloud"
            onLoadedData={() => setVideoReady(true)}
            onCanPlay={(event) => {
              setVideoReady(true)
              event.currentTarget.play().catch(() => setVideoFailed(true))
            }}
            onEnded={closeIntro}
            onError={() => setVideoFailed(true)}
            className={`absolute inset-0 h-[100dvh] w-full object-cover object-center transition-all duration-700 md:static md:h-[min(92dvh,900px)] md:w-auto md:max-w-[min(86vw,520px)] md:rounded-[30px] md:border md:border-white/10 md:object-contain md:shadow-[0_0_120px_rgba(0,0,0,.8)] ${videoReady ? 'scale-100 opacity-100' : 'scale-[1.01] opacity-0'}`}
          />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,3,5,.16),transparent_24%,transparent_72%,rgba(2,3,5,.58))] md:bg-[linear-gradient(180deg,rgba(2,3,5,.28),transparent_28%,transparent_68%,rgba(2,3,5,.76))]" />

      {(!videoReady || videoFailed) && (
        <div className="absolute inset-0 grid place-items-center bg-[#020305]">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="relative h-40 w-40 sm:h-52 sm:w-52">
              <div className="absolute inset-0 rounded-full bg-red-600/15 blur-3xl" />
              <Image src="/images/brand/autokeys-logo-small-transparent.webp" alt="Autokeys Remaps Pro" fill priority className="object-contain drop-shadow-[0_0_36px_rgba(239,68,68,.3)]" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-[.14em] text-white">AK CLOUD</div>
              <div className="mt-2 text-[9px] font-black uppercase tracking-[.3em] text-white/35">Powered by Autokeys Remaps Pro</div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={closeIntro}
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-30 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-[10px] font-black uppercase tracking-[.18em] text-white/85 backdrop-blur-xl transition hover:border-red-400/40 hover:bg-red-500/15 hover:text-white md:right-7 md:top-7"
        aria-label="Saltar introducción"
      >
        Saltar
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-9 z-20 hidden flex-col items-center px-5 text-center md:flex">
        <p className="text-[10px] font-black uppercase tracking-[.42em] text-white/55">Autokeys Remaps Pro</p>
        <h1 className="mt-2 text-5xl font-black tracking-[.14em] text-white drop-shadow-2xl">AK CLOUD</h1>
        <div className="mt-4 h-px w-52 bg-gradient-to-r from-transparent via-red-400/80 to-transparent" />
      </div>
    </div>
  )
}
