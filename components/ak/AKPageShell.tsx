'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Command, LogOut, Menu, Plus, Search, UserCircle, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import AKSidebar from './AKSidebar'
import AKThemeSwitcher from './AKThemeSwitcher'
import AKNotificationBell from './AKNotificationBell'
import './AKPageShell.css'

const commands = [
  ['Inicio', '/dashboard'],
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
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [contentReady, setContentReady] = useState(false)
  const [account, setAccount] = useState<{ name: string; email: string } | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user
      if (!u) return
      const m = u.user_metadata || {}
      const name = String(m.name || m.nombre || m.empresa || u.email?.split('@')[0] || 'Usuario')
      setAccount({ name, email: u.email || '' })
    })
  }, [])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const initials = useMemo(() => {
    const name = account?.name?.trim()
    if (!name) return 'AK'
    const parts = name.split(/\s+/)
    const letters = `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase()
    return letters || name.slice(0, 2).toUpperCase()
  }, [account])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setContentReady(true))
    return () => window.cancelAnimationFrame(frame)
  }, [pathname])

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
    <main className="ak5-shell ak-page-shell-theme-scope flex min-h-screen text-white">
      <AKSidebar />
      {mobileOpen && <div className="fixed inset-0 z-[90] lg:hidden"><button aria-label="Cerrar navegación" className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMobileOpen(false)} /><div className="relative h-full w-[min(88vw,320px)]"><AKSidebar mobile onClose={() => setMobileOpen(false)} /></div></div>}
      <section className="min-w-0 flex-1 overflow-x-hidden">
        <header className="ak5-topbar sticky top-0 z-40 flex min-h-[68px] items-center justify-between gap-2 px-3 sm:h-[72px] sm:px-4 lg:px-7">
          <div className="flex min-w-0 items-center gap-3"><button aria-label="Abrir navegación" onClick={() => setMobileOpen(true)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[.035] lg:hidden"><Menu size={19}/></button><button onClick={() => setCommandOpen(true)} className="hidden h-11 min-w-[320px] items-center gap-3 rounded-xl border border-white/[.08] bg-black/20 px-4 text-sm text-white/35 transition hover:border-white/15 hover:bg-white/[.035] md:flex xl:min-w-[420px]"><Search size={17}/><span className="truncate">Buscar pedido, ECU, HW, SW, cliente...</span><span className="ml-auto flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[10px]"><Command size={11}/> K</span></button></div>
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2"><AKThemeSwitcher /><Link href="/nuevo-pedido" className="ak5-primary !px-3 !py-2.5 sm:!px-4"><Plus size={16}/><span className="hidden sm:inline">Nueva operación</span></Link><AKNotificationBell />
            <div ref={userMenuRef} className="relative shrink-0">
              <button type="button" onClick={() => setUserMenuOpen((v) => !v)} className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-2 transition hover:border-white/20 sm:pr-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-red-400/25 bg-red-400/10 text-xs font-black text-red-300">{initials}</span>
                <span className="hidden min-w-0 text-left sm:block"><span className="block max-w-[140px] truncate text-xs font-bold text-white/85">{account?.name || 'Cargando...'}</span></span>
                <ChevronDown size={14} className={`hidden shrink-0 text-white/35 transition-transform sm:block ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0b0d] shadow-2xl">
                  <div className="border-b border-white/[.07] px-4 py-3">
                    <div className="truncate text-sm font-bold text-white">{account?.name || 'Usuario'}</div>
                    <div className="truncate text-xs text-white/35">{account?.email}</div>
                  </div>
                  <Link href="/perfil" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 transition hover:bg-white/[.05] hover:text-white"><UserCircle size={16}/> Mi cuenta</Link>
                  <button type="button" onClick={logout} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-300 transition hover:bg-red-400/10"><LogOut size={16}/> Cerrar sesión</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className={`mx-auto max-w-[1720px] p-3 pb-24 transition-[opacity,transform] duration-300 ease-out motion-reduce:translate-y-0 motion-reduce:transition-none sm:p-6 lg:p-8 lg:pb-10 xl:p-10 ${contentReady ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0 motion-reduce:opacity-100'}`}>{(title || subtitle || actions) && <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 xl:flex-row xl:items-end"><div className="min-w-0"><div className="text-[10px] font-black uppercase tracking-[.22em] text-cyan-300/80">{eyebrow}</div>{title && <h1 className="mt-3 break-words text-3xl font-black tracking-tight text-white sm:text-5xl">{title}</h1>}{subtitle && <p className="mt-3 max-w-3xl text-sm leading-7 text-white/45">{subtitle}</p>}</div>{actions && <div className="w-full shrink-0 sm:w-auto">{actions}</div>}</div>}{children}</div>
      </section>
      {commandOpen && <div className="ak-command-overlay fixed inset-0 z-[120] grid place-items-start bg-black/75 px-3 pt-[8vh] backdrop-blur-xl sm:px-4 sm:pt-[12vh]"><button aria-label="Cerrar buscador" className="absolute inset-0" onClick={() => setCommandOpen(false)} /><section className="ak-command-panel relative z-10 w-full max-w-2xl overflow-hidden rounded-[20px] border border-white/12 bg-[#0a0f17]/95 shadow-2xl sm:rounded-[24px]"><div className="flex items-center gap-3 border-b border-white/8 px-4 py-4 sm:px-5"><Search size={18} className="shrink-0 text-cyan-300"/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ir a una sección..." className="min-w-0 w-full bg-transparent outline-none placeholder:text-white/25"/><button aria-label="Cerrar buscador" onClick={()=>setCommandOpen(false)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10"><X size={15}/></button></div><div className="max-h-[min(420px,65vh)] overflow-auto p-2">{filtered.map(([label,href],i)=><Link key={href} href={href} onClick={()=>setCommandOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-white/65 hover:bg-white/[.06] hover:text-white"><span>{label}</span><span className="text-xs text-white/20">0{i+1}</span></Link>)}</div></section></div>}
    </main>
  )
}
