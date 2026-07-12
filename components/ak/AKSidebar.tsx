'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Bell,
  BookOpen,
  Car,
  Coins,
  CreditCard,
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
  { href: '/creditos', label: 'Créditos', icon: Coins },
  { href: '/comprar-creditos', label: 'Comprar créditos', icon: CreditCard },
  { href: '/garage', label: 'Garage', icon: Car },
  { href: '/biblioteca', label: 'Biblioteca', icon: BookOpen },
  { href: '/soporte', label: 'Soporte', icon: LifeBuoy },
  { href: '/notificaciones', label: 'Notificaciones', icon: Bell },
  { href: '/perfil', label: 'Mi cuenta', icon: UserCircle },
]

const adminItems = [
  { href: '/admin/pedidos', label: 'Admin pedidos', icon: ShieldCheck },
  { href: '/admin/recargas', label: 'Admin recargas', icon: CreditCard },
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
        className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-[13px] font-black uppercase tracking-[0.02em] transition ${
          active
            ? 'border-red-500/45 bg-gradient-to-r from-red-700 to-red-600/50 text-white shadow-[0_0_45px_rgba(217,4,41,.28)]'
            : 'border-transparent text-white/58 hover:border-white/10 hover:bg-white/[0.045] hover:text-white'
        }`}
      >
        <Icon size={18} className={active ? 'text-white' : 'text-white/35 group-hover:text-red-400'} />
        {label}
      </Link>
    )
  }

  return (
    <aside className="hidden h-screen w-[282px] shrink-0 overflow-hidden border-r border-white/10 bg-[linear-gradient(180deg,rgba(10,10,12,.98),rgba(0,0,0,.96))] lg:sticky lg:top-0 lg:flex lg:flex-col">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_8%,rgba(217,4,41,.32),transparent_28%),radial-gradient(circle_at_100%_40%,rgba(255,255,255,.08),transparent_24%)]" />
      <div className="relative flex h-full flex-col p-6">
        <Link href="/dashboard" className="mb-7 block">
          <Image
            src="/images/brand/autokeys-logo-wide-transparent.webp"
            alt="Autokeys"
            width={220}
            height={56}
            className="h-auto w-full max-w-[200px]"
            priority
          />
          <div className="mt-2 text-[10px] font-black uppercase tracking-[0.38em] text-white/35">AK Cloud · File Service</div>
        </Link>

        <nav className="space-y-2">
          {clientItems.map((item) => <NavLink key={item.href} {...item} />)}
        </nav>

        {isStaff && (
          <>
            <div className="my-5 h-px bg-white/10" />
            <div className="mb-2 px-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/25">Autokeys interno</div>
            <nav className="space-y-2">
              {adminItems.map((item) => <NavLink key={item.href} {...item} />)}
            </nav>
          </>
        )}

        <div className="mt-auto space-y-4">
          <div className="rounded-[1.6rem] border border-red-500/25 bg-red-500/10 p-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-red-300">
              <Headphones size={15} /> Soporte PRO
            </div>
            <p className="mt-2 text-sm leading-5 text-white/45">Pedidos, archivos y créditos conectados con Autokeys Core.</p>
          </div>
          <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white/65 hover:bg-white/[0.08] hover:text-white">
            <LogOut size={17} /> Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  )
}
