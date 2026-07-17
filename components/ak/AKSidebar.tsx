'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Bell,
  BookOpen,
  Car,
  Download,
  FolderOpen,
  Headphones,
  Home,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Settings,
  ShieldCheck,
  UploadCloud,
  UserCircle,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const clientItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/nuevo-pedido', label: 'Nuevo pedido', icon: UploadCloud },
  { href: '/pedidos', label: 'Mis pedidos', icon: FolderOpen },
  { href: '/descargas', label: 'Descargas', icon: Download },
  { href: '/garage', label: 'Garage', icon: Car },
  { href: '/biblioteca', label: 'Biblioteca', icon: BookOpen },
  { href: '/soporte', label: 'Soporte', icon: LifeBuoy },
  { href: '/notificaciones', label: 'Notificaciones', icon: Bell },
  { href: '/perfil', label: 'Mi cuenta', icon: UserCircle },
]

const adminItems = [
  { href: '/admin/pedidos', label: 'Admin pedidos', icon: ShieldCheck },
  { href: '/admin/ecu-database', label: 'Base ECU', icon: Settings },
]

export default function AKSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isStaff, setIsStaff] = useState(false)

  useEffect(() => {
    let active = true
    async function checkStaff() {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) return
      const { data } = await supabase
        .from('usuarios_app')
        .select('rol, activo')
        .eq('auth_user_id', userId)
        .maybeSingle()
      if (!active) return
      const staff = !!data && data.activo !== false && ['admin', 'desarrollo', 'atencion_cliente'].includes(data.rol)
      setIsStaff(staff)
    }
    checkStaff()
    return () => {
      active = false
    }
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: any }) {
    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
    return (
      <Link
        href={href}
        className={`ak-nav-item group flex items-center gap-3 rounded-[14px] border px-3.5 py-2.5 text-[12px] font-black uppercase tracking-[0.045em] transition duration-200 ${
          active
            ? 'ak-nav-active border-red-400/20 bg-gradient-to-r from-red-500/[.14] to-transparent text-white shadow-[inset_0_1px_0_rgba(255,255,255,.035)]'
            : 'border-transparent text-white/48 hover:border-white/[.07] hover:bg-white/[.035] hover:text-white'
        }`}
      >
        <span className={`relative z-10 grid h-8 w-8 place-items-center rounded-[10px] border transition ${active ? 'border-red-400/20 bg-red-500/10 text-red-300' : 'border-white/[.055] bg-white/[.02] text-white/32 group-hover:border-white/[.1] group-hover:text-white/70'}`}><Icon size={16} /></span>
        <span className="relative z-10">{label}</span>
      </Link>
    )
  }

  return (
    <aside className="ak-sidebar-premium hidden h-screen w-[270px] shrink-0 overflow-hidden border-r border-white/[.065] lg:sticky lg:top-0 lg:flex lg:flex-col">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_8%,rgba(217,4,41,.32),transparent_28%),radial-gradient(circle_at_100%_40%,rgba(255,255,255,.08),transparent_24%)]" />
      <div className="relative flex h-full flex-col px-4 pb-4 pt-5">
        <Link href="/dashboard" className="mb-6 block rounded-[18px] border border-white/[.06] bg-white/[.02] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.03)] transition hover:border-white/[.11] hover:bg-white/[.035]">
          <Image
            src="/images/brand/autokeys-logo-wide-transparent.webp"
            alt="Autokeys"
            width={220}
            height={56}
            className="h-auto w-full max-w-[176px]"
            priority
          />
          <div className="mt-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.28em] text-white/30"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]" />AK Cloud · Online</div>
        </Link>

        <nav className="space-y-1.5">
          {clientItems.map((item) => <NavLink key={item.href} {...item} />)}
        </nav>

        {isStaff && (
          <>
            <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/[.08] to-transparent" />
            <div className="mb-2 px-3 text-[9px] font-black uppercase tracking-[0.24em] text-white/22">Autokeys interno</div>
            <nav className="space-y-2">
              {adminItems.map((item) => <NavLink key={item.href} {...item} />)}
            </nav>
          </>
        )}

        <div className="mt-auto space-y-4">
          <div className="rounded-[18px] border border-white/[.07] bg-gradient-to-br from-red-500/[.09] to-white/[.018] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.035)]">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-red-300">
              <Headphones size={15} /> Soporte PRO
            </div>
            <p className="mt-2 text-[12px] leading-5 text-white/38">Pedidos, archivos y créditos conectados con Autokeys Core.</p>
          </div>
          <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-white/[.07] bg-white/[.025] px-4 py-2.5 text-[12px] font-black text-white/45 transition hover:border-white/[.13] hover:bg-white/[.055] hover:text-white">
            <LogOut size={17} /> Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  )
}
