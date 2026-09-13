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
  ['Knowledge Base', '/biblioteca'],
  ['AK Intelligence', '/intelligence'],
  ['Analítica', '/analitica'],
  ['Soporte / Tickets', '/soporte'],
  ['Actividad', '/notificaciones'],
  ['Mi workspace', '/perfil'],
]

export default function AKPageShell({ children, title, subtitle, eyebrow = 'AK CLOUD', actions }: { children: React.ReactNode; title?: string; subtitle?: string; eyebrow?: string; actions?: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [account, setAccount] = useState<{ name: string; email: string } | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user
      if (!u) return
      const m = u.user_metadata || {}
      setAccount({ name: String(m.name || m.nombre || m.empresa || u.email?.split('@')[0] || 'Usuario'), email: u.email || '' })
    })
  }, [])

  useEffect(() => {
    function outside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', outside)
    return () => document.removeEventListener('mousedown', outside)
  }, [])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setCommandOpen((v) => !v) }
      if (event.key === 'Escape') { setCommandOpen(false); setMobileOpen(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setCommandOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen || commandOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen, commandOpen])

  const initials = useMemo(() => {
    const parts = account?.name.trim().split(/\s+/) || []
    return `${parts[0]?.[0] || 'A'}${parts[1]?.[0] || 'K'}`.toUpperCase()
  }, [account])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? commands.filter(([label]) => label.toLowerCase().includes(q)) : commands
  }, [query])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main className="ak10-shell flex min-h-screen text-white">
      <AKSidebar />

      {mobileOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <button aria-label="Cerrar navegación" className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-[min(86vw,280px)]"><AKSidebar mobile onClose={() => setMobileOpen(false)} /></div>
        </div>
      )}

      <section className="min-w-0 flex-1 overflow-x-hidden">
        <header className="ak10-topbar sticky top-0 z-40 flex h-[68px] items-center justify-between gap-3 px-3 sm:px-5 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button aria-label="Abrir navegación" onClick={() => setMobileOpen(true)} className="ak10-icon-button lg:hidden"><Menu size={19} /></button>
            <button onClick={() => setCommandOpen(true)} className="ak10-search hidden md:flex">
              <Search size={17} />
              <span className="truncate">Buscar por matrícula, cliente, ECU, servicio...</span>
              <span className="ml-auto flex items-center gap-1 rounded border border-white/10 px-2 py-1 text-[10px]"><Command size={10} /> K</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <AKThemeSwitcher />
            <Link href="/nuevo-pedido" className="ak5-primary !px-3 !py-2.5"><Plus size={16} /><span className="hidden sm:inline">Nueva operación</span></Link>
            <AKNotificationBell />
            <div ref={userMenuRef} className="relative">
              <button type="button" onClick={() => setUserMenuOpen((v) => !v)} className="ak10-user">
                <span className="ak10-avatar">{initials}</span>
                <span className="hidden min-w-0 text-left sm:block">
                  <span className="block max-w-[155px] truncate text-sm font-bold text-white">{account?.name || 'AK Cloud'}</span>
                  <span className="block text-xs text-white/40">Taller profesional</span>
                </span>
                <ChevronDown size={14} className="hidden text-white/45 sm:block" />
              </button>
              {userMenuOpen && (
                <div className="ak10-user-menu">
                  <div className="border-b border-white/[.08] px-4 py-3"><div className="truncate text-sm font-bold">{account?.name || 'Usuario'}</div><div className="truncate text-xs text-white/40">{account?.email}</div></div>
                  <Link href="/perfil" className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:bg-white/[.05] hover:text-white"><UserCircle size={16} /> Perfil / Ajustes</Link>
                  <button type="button" onClick={logout} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-300 hover:bg-red-500/10"><LogOut size={16} /> Cerrar sesión</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="ak10-content">
          {(title || subtitle || actions) && (
            <div className="ak10-page-head">
              <div><div className="ak10-eyebrow">{eyebrow}</div>{title && <h1>{title}</h1>}{subtitle && <p>{subtitle}</p>}</div>
              {actions && <div className="shrink-0">{actions}</div>}
            </div>
          )}
          {children}
        </div>
      </section>

      {commandOpen && (
        <div className="fixed inset-0 z-[120] grid place-items-start bg-black/80 px-3 pt-[12vh] backdrop-blur-xl">
          <button aria-label="Cerrar buscador" className="absolute inset-0" onClick={() => setCommandOpen(false)} />
          <section className="ak10-command relative z-10 mx-auto w-full max-w-2xl overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/[.08] px-5 py-4"><Search size={18} className="text-red-400" /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ir a una sección..." className="min-w-0 flex-1 bg-transparent outline-none" /><button onClick={() => setCommandOpen(false)} aria-label="Cerrar"><X size={17} /></button></div>
            <div className="p-2">{filtered.map(([label, href]) => <Link key={href} href={href} className="block rounded-lg px-4 py-3 text-sm text-white/65 hover:bg-white/[.05] hover:text-white">{label}</Link>)}</div>
          </section>
        </div>
      )}
    </main>
  )
}
