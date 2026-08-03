'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Bell,
  BookOpen,
  BrainCircuit,
  Car,
  Download,
  FolderOpen,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Settings,
  ShieldCheck,
  UploadCloud,
  UserCircle,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const clientItems = [
  ['/dashboard', 'Inicio', LayoutDashboard],
  ['/nuevo-pedido', 'Nuevo servicio', UploadCloud],
  ['/pedidos', 'Trabajos', FolderOpen],
  ['/descargas', 'Versiones', Download],
  ['/garage', 'Mis vehículos', Car],
  ['/biblioteca', 'Biblioteca', BookOpen],
  ['/intelligence', 'AK Intelligence', BrainCircuit],
  ['/soporte', 'Soporte', LifeBuoy],
  ['/notificaciones', 'Notificaciones', Bell],
  ['/perfil', 'Mi cuenta', UserCircle],
] as const

const adminItems = [
  ['/admin/pedidos', 'Admin pedidos', ShieldCheck],
  ['/admin/ecu-database', 'Base ECU', Settings],
] as const

export default function AKSidebar({
  mobile = false,
  onClose,
}: {
  mobile?: boolean
  onClose?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isStaff, setIsStaff] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user?.id) return
      const { data } = await supabase
        .from('usuarios_app')
        .select('rol, activo')
        .eq('auth_user_id', userData.user.id)
        .maybeSingle()
      if (active) {
        setIsStaff(
          Boolean(data) &&
            data?.activo !== false &&
            ['admin', 'desarrollo', 'atencion_cliente'].includes(data?.rol)
        )
      }
    })()
    return () => {
      active = false
    }
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function Nav({ item }: { item: readonly [string, string, any] }) {
    const [href, label, Icon] = item
    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
    return (
      <Link
        href={href}
        onClick={onClose}
        className={`ak-v6-nav group flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold ${
          active ? 'ak-v6-nav-active text-white' : 'text-white/43'
        }`}
      >
        <span
          className={`grid h-9 w-9 place-items-center rounded-xl border transition-all duration-300 ${
            active
              ? 'border-[#e5a05d]/35 bg-[#e5a05d]/12 text-[#ffd09a]'
              : 'border-white/[.055] bg-white/[.02] text-white/30 group-hover:border-white/10 group-hover:text-white/65'
          }`}
        >
          <Icon size={17} />
        </span>
        <span>{label}</span>
        {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#e5a05d] shadow-[0_0_12px_rgba(229,160,93,.9)]" />}
      </Link>
    )
  }

  return (
    <aside
      className={`ak-v6-sidebar h-screen w-[286px] shrink-0 flex-col ${
        mobile ? 'flex' : 'hidden lg:sticky lg:top-0 lg:flex'
      }`}
    >
      <div className="flex h-full flex-col px-4 py-5">
        <div className="mb-5 flex items-start gap-2">
          <Link href="/dashboard" onClick={onClose} className="min-w-0 flex-1 rounded-[22px] border border-white/[.07] bg-white/[.025] p-4">
            <Image
              src="/images/brand/autokeys-logo-wide-transparent.webp"
              alt="Autokeys"
              width={220}
              height={56}
              className="h-auto w-[176px]"
              priority
            />
            <div className="mt-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[.22em] text-white/30">
              <span className="ak-v6-live-dot" /> AK Cloud · Workspace
            </div>
          </Link>
          {mobile && (
            <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[.04] text-white/60">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="mb-2 px-3 text-[9px] font-black uppercase tracking-[.2em] text-white/20">Workspace</div>
        <nav className="space-y-1">{clientItems.map((item) => <Nav key={item[0]} item={item} />)}</nav>

        {isStaff && (
          <>
            <div className="my-5 h-px bg-white/[.06]" />
            <div className="mb-2 px-3 text-[9px] font-black uppercase tracking-[.2em] text-white/20">Laboratorio</div>
            <nav className="space-y-1">{adminItems.map((item) => <Nav key={item[0]} item={item} />)}</nav>
          </>
        )}

        <div className="mt-auto">
          <div className="ak-v6-brief mb-3 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#ffd09a]">Pago por archivo</div>
                <p className="mt-2 text-[11px] leading-5 text-white/32">Precio real, revisiones y soporte dentro del pedido.</p>
              </div>
              <div className="ak-v6-orbit" aria-hidden="true"><span /></div>
            </div>
          </div>
          <button onClick={logout} className="ak-v5-button-secondary w-full !py-2.5 text-xs">
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  )
}
