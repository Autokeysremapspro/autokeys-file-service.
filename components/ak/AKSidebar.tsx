'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BarChart3, Bell, BookOpen, BrainCircuit, Car, Download, FolderOpen, Gauge, LayoutDashboard, LifeBuoy, Settings, ShieldCheck, UploadCloud, UserCircle, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const items = [
  ['/dashboard','Inicio',LayoutDashboard],
  ['/nuevo-pedido','Nuevo pedido',UploadCloud],
  ['/pedidos','Pedidos',FolderOpen],
  ['/descargas','Versiones',Download],
  ['/garage','Garage',Car],
  ['/biblioteca','Knowledge Base',BookOpen],
  ['/intelligence','AK Intelligence',BrainCircuit],
  ['/analitica','Analítica',BarChart3],
  ['/soporte','Soporte técnico',LifeBuoy],
  ['/notificaciones','Actividad',Bell],
  ['/perfil','Mi workspace',UserCircle],
] as const

export default function AKSidebar({mobile=false,onClose}:{mobile?:boolean;onClose?:()=>void}){
  const pathname=usePathname(); const [isStaff,setIsStaff]=useState(false)
  useEffect(()=>{let alive=true;(async()=>{const {data:u}=await supabase.auth.getUser();if(!u.user?.id)return;const {data}=await supabase.from('usuarios_app').select('rol, activo').eq('auth_user_id',u.user.id).maybeSingle();if(alive)setIsStaff(Boolean(data)&&data?.activo!==false&&['admin','desarrollo','atencion_cliente'].includes(data?.rol))})();return()=>{alive=false}},[])
  return <aside className={`ak5-sidebar h-screen w-[272px] shrink-0 flex-col ${mobile?'flex':'hidden lg:sticky lg:top-0 lg:flex'}`}>
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-start gap-2">
        <Link href="/dashboard" onClick={onClose} className="ak5-brand-panel min-w-0 flex-1 rounded-2xl border border-white/[.07] bg-white/[.025] p-4">
          <div className="ak5-brand-logo rounded-xl px-2 py-1"><Image src="/images/brand/autokeys-logo-wide-transparent.webp" alt="Autokeys" width={210} height={54} className="h-auto w-[168px]" priority/></div>
        </Link>
        {mobile&&<button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[.04]"><X size={18}/></button>}
      </div>

      <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-400/10 bg-emerald-400/[.035] px-3 py-2 text-[9px] font-black uppercase tracking-[.16em] text-white/55"><span>Network online</span><span className="text-emerald-300">V5.0</span></div>
      <div className="mb-2 px-2 text-[9px] font-black uppercase tracking-[.2em] text-white/22">Operations</div>
      <nav className="space-y-1">{items.map(([href,label,Icon])=>{const active=pathname===href||(href!='/dashboard'&&pathname.startsWith(href));return <Link key={href} href={href} onClick={onClose} className={`ak5-nav ${active?'ak5-nav-active':'text-white/48'} flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold`}><span className={`grid h-8 w-8 place-items-center rounded-lg border ${active?'border-red-400/25 bg-red-500/10 text-red-300':'border-white/[.055] bg-white/[.02] text-white/28'}`}><Icon size={16}/></span><span>{label}</span></Link>})}</nav>

      {isStaff&&<><div className="my-4 h-px bg-white/[.06]"/><div className="mb-2 px-2 text-[9px] font-black uppercase tracking-[.2em] text-white/22">Laboratory</div><nav className="space-y-1"><Link href="/admin/pedidos" className="ak5-nav flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold text-white/48"><span className="grid h-8 w-8 place-items-center rounded-lg border border-amber-400/20 bg-amber-500/10 text-amber-300"><ShieldCheck size={16}/></span>Lab Control</Link><Link href="/admin/ecu-database" className="ak5-nav flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold text-white/48"><span className="grid h-8 w-8 place-items-center rounded-lg border border-cyan-400/20 bg-cyan-500/10 text-cyan-300"><Settings size={16}/></span>ECU Intelligence</Link></nav></>}

      <div className="mt-auto space-y-3">
        <div className="ak5-card rounded-2xl p-4"><div className="flex items-center gap-2 text-xs font-black"><Gauge size={16} className="text-emerald-300"/> System health</div><div className="mt-3 grid grid-cols-3 gap-2 text-center text-[9px]"><div className="rounded-lg border border-white/[.06] bg-black/20 p-2"><b className="block text-white">99.9</b><span className="text-white/30">Uptime</span></div><div className="rounded-lg border border-white/[.06] bg-black/20 p-2"><b className="block text-white">AES</b><span className="text-white/30">Secure</span></div><div className="rounded-lg border border-white/[.06] bg-black/20 p-2"><b className="block text-white">LIVE</b><span className="text-white/30">Sync</span></div></div></div>
      </div>
    </div>
  </aside>
}