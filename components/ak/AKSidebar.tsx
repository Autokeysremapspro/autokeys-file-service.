'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Car, Cloud, FileDown, FolderOpen, Gauge, Headphones, Home, Library, Settings, UploadCloud, UserCircle } from 'lucide-react'

const items = [
  { href: '/dashboard', label: 'Workspace', icon: Home },
  { href: '/nuevo-pedido', label: 'New Job', icon: UploadCloud },
  { href: '/pedidos', label: 'Orders', icon: FolderOpen },
  { href: '/descargas', label: 'Downloads', icon: FileDown },
  { href: '/garage', label: 'Garage', icon: Car },
  { href: '/biblioteca', label: 'Library', icon: Library },
  { href: '/soporte', label: 'Support', icon: Headphones },
]

export default function AKSidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden h-screen w-[292px] shrink-0 border-r border-white/10 bg-black/35 p-5 lg:flex lg:flex-col">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3 rounded-[1.7rem] border border-white/10 bg-white/[0.035] p-3">
        <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--ak-red),var(--ak-glow))] p-3 shadow-[0_0_42px_rgba(217,4,41,.35)]">
          <Cloud size={25} />
        </div>
        <div>
          <div className="text-2xl font-black italic leading-none tracking-tight">AK <span className="text-[var(--ak-glow)]">CLOUD</span></div>
          <div className="mt-1 text-[10px] font-black uppercase tracking-[0.28em] text-white/35">by Autokeys Lab</div>
        </div>
      </Link>

      <div className="mb-4 rounded-[1.5rem] border border-[var(--ak-red)]/18 bg-[radial-gradient(circle_at_top_left,rgba(217,4,41,.16),transparent_55%),rgba(255,255,255,.025)] p-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--ak-glow)]"><Gauge size={15} /> Pro Workspace</div>
        <p className="mt-2 text-sm leading-5 text-white/42">Sube ORI, selecciona servicios y controla tus trabajos desde una experiencia premium.</p>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition ${active ? 'border-[var(--ak-red)]/40 bg-[var(--ak-red)]/14 text-white shadow-[0_0_32px_rgba(217,4,41,.14)]' : 'border-transparent text-white/52 hover:border-white/10 hover:bg-white/[0.045] hover:text-white'}`}>
              <Icon size={19} className={active ? 'text-[var(--ak-glow)]' : 'text-white/28 group-hover:text-[var(--ak-glow)]'} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <Link href="/perfil" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white/55 hover:bg-white/[0.06] hover:text-white">
          <UserCircle size={18} /> Account
        </Link>
        <Link href="/ajustes" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white/55 hover:bg-white/[0.06] hover:text-white">
          <Settings size={18} /> Settings
        </Link>
      </div>
    </aside>
  )
}
