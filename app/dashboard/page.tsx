'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Activity, ArrowRight, BellRing, Car, CheckCircle2, Clock3, CloudUpload, Cpu, Download, FileText, Gauge, Headphones, Library, RefreshCw, ShieldCheck, Sparkles, UploadCloud, Zap } from 'lucide-react'
import AppShell from '@/components/AppShell'
import { supabase } from '@/lib/supabase'
import { getMisPedidos, type FileServicePedido, formatEstado } from '@/lib/services/pedidos'
import { getMisNotificaciones, type FileServiceNotificacion } from '@/lib/services/notificaciones'

function vehicleTitle(p: FileServicePedido){return [p.marca,p.modelo,p.motor].filter(Boolean).join(' ')||p.ori_nombre||'Vehículo sin identificar'}
function tone(estado?:string|null){if(estado==='finalizado')return 'text-emerald-300 border-emerald-400/20 bg-emerald-400/10';if(estado==='en_proceso')return 'text-amber-300 border-amber-400/20 bg-amber-400/10';if(estado==='cancelado')return 'text-red-300 border-red-400/20 bg-red-400/10';return 'text-cyan-300 border-cyan-400/20 bg-cyan-400/10'}
function dateTime(v?:string|null){if(!v)return '—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':d.toLocaleString('es-ES',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}

export default function DashboardPage(){
  const [pedidos,setPedidos]=useState<FileServicePedido[]>([])
  const [notifs,setNotifs]=useState<FileServiceNotificacion[]>([])
  const [name,setName]=useState('Distribuidor')
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState<string|null>(null)

  async function load(){setLoading(true);setError(null);try{const [p,n,u]=await Promise.all([getMisPedidos(),getMisNotificaciones(),supabase.auth.getUser()]);setPedidos(p);setNotifs(n);const m=u.data.user?.user_metadata||{};setName(String(m.name||m.nombre||m.empresa||u.data.user?.email?.split('@')[0]||'Distribuidor'))}catch(e:any){setError(e?.message||'No se pudo cargar Mission Control')}finally{setLoading(false)}}
  useEffect(()=>{load()},[])
  useEffect(()=>{let ch:any;supabase.auth.getUser().then(({data})=>{const id=data.user?.id;if(!id)return;ch=supabase.channel(`mission-${id}`).on('postgres_changes',{event:'*',schema:'public',table:'file_service_pedidos',filter:`user_id=eq.${id}`},load).on('postgres_changes',{event:'INSERT',schema:'public',table:'file_service_notificaciones',filter:`user_id=eq.${id}`},load).subscribe()});return()=>{if(ch)supabase.removeChannel(ch)}},[])

  const stats=useMemo(()=>{const pendientes=pedidos.filter(p=>p.estado==='pendiente').length;const enProceso=pedidos.filter(p=>p.estado==='en_proceso').length;const finalizados=pedidos.filter(p=>p.estado==='finalizado').length;const descargas=pedidos.filter(p=>Boolean(p.mod_path)).length;const vehiculos=new Set(pedidos.map(p=>[p.marca,p.modelo,p.motor].filter(Boolean).join('|')).filter(Boolean)).size;return{pendientes,enProceso,finalizados,descargas,vehiculos,activos:pendientes+enProceso}},[pedidos])
  const latest=pedidos.slice(0,6);const unread=notifs.filter(n=>!n.leida).length

  return <AppShell><div className="space-y-6">
    <section className="ak5-card ak5-gridline relative min-h-[360px] overflow-hidden rounded-[28px] p-6 sm:p-8 lg:p-10">
      <div className="absolute inset-y-0 right-0 w-[62%] bg-[url('/images/ak-dashboard-hero-racing.webp')] bg-cover bg-center opacity-70"/>
      <div className="absolute inset-0 bg-gradient-to-r from-[#05070b] via-[#05070b]/85 to-transparent"/>
      <div className="absolute inset-y-0 right-0 w-[52%] bg-[radial-gradient(circle_at_center,rgba(255,66,90,.18),transparent_60%)]"/>
      <div className="absolute right-[-80px] top-[-90px] h-80 w-80 rounded-full border border-cyan-400/10"/>
      <div className="absolute right-[80px] top-[40px] h-52 w-52 rounded-full border border-red-400/10"/>
      <div className="relative grid gap-8 xl:grid-cols-[1fr_360px] xl:items-center">
        <div>
          <div className="flex flex-wrap gap-2"><span className="ak5-chip border-emerald-400/20 bg-emerald-400/10 text-emerald-300"><i className="ak5-live h-2 w-2 rounded-full bg-emerald-400"/> Laboratorio operativo</span><span className="ak5-chip border-red-400/20 bg-red-400/10 text-red-300"><Sparkles size={13}/> Mission Control V5</span></div>
          <div className="ak5-kicker mt-7">Bienvenido de nuevo</div>
          <h1 className="ak5-title mt-3 text-5xl sm:text-6xl xl:text-7xl">Hola, <span className="bg-gradient-to-r from-[#ff6378] to-[#ff9a5a] bg-clip-text text-transparent">{name}</span></h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/48">Controla pedidos, versiones, archivos y soporte desde un workspace profesional diseñado para trabajar rápido.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/nuevo-pedido" className="ak5-primary"><CloudUpload size={18}/> Crear nuevo pedido</Link><Link href="/pedidos" className="ak5-secondary">Ver mis pedidos <ArrowRight size={17}/></Link></div>
        </div>
        <div className="ak5-card rounded-[24px] border-red-400/15 bg-black/35 p-5">
          <div className="ak5-kicker">Pedidos disponibles hoy</div><div className="mt-3 text-4xl font-black text-emerald-300">SIN LÍMITE</div><p className="mt-1 text-sm text-white/35">Pide los que necesites</p>
          <div className="mt-5 grid grid-cols-2 gap-3"><Mini label="Trabajos activos" value={stats.activos}/><Mini label="Archivos listos" value={stats.descargas}/></div>
          <Link href="/nuevo-pedido" className="ak5-primary mt-4 w-full">Crear nuevo pedido <ArrowRight size={16}/></Link>
        </div>
      </div>
    </section>

    {error&&<div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <Stat label="Pedidos activos" value={stats.activos} sub={`${stats.pendientes} pendientes · ${stats.enProceso} en proceso`} icon={Clock3} tone="amber"/>
      <Stat label="Finalizados" value={stats.finalizados} sub={`${pedidos.length} pedidos totales`} icon={CheckCircle2} tone="green"/>
      <Stat label="Descargas" value={stats.descargas} sub="Archivos MOD disponibles" icon={Download} tone="cyan"/>
      <Stat label="Vehículos" value={stats.vehiculos} sub="Historial técnico privado" icon={Car} tone="red"/>
      <Stat label="Avisos" value={unread} sub="Notificaciones sin leer" icon={BellRing} tone="purple"/>
    </section>

    <section className="grid gap-5 2xl:grid-cols-[1.45fr_.9fr]">
      <div className="ak5-card rounded-[26px]">
        <div className="flex items-center justify-between border-b border-white/[.07] px-5 py-4 sm:px-6"><div><div className="ak5-kicker text-red-300">Actividad reciente</div><h2 className="mt-1 text-xl font-black">Últimos pedidos</h2></div><Link href="/pedidos" className="text-xs font-black uppercase tracking-wider text-red-300">Ver todos →</Link></div>
        {loading?<div className="p-10 text-center text-white/35">Cargando Mission Control...</div>:latest.length===0?<div className="p-10 text-center text-white/35">Todavía no hay pedidos.</div>:<div className="divide-y divide-white/[.06]">{latest.map(p=><Link key={p.id} href={`/pedidos/${p.id}`} className="group grid gap-3 px-5 py-4 transition hover:bg-white/[.025] sm:grid-cols-[150px_1fr_150px_110px] sm:items-center sm:px-6"><div className="font-mono text-xs font-bold text-red-300">#{p.numero||p.id.slice(0,8)}</div><div><div className="font-bold group-hover:text-cyan-200">{vehicleTitle(p)}</div><div className="mt-1 text-xs text-white/30">{[p.ecu,p.hw,p.sw].filter(Boolean).join(' · ')||p.ori_nombre||'Archivo recibido'}</div></div><div className="text-xs text-white/35">{dateTime(p.created_at)}</div><span className={`justify-self-start rounded-full border px-3 py-1 text-[10px] font-black uppercase ${tone(p.estado)}`}>{formatEstado(p.estado)}</span></Link>)}</div>}
      </div>

      <div className="space-y-5">
        <div className="ak5-card rounded-[26px] p-5 sm:p-6"><div className="flex items-center justify-between"><div><div className="ak5-kicker text-cyan-300">Trabaja más rápido</div><h3 className="mt-1 text-xl font-black">Accesos rápidos</h3></div><Zap className="text-red-300"/></div><div className="mt-5 grid grid-cols-2 gap-3"><Quick href="/nuevo-pedido" icon={UploadCloud} label="Nuevo pedido"/><Quick href="/pedidos" icon={FileText} label="Pedidos"/><Quick href="/garage" icon={Car} label="Garage"/><Quick href="/biblioteca" icon={Library} label="Biblioteca"/><Quick href="/descargas" icon={Download} label="Versiones"/><Quick href="/soporte" icon={Headphones} label="Soporte"/></div></div>
        <div className="ak5-card rounded-[26px] p-5 sm:p-6"><div className="flex items-center justify-between"><div><div className="ak5-kicker text-purple-300">Sistema</div><h3 className="mt-1 text-xl font-black">Workspace status</h3></div><Activity className="text-emerald-300"/></div><div className="mt-5 space-y-3"><Health label="Sincronización" value="Realtime"/><Health label="Seguridad" value="Activa"/><Health label="Base de datos" value="Conectada"/><Health label="Soporte" value="Disponible"/></div><Link href="/intelligence" className="ak5-secondary mt-5 w-full"><Cpu size={16}/> Abrir AK Intelligence</Link></div>
      </div>
    </section>
  </div></AppShell>
}

function Mini({label,value}:{label:string;value:any}){return <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4"><div className="text-[10px] font-black uppercase tracking-[.14em] text-white/28">{label}</div><div className="mt-2 text-3xl font-black">{value}</div></div>}
function Stat({label,value,sub,icon:Icon,tone}:{label:string;value:any;sub:string;icon:any;tone:'amber'|'green'|'cyan'|'red'|'purple'}){const map:any={amber:'text-amber-300 bg-amber-400/10 border-amber-400/20',green:'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',cyan:'text-cyan-300 bg-cyan-400/10 border-cyan-400/20',red:'text-red-300 bg-red-400/10 border-red-400/20',purple:'text-purple-300 bg-purple-400/10 border-purple-400/20'};return <div className="ak5-card ak5-card-hover rounded-[22px] p-5"><div className="flex items-center justify-between"><div className={`grid h-10 w-10 place-items-center rounded-xl border ${map[tone]}`}><Icon size={19}/></div><span className="text-[9px] font-black uppercase tracking-[.14em] text-white/20">En tiempo real</span></div><div className="mt-5 text-4xl font-black">{value}</div><div className="mt-1 text-[11px] font-black uppercase tracking-[.14em] text-white/46">{label}</div><div className="mt-2 text-xs text-white/28">{sub}</div><div className="ak5-statline mt-3"/></div>}
function Quick({href,icon:Icon,label}:{href:string;icon:any;label:string}){return <Link href={href} className="group rounded-2xl border border-white/[.07] bg-white/[.025] p-4 transition hover:border-red-400/25 hover:bg-red-500/[.055]"><div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl bg-black/25 text-red-300"><Icon size={17}/></span><ArrowRight size={15} className="text-white/20 transition group-hover:translate-x-1 group-hover:text-red-300"/></div><div className="mt-4 text-sm font-bold">{label}</div></Link>}
function Health({label,value}:{label:string;value:string}){return <div className="flex items-center justify-between rounded-xl border border-white/[.06] bg-black/20 px-4 py-3 text-sm"><span className="text-white/45">{label}</span><span className="flex items-center gap-2 font-bold text-emerald-300"><i className="h-2 w-2 rounded-full bg-emerald-400"/>{value}</span></div>}
