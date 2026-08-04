'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell, Command, Menu, Plus, Search, X } from 'lucide-react'
import AKSidebar from './AKSidebar'

const commands = [
  ['Nuevo servicio', '/nuevo-pedido'],
  ['Ver trabajos', '/pedidos'],
  ['Versiones y descargas', '/descargas'],
  ['Mis vehículos', '/garage'],
  ['Biblioteca', '/biblioteca'],
  ['Soporte', '/soporte'],
  ['AK Intelligence', '/intelligence'],
  ['Mi cuenta', '/perfil'],
]

export default function AKPageShell({
  children,
  title,
  subtitle,
  eyebrow = 'AK Cloud',
  actions,
}: {
  children: React.ReactNode
  title?: string
  subtitle?: string
  eyebrow?: string
  actions?: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [query, setQuery] = useState('')
  const surfaceRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen((value) => !value)
      }
      if (event.key === 'Escape') {
        setCommandOpen(false)
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    function onPointer(event: PointerEvent) {
      if (!surfaceRef.current) return
      const rect = surfaceRef.current.getBoundingClientRect()
      surfaceRef.current.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`)
      surfaceRef.current.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`)
    }
    window.addEventListener('pointermove', onPointer)
    return () => window.removeEventListener('pointermove', onPointer)
  }, [])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return commands
    return commands.filter(([label]) => label.toLowerCase().includes(normalized))
  }, [query])

  return (
    <main ref={surfaceRef} className="ak-v6-bg flex min-h-screen text-white">
      <AKSidebar />

      {mobileOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <button aria-label="Cerrar menú" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/75 backdrop-blur-md" />
          <div className="relative h-full w-[min(88vw,320px)] animate-[akSlideIn_.28s_ease_both]">
            <AKSidebar mobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <section className="relative z-10 min-w-0 flex-1">
        <header className="ak-v6-topbar sticky top-0 z-40 flex min-h-[78px] items-center justify-between px-4 lg:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="grid h-11 w-11 place-items-center rounded-[14px] border border-white/[.08] bg-white/[.035] lg:hidden">
              <Menu size={19} />
            </button>
            <button onClick={() => setCommandOpen(true)} className="hidden h-11 min-w-[360px] items-center gap-3 rounded-[14px] border border-white/[.075] bg-white/[.03] px-4 text-sm text-white/30 transition hover:border-white/15 hover:bg-white/[.05] md:flex">
              <Search size={17} />
              <span>Buscar pedido, ECU, HW, SW...</span>
              <span className="ml-auto flex items-center gap-1 rounded-lg border border-white/[.08] px-2 py-1 text-[10px]"><Command size={11} /> K</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/nuevo-pedido" className="ak-v6-primary !px-4 !py-2.5 text-xs"><Plus size={16} /> Nuevo servicio</Link>
            <Link href="/notificaciones" className="relative grid h-11 w-11 place-items-center rounded-[14px] border border-white/[.08] bg-white/[.035] text-white/60 transition hover:border-white/15 hover:text-white">
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#e5a05d] shadow-[0_0_12px_rgba(229,160,93,.9)]" />
            </Link>
          </div>
        </header>

        <div className="relative mx-auto max-w-[1700px] p-4 pb-24 sm:p-6 lg:p-8 lg:pb-10 xl:p-10">
          {(title || subtitle) && (
            <div className="ak-v6-page-head mb-9 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <div>
                <div className="ak-v6-kicker">{eyebrow}</div>
                {title && <h1 className="ak-v6-title mt-4 text-4xl sm:text-5xl xl:text-6xl">{title}</h1>}
                {subtitle && <p className="mt-4 max-w-3xl text-sm leading-7 text-white/42">{subtitle}</p>}
              </div>
              {actions}
            </div>
          )}
          <div className="ak-v6-reveal">{children}</div>
        </div>
      </section>

      <nav className="ak-v6-mobile-nav fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 items-center rounded-[22px] border border-white/10 bg-[#090c12]/90 p-2 backdrop-blur-2xl lg:hidden">
        <Link href="/dashboard">Inicio</Link>
        <Link href="/pedidos">Trabajos</Link>
        <Link href="/nuevo-pedido" className="ak-v6-mobile-add"><Plus size={21} /></Link>
        <Link href="/notificaciones">Avisos</Link>
        <Link href="/perfil">Perfil</Link>
      </nav>

      {commandOpen && (
        <div className="fixed inset-0 z-[120] grid place-items-start bg-black/70 px-4 pt-[12vh] backdrop-blur-xl">
          <button aria-label="Cerrar búsqueda" onClick={() => setCommandOpen(false)} className="absolute inset-0" />
          <section className="ak-v6-command relative z-10 w-full max-w-2xl overflow-hidden rounded-[26px] border border-white/12 bg-[#0b0f16]/95 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
              <Search size={19} className="text-[#e5a05d]" />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ir a una sección..." className="w-full bg-transparent text-base outline-none placeholder:text-white/25" />
              <button onClick={() => setCommandOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/40"><X size={15} /></button>
            </div>
            <div className="max-h-[420px] overflow-auto p-2">
              {filtered.map(([label, href], index) => (
                <Link key={href} href={href} onClick={() => setCommandOpen(false)} className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-white/65 transition hover:bg-white/[.06] hover:text-white">
                  <span>{label}</span><span className="text-xs text-white/20">0{index + 1}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
