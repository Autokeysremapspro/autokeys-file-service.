'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Bell, Command, Menu, Plus, Search, ShieldCheck, Sparkles, X } from 'lucide-react'
import AKSidebar from './AKSidebar'
import AKThemeSwitcher from './AKThemeSwitcher'

const commands = [
  ['Mission Control', '/dashboard'],
  ['Nuevo pedido', '/nuevo-pedido'],
  ['Pedidos', '/pedidos'],
  ['Versiones', '/descargas'],
  ['Garage', '/garage'],
  ['Biblioteca', '/biblioteca'],
  ['AK Intelligence', '/intelligence'],
  ['Soporte', '/soporte'],
  ['Mi cuenta', '/perfil'],
]

export default function AKPageShell({
  children,
  title,
  subtitle,
  eyebrow = 'AK LAB OS',
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

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); setCommandOpen(v => !v)
      }
      if (event.key === 'Escape') { setCommandOpen(false); setMobileOpen(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? commands.filter(([label]) => label.toLowerCase().includes(q)) : commands
  }, [query])

  return (
    <main className="ak5-shell flex min-h-screen text-white">
      <AKSidebar />

      {mobileOpen && <div className="fixed inset-0 z-[90] lg:hidden">
        <button className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMobileOpen(false)} />
        <div className="relative h-full w-[min(88vw,320px)]"><AKSidebar mobile onClose={() => setMobileOpen(false)} /></div>
      </div>}

      <section className="min-w-0 flex-1">
        <header className="ak5-topbar sticky top-0 z-40 flex h-[72px] items-center justify-between px-4 lg:px-7">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[.035] lg:hidden"><Menu size={19}/></button>
            <button onClick={() => setCommandOpen(true)} className="hidden h-11 min-w-[420px] items-center gap-3 rounded-xl border border-white/[.08] bg-black/20 px-4 text-sm text-white/35 transition hover:border-white/15 hover:bg-white/[.035] md:flex">
              <Search size={17}/><span>Buscar pedido, ECU, HW, SW, cliente...</span><span className="ml-auto flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[10px]"><Command size={11}/> K</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="ak5-desktop-only hidden items-center gap-5 text-[11px] font-bold text-white/45 xl:flex">
              <span className="flex items-center gap-2"><i className="ak5-live h-2 w-2 rounded-full bg-emerald-400"/> Realtime Sync</span>
              <span className="flex items-center gap-2"><ShieldCheck size={15}/> Secure Workspace</span>
              <span className="flex items-center gap-2"><Sparkles size={15}/> AI Systems Online</span>
            </div>
            <AKThemeSwitcher />
            <Link href="/nuevo-pedido" className="ak5-primary !px-4 !py-2.5"><Plus size={16}/> Nueva operación</Link>
            <Link href="/notificaciones" className="relative grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[.035] text-white/65"><Bell size={18}/><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--ak5-red)] shadow-[0_0_12px_rgba(255,66,90,.9)]"/></Link>
          </div>
        </header>
        <div className="mx-auto max-w-[1720px] p-4 pb-24 sm:p-6 lg:p-8 lg:pb-10 xl:p-10">
          {(title || subtitle || actions) && (
            <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[.22em] text-cyan-300/80">{eyebrow}</div>
                {title && <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">{title}</h1>}
                {subtitle && <p className="mt-3 max-w-3xl text-sm leading-7 text-white/45">{subtitle}</p>}
              </div>
              {actions && <div className="shrink-0">{actions}</div>}
            </div>
          )}
          {children}
        </div>
      </section>

      {commandOpen && <div className="fixed inset-0 z-[120] grid place-items-start bg-black/75 px-4 pt-[12vh] backdrop-blur-xl">
        <button className="absolute inset-0" onClick={() => setCommandOpen(false)} />
        <section className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[24px] border border-white/12 bg-[#0a0f17]/95 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4"><Search size={18} className="text-cyan-300"/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ir a una sección..." className="w-full bg-transparent outline-none placeholder:text-white/25"/><button onClick={()=>setCommandOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10"><X size={15}/></button></div>
          <div className="max-h-[420px] overflow-auto p-2">{filtered.map(([label,href],i)=><Link key={href} href={href} onClick={()=>setCommandOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-white/65 hover:bg-white/[.06] hover:text-white"><span>{label}</span><span className="text-xs text-white/20">0{i+1}</span></Link>)}</div>
        </section>
      </div>}
    </main>
  )
}
