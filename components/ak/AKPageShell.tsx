'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell, Command, Menu, Plus, Search, X, Activity, Radio, ShieldCheck } from 'lucide-react'
import AKSidebar from './AKSidebar'

const commands = [
  ['Nuevo archivo', '/nuevo-pedido'], ['Operaciones', '/pedidos'], ['Versiones', '/descargas'],
  ['Garage', '/garage'], ['Knowledge Base', '/biblioteca'], ['Soporte técnico', '/soporte'],
  ['AK Intelligence', '/intelligence'], ['Mi workspace', '/perfil'],
]

export default function AKPageShell({ children, title, subtitle, eyebrow = 'AK LAB OS', actions }: { children: React.ReactNode; title?: string; subtitle?: string; eyebrow?: string; actions?: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [query, setQuery] = useState('')
  const surfaceRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setCommandOpen(v => !v) }
      if (event.key === 'Escape') { setCommandOpen(false); setMobileOpen(false) }
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
    const q = query.trim().toLowerCase()
    return q ? commands.filter(([label]) => label.toLowerCase().includes(q)) : commands
  }, [query])

  return <main ref={surfaceRef} className="titan-root flex min-h-screen text-white">
    <AKSidebar />
    {mobileOpen && <div className="fixed inset-0 z-[90] lg:hidden"><button aria-label="Cerrar" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md"/><div className="relative h-full w-[min(88vw,330px)]"><AKSidebar mobile onClose={() => setMobileOpen(false)}/></div></div>}

    <section className="relative z-10 min-w-0 flex-1">
      <header className="titan-topbar sticky top-0 z-40 flex min-h-[76px] items-center justify-between px-4 lg:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="titan-icon-button lg:hidden"><Menu size={19}/></button>
          <button onClick={() => setCommandOpen(true)} className="titan-search hidden md:flex"><Search size={17}/><span>Buscar pedido, ECU, HW, SW...</span><kbd><Command size={11}/> K</kbd></button>
        </div>
        <div className="hidden items-center gap-5 xl:flex">
          <span className="titan-status"><Radio size={13}/> Realtime sync</span>
          <span className="titan-status"><ShieldCheck size={13}/> Secure workspace</span>
          <span className="titan-status"><Activity size={13}/> All systems nominal</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/nuevo-pedido" className="titan-primary"><Plus size={16}/> Nueva operación</Link>
          <Link href="/notificaciones" className="titan-icon-button relative"><Bell size={18}/><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#e5a05d] shadow-[0_0_12px_rgba(229,160,93,.9)]"/></Link>
        </div>
      </header>

      <div className="relative mx-auto max-w-[1760px] p-4 pb-24 sm:p-6 lg:p-8 lg:pb-10 xl:p-10">
        {(title || subtitle) && <div className="titan-page-head mb-9 flex flex-col justify-between gap-5 xl:flex-row xl:items-end"><div><div className="titan-kicker">{eyebrow}</div>{title && <h1 className="titan-title mt-4 text-4xl sm:text-5xl xl:text-6xl">{title}</h1>}{subtitle && <p className="mt-4 max-w-3xl text-sm leading-7 text-white/42">{subtitle}</p>}</div>{actions}</div>}
        <div className="titan-reveal">{children}</div>
      </div>
    </section>

    <nav className="titan-mobile-nav fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 items-center p-2 lg:hidden"><Link href="/dashboard">Inicio</Link><Link href="/pedidos">Trabajos</Link><Link href="/nuevo-pedido" className="titan-mobile-add"><Plus size={21}/></Link><Link href="/notificaciones">Avisos</Link><Link href="/perfil">Perfil</Link></nav>

    {commandOpen && <div className="fixed inset-0 z-[120] grid place-items-start bg-black/75 px-4 pt-[12vh] backdrop-blur-xl"><button aria-label="Cerrar" onClick={() => setCommandOpen(false)} className="absolute inset-0"/><section className="titan-command relative z-10 w-full max-w-2xl overflow-hidden"><div className="flex items-center gap-3 border-b border-white/[.07] px-5 py-4"><Search size={19} className="text-[#e5a05d]"/><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar en AK LAB OS..." className="w-full bg-transparent text-base outline-none placeholder:text-white/25"/><button onClick={() => setCommandOpen(false)} className="titan-icon-button !h-8 !w-8"><X size={15}/></button></div><div className="max-h-[420px] overflow-auto p-2">{filtered.map(([label, href], index) => <Link key={href} href={href} onClick={() => setCommandOpen(false)} className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-white/62 transition hover:bg-white/[.055] hover:text-white"><span>{label}</span><span className="font-mono text-xs text-white/18">0{index + 1}</span></Link>)}</div></section></div>}
  </main>
}
