'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Bell, Command, LogOut, Menu, Plus, Search, ShieldCheck, Sparkles, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
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

export default function AKPageShell({ children, title, subtitle, eyebrow = 'AK LAB OS', actions }: { children: React.ReactNode; title?: string; subtitle?: string; eyebrow?: string; actions?: React.ReactNode }) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setCommandOpen(v => !v) }
      if (event.key === 'Escape') { setCommandOpen(false); setMobileOpen(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen || commandOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen, commandOpen])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? commands.filter(([label]) => label.toLowerCase().includes(q)) : commands
  }, [query])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main className="ak5-shell flex min-h-screen text-white">
      <AKSidebar />
      {mobileOpen && <div className="fixed inset-0 z-[90] lg:hidden"><button aria-label="Cerrar navegación" className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMobileOpen(false)} /><div className="relative h-full w-[min(88vw,320px)]"><AKSidebar mobile onClose={() => setMobileOpen(false)} /></div></div>}
      <section className="min-w-0 flex-1 overflow-x-hidden">
        <header className="ak5-topbar sticky top-0 z-40 flex min-h-[68px] items-center justify-between gap-2 px-3 sm:h-[72px] sm:px-4 lg:px-7">
          <div className="flex min-w-0 items-center gap-3"><button aria-label="Abrir navegación" onClick={() => setMobileOpen(true)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[.035] lg:hidden"><Menu size={19}/></button><button onClick={() => setCommandOpen(true)} className="hidden h-11 min-w-[320px] items-center gap-3 rounded-xl border border-white/[.08] bg-black/20 px-4 text-sm text-white/35 transition hover:border-white/15 hover:bg-white/[.035] md:flex xl:min-w-[420px]"><Search size={17}/><span className="truncate">Buscar pedido, ECU, HW, SW, cliente...</span><span className="ml-auto flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[10px]"><Command size={11}/> K</span></button></div>
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2"><div className="ak5-desktop-only hidden items-center gap-5 text-[11px] font-bold text-white/45 xl:flex"><span className="flex items-center gap-2"><i className="ak5-live h-2 w-2 rounded-full bg-emerald-400"/> Realtime Sync</span><span className="flex items-center gap-2"><ShieldCheck size={15}/> Secure Workspace</span><span className="flex items-center gap-2"><Sparkles size={15}/> AI Systems Online</span></div><AKThemeSwitcher /><Link href="/nuevo-pedido" className="ak5-primary !px-3 !py-2.5 sm:!px-4"><Plus size={16}/><span className="hidden sm:inline">Nueva operación</span></Link><Link aria-label="Notificaciones" href="/notificaciones" className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[.035] text-white/65"><Bell size={18}/><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--ak5-red)] shadow-[0_0_12px_rgba(255,66,90,.9)]"/></Link><button type="button" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[.035] text-white/65 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300"><LogOut size={18}/></button></div>
        </header>
        <div className="mx-auto max-w-[1720px] p-3 pb-24 sm:p-6 lg:p-8 lg:pb-10 xl:p-10">{(title || subtitle || actions) && <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 xl:flex-row xl:items-end"><div className="min-w-0"><div className="text-[10px] font-black uppercase tracking-[.22em] text-cyan-300/80">{eyebrow}</div>{title && <h1 className="mt-3 break-words text-3xl font-black tracking-tight text-white sm:text-5xl">{title}</h1>}{subtitle && <p className="mt-3 max-w-3xl text-sm leading-7 text-white/45">{subtitle}</p>}</div>{actions && <div className="w-full shrink-0 sm:w-auto">{actions}</div>}</div>}{children}</div>
      </section>
      {commandOpen && <div className="fixed inset-0 z-[120] grid place-items-start bg-black/75 px-3 pt-[8vh] backdrop-blur-xl sm:px-4 sm:pt-[12vh]"><button aria-label="Cerrar buscador" className="absolute inset-0" onClick={() => setCommandOpen(false)} /><section className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[20px] border border-white/12 bg-[#0a0f17]/95 shadow-2xl sm:rounded-[24px]"><div className="flex items-center gap-3 border-b border-white/8 px-4 py-4 sm:px-5"><Search size={18} className="shrink-0 text-cyan-300"/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ir a una sección..." className="min-w-0 w-full bg-transparent outline-none placeholder:text-white/25"/><button aria-label="Cerrar buscador" onClick={()=>setCommandOpen(false)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10"><X size={15}/></button></div><div className="max-h-[min(420px,65vh)] overflow-auto p-2">{filtered.map(([label,href],i)=><Link key={href} href={href} onClick={()=>setCommandOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-white/65 hover:bg-white/[.06] hover:text-white"><span>{label}</span><span className="text-xs text-white/20">0{i+1}</span></Link>)}</div></section></div>}
    </main>
  )
}