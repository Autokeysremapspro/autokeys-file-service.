'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell,
  BookOpen,
  Briefcase,
  Cloud,
  CreditCard,
  Database,
  Download,
  FileUp,
  FolderOpen,
  Headphones,
  History,
  Home,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/nuevo-pedido', label: 'Nuevo Trabajo', icon: FileUp },
  { href: '/pedidos', label: 'Mis Trabajos', icon: Briefcase },
  { href: '/descargas', label: 'Descargas', icon: Download },
  { href: '/perfil', label: 'Mi Cuenta', icon: User },
]

const extraItems = [
  { href: '/historial', label: 'Historial', icon: History },
  { href: '/archivos', label: 'Mis Archivos', icon: FolderOpen },
  { href: '/base-ecu', label: 'Base de Datos ECU', icon: Database },
  { href: '/soporte', label: 'Soporte Técnico', icon: Headphones },
  { href: '/facturacion', label: 'Facturación', icon: CreditCard },
  { href: '/admin/pedidos', label: 'Distribuidores', icon: Users },
  { href: '/formacion', label: 'Formación', icon: BookOpen },
  { href: '/ajustes', label: 'Ajustes', icon: Settings },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const router = useRouter()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#05080d] text-white lg:grid lg:grid-cols-[285px_1fr]">
      <aside className="hidden border-r border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,.24),transparent_32%),linear-gradient(180deg,#070b12,#030508)] lg:block">
        <div className="flex min-h-screen flex-col px-5 py-5">
          <Link href="/dashboard" className="mb-7 block">
            <div className="text-[31px] font-black italic leading-none tracking-tight">
              AK <span className="text-red-500">CLOUD</span>
            </div>
            <div className="mt-1 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">
              Autokeys File Service
            </div>
          </Link>

          <nav className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon
              const active = path === item.href || (item.href !== '/dashboard' && path.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    active
                      ? 'bg-gradient-to-r from-red-700/95 to-red-600/55 text-white shadow-lg shadow-red-950/30'
                      : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <Icon size={18} /> {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
            {extraItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-400 transition hover:bg-white/[0.06] hover:text-white">
                  <Icon size={18} /> {item.label}
                </Link>
              )
            })}
          </div>

          <div className="mt-auto rounded-3xl border border-white/10 bg-black/35 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
              <ShieldCheck size={15} /> Seguridad
            </div>
            <p className="text-sm text-zinc-400">SSL activo · Servidores UE · Copias diarias</p>
            <button onClick={logout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-black text-zinc-300 hover:bg-white/[0.08]">
              <LogOut size={16} /> Salir
            </button>
          </div>
        </div>
      </aside>

      <main className="min-h-screen">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#05080d]/85 px-4 backdrop-blur-xl lg:px-7">
          <div className="flex items-center gap-3">
            <button className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 lg:hidden"><Menu size={20} /></button>
            <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-bold text-zinc-400 md:flex">
              <Cloud size={17} className="text-red-400" /> Autokeys File Service
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/nuevo-pedido" className="rounded-2xl border border-red-500/30 bg-red-600/15 px-4 py-2 text-sm font-black text-white hover:bg-red-600/25">
              + Nuevo Trabajo
            </Link>
            <Link href="/soporte" className="hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-zinc-300 hover:bg-white/[0.08] md:block">
              Soporte Técnico
            </Link>
            <button className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-3 hover:bg-white/[0.08]">
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-black">3</span>
            </button>
          </div>
        </header>
        <div className="p-4 lg:p-7">{children}</div>
      </main>
    </div>
  )
}
