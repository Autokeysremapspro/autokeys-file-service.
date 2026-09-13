'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, PlusSquare, BriefcaseBusiness, LifeBuoy, UserRound, X } from 'lucide-react'

const items = [
  ['/dashboard', 'Dashboard', LayoutGrid],
  ['/nuevo-pedido', 'Nuevo servicio', PlusSquare],
  ['/pedidos', 'Mis servicios', BriefcaseBusiness],
  ['/soporte', 'Soporte / Tickets', LifeBuoy],
  ['/perfil', 'Perfil', UserRound],
] as const

export default function AKSidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <aside className={`ak10-sidebar h-screen w-[232px] shrink-0 flex-col ${mobile ? 'flex' : 'hidden lg:sticky lg:top-0 lg:flex'}`}>
      <div className="ak10-sidebar-inner ak5-scroll flex h-full flex-col overflow-y-auto">
        <div className="flex items-start gap-2 px-5 pb-5 pt-6">
          <Link href="/dashboard" onClick={onClose} className="block min-w-0 flex-1">
            <Image src="/images/brand/ak-cloud-logo.webp" alt="AK Cloud by Autokeys Remaps Pro" width={2172} height={724} className="h-auto w-[172px]" priority />
          </Link>
          {mobile && <button onClick={onClose} aria-label="Cerrar navegación" className="ak10-icon-button"><X size={18} /></button>}
        </div>

        <nav className="mt-3 space-y-2 px-3">
          {items.map(([href, label, Icon]) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link key={href} href={href} onClick={onClose} className={`ak10-nav ${active ? 'ak10-nav-active' : ''}`}>
                <Icon size={19} strokeWidth={1.8} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="ak10-sidebar-art mt-auto">
          <Image src="/images/marketing/auth-car-black.webp" alt="" fill sizes="232px" className="object-cover object-[28%_center]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050607] via-transparent to-black/35" />
          <div className="absolute bottom-10 left-6 z-10">
            <div className="ak10-sidebar-claim">MORE<br />POWER<br />REAL<br />RESULTS</div>
            <div className="mt-5 h-[3px] w-8 bg-[#ff001b]" />
            <div className="mt-4 text-[8px] font-bold uppercase tracking-[.32em] text-white/35">Automotive<br />software solutions</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
