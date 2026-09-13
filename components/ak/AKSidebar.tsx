'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BarChart3, Bell, BookOpen, BrainCircuit, Car, Download, FolderOpen, LayoutDashboard, LifeBuoy, Settings, ShieldCheck, UploadCloud, UserCircle, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const items = [
  ['/dashboard', 'Inicio', LayoutDashboard],
  ['/nuevo-pedido', 'Nuevo pedido', UploadCloud],
  ['/pedidos', 'Pedidos', FolderOpen],
  ['/descargas', 'Versiones', Download],
  ['/garage', 'Garage', Car],
  ['/biblioteca', 'Knowledge Base', BookOpen],
  ['/intelligence', 'AK Intelligence', BrainCircuit],
  ['/analitica', 'Analítica', BarChart3],
  ['/soporte', 'Soporte / Tickets', LifeBuoy],
  ['/notificaciones', 'Actividad', Bell],
  ['/perfil', 'Mi workspace', UserCircle],
] as const

export default function AKSidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const [isStaff, setIsStaff] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user?.id) return
      const { data } = await supabase.from('usuarios_app').select('rol, activo').eq('auth_user_id', userData.user.id).maybeSingle()
      if (alive) setIsStaff(Boolean(data) && data?.activo !== false && ['admin', 'desarrollo', 'laboratorio', 'atencion_cliente'].includes(data?.rol))
    })()
    return () => { alive = false }
  }, [])

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

        {isStaff && (
          <div className="mt-5 border-t border-white/[.08] px-3 pt-5">
            <div className="mb-2 px-3 text-[9px] font-black uppercase tracking-[.22em] text-white/30">Laboratorio</div>
            <nav className="space-y-2">
              <Link href="/admin/pedidos" onClick={onClose} className={`ak10-nav ${pathname.startsWith('/admin/pedidos') ? 'ak10-nav-active' : ''}`}>
                <ShieldCheck size={19} strokeWidth={1.8} /><span>Lab Control</span>
              </Link>
              <Link href="/admin/ecu-database" onClick={onClose} className={`ak10-nav ${pathname.startsWith('/admin/ecu-database') ? 'ak10-nav-active' : ''}`}>
                <Settings size={19} strokeWidth={1.8} /><span>ECU Intelligence</span>
              </Link>
            </nav>
          </div>
        )}

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
