import Link from 'next/link'
import { Bell, Brain, Car, Cloud, Coins, CreditCard, FolderOpen, Home, Library, LifeBuoy, UploadCloud, UserCircle, ShieldCheck } from 'lucide-react'

const items = [
  { href: '/dashboard', label: 'Workspace', icon: Home },
  { href: '/nuevo-pedido', label: 'New Job', icon: UploadCloud },
  { href: '/intelligence', label: 'AK Intelligence', icon: Brain },
  { href: '/pedidos', label: 'Orders', icon: FolderOpen },
  { href: '/garage', label: 'Garage', icon: Car },
  { href: '/biblioteca', label: 'Library', icon: Library },
  { href: '/creditos', label: 'Credits', icon: Coins },
  { href: '/comprar-creditos', label: 'Buy Credits', icon: CreditCard },
  { href: '/notificaciones', label: 'Notifications', icon: Bell },
  { href: '/soporte', label: 'Support', icon: LifeBuoy },
  { href: '/perfil', label: 'Account', icon: UserCircle },
]

const adminItems = [
  { href: '/admin/pedidos', label: 'Admin Orders', icon: ShieldCheck },
  { href: '/admin/recargas', label: 'Admin Credits', icon: CreditCard },
]

export default function AKSidebar() {
  return (
    <aside className="hidden h-screen w-[280px] shrink-0 border-r border-white/10 bg-black/35 p-6 lg:flex lg:flex-col">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ak-red)] shadow-[0_0_40px_rgba(217,4,41,.35)]"><Cloud size={24} /></div>
        <div>
          <div className="text-xl font-black tracking-tight">AK CLOUD</div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">Autokeys Lab</div>
        </div>
      </div>
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className="group flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-bold text-white/55 transition hover:border-white/10 hover:bg-white/[0.04] hover:text-white">
              <Icon size={19} className="text-white/35 group-hover:text-[var(--ak-glow)]" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="my-5 h-px bg-white/10" />
      <div className="mb-2 px-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/25">Internal</div>
      <nav className="space-y-2">
        {adminItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className="group flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-bold text-white/45 transition hover:border-[var(--ak-red)]/25 hover:bg-[var(--ak-red)]/10 hover:text-white">
              <Icon size={19} className="text-white/30 group-hover:text-[var(--ak-glow)]" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto rounded-[1.6rem] border border-[var(--ak-red)]/20 bg-[var(--ak-red)]/10 p-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--ak-glow)]">Professional</p>
        <p className="mt-2 text-sm text-white/45">Fast tuning requests, ECU library and distributor workspace.</p>
      </div>
    </aside>
  )
}
