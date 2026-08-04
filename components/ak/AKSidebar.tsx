'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Bell, BookOpen, BrainCircuit, Car, Download, FolderOpen, Gauge,
  LayoutDashboard, LifeBuoy, LogOut, Settings, ShieldCheck,
  UploadCloud, UserCircle, X, Zap,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const clientItems = [
  ['/dashboard', 'Mission Control', LayoutDashboard],
  ['/nuevo-pedido', 'Nuevo archivo', UploadCloud],
  ['/pedidos', 'Operaciones', FolderOpen],
  ['/descargas', 'Versiones', Download],
  ['/garage', 'Garage', Car],
  ['/biblioteca', 'Knowledge Base', BookOpen],
  ['/intelligence', 'AK Intelligence', BrainCircuit],
  ['/soporte', 'Soporte técnico', LifeBuoy],
  ['/notificaciones', 'Actividad', Bell],
  ['/perfil', 'Mi workspace', UserCircle],
] as const

const adminItems = [
  ['/admin/pedidos', 'Lab Control', ShieldCheck],
  ['/admin/ecu-database', 'ECU Intelligence', Settings],
] as const

export default function AKSidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isStaff, setIsStaff] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user?.id) return
      const { data } = await supabase.from('usuarios_app').select('rol, activo').eq('auth_user_id', userData.user.id).maybeSingle()
      if (active) setIsStaff(Boolean(data) && data?.activo !== false && ['admin', 'desarrollo', 'atencion_cliente'].includes(data?.rol))
    })()
    return () => { active = false }
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function Nav({ item }: { item: readonly [string, string, any] }) {
    const [href, label, Icon] = item
    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
    return (
      <Link href={href} onClick={onClose} className={`titan-nav group ${active ? 'titan-nav-active' : ''}`}>
        <span className="titan-nav-icon"><Icon size={17} /></span>
        <span className="truncate">{label}</span>
        {active && <span className="titan-nav-beacon" />}
      </Link>
    )
  }

  return (
    <aside className={`titan-sidebar h-screen w-[292px] shrink-0 flex-col ${mobile ? 'flex' : 'hidden lg:sticky lg:top-0 lg:flex'}`}>
      <div className="flex h-full flex-col p-4">
        <div className="mb-5 flex gap-2">
          <Link href="/dashboard" onClick={onClose} className="titan-brand min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <Image src="/images/brand/autokeys-logo-small-transparent.webp" alt="Autokeys" width={52} height={52} className="h-11 w-auto" priority />
              <div>
                <div className="text-[15px] font-black tracking-[.2em]">AK LAB <span className="text-[#e5a05d]">OS</span></div>
                <div className="mt-1 text-[8px] uppercase tracking-[.25em] text-white/28">File Intelligence System</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[.06] bg-black/20 px-3 py-2">
              <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.18em] text-white/32"><i className="titan-live" /> Network online</span>
              <span className="font-mono text-[9px] text-[#67e8d1]">V4.0</span>
            </div>
          </Link>
          {mobile && <button onClick={onClose} className="titan-icon-button"><X size={18}/></button>}
        </div>

        <div className="titan-section-label">Operations</div>
        <nav className="space-y-1">{clientItems.map((item) => <Nav key={item[0]} item={item} />)}</nav>

        {isStaff && <>
          <div className="my-5 h-px bg-white/[.055]" />
          <div className="titan-section-label">Laboratory</div>
          <nav className="space-y-1">{adminItems.map((item) => <Nav key={item[0]} item={item} />)}</nav>
        </>}

        <div className="mt-auto space-y-3">
          <Link href="/nuevo-pedido" className="titan-launch">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-black/25"><Zap size={18}/></span>
            <span><strong className="block text-sm">Launch operation</strong><small className="text-white/35">ORI → solución → final</small></span>
          </Link>
          <div className="titan-system-card">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[.16em] text-white/28"><span>System health</span><Gauge size={15}/></div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center"><Metric value="99.9" label="Uptime"/><Metric value="256" label="AES"/><Metric value="LIVE" label="Sync"/></div>
          </div>
          <button onClick={logout} className="titan-logout"><LogOut size={15}/> Cerrar sesión</button>
        </div>
      </div>
    </aside>
  )
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="rounded-xl border border-white/[.055] bg-white/[.025] py-2"><div className="font-mono text-[10px] font-bold text-white/68">{value}</div><div className="mt-1 text-[8px] uppercase tracking-wider text-white/22">{label}</div></div>
}
