'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Activity, AlertTriangle, ArrowDown, ArrowRight, ArrowUp, BellRing, Car, CheckCircle2, Clock3, CloudUpload, Cpu, Download, FileText, Gauge, Headphones, Library, Target, UploadCloud, Zap } from 'lucide-react'
import AppShell from '@/components/AppShell'
import { supabase } from '@/lib/supabase'
import { getMisPedidos, type FileServicePedido, formatEstado } from '@/lib/services/pedidos'
import { getMisNotificaciones, type FileServiceNotificacion } from '@/lib/services/notificaciones'

function vehicleTitle(p: FileServicePedido){return [p.marca,p.modelo,p.motor].filter(Boolean).join(' ')||p.ori_nombre||'Vehículo sin identificar'}
function tone(estado?:string|null){if(estado==='finalizado')return 'text-emerald-300 border-emerald-400/20 bg-emerald-400/10';if(estado==='en_proceso')return 'text-blue-300 border-blue-400/20 bg-blue-400/10';if(estado==='cancelado')return 'text-slate-300 border-slate-400/20 bg-slate-400/10';return 'text-red-300 border-red-400/20 bg-red-400/10'}
function dateTime(v?:string|null){if(!v)return '—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':d.toLocaleString('es-ES',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}
function formatDuration(ms:number){if(!Number.isFinite(ms)||ms<=0)return '—';const h=Math.floor(ms/3600000);const m=Math.round((ms%3600000)/60000);if(h<=0)return `${m}m`;return `${h}h ${m}m`}
function formatDurationDelta(ms:number){if(!Number.isFinite(ms)||ms===0)return null;const sign=ms<0?'-':'+';const abs=Math.abs(ms);const h=Math.floor(abs/3600000);const m=Math.round((abs%3600000)/60000);return `${sign}${h>0?`${h}h `:''}${m}m`}
function avgTurnaroundMs(list:FileServicePedido[]){const t=list.filter(p=>p.created_at&&p.updated_at).map(p=>new Date(p.updated_at as string).getTime()-new Date(p.created_at as string).getTime()).filter(ms=>Number.isFinite(ms)&&ms>0);return t.length?t.reduce((a,b)=>a+b,0)/t.length:0}
function pctChange(curr:number,prev:number){if(prev===0)return curr>0?100:0;return Math.round(((curr-prev)/prev)*1000)/10}

export default function DashboardPage(){
  const [pedidos,setPedidos]=useState<FileServicePedido[]>([])
  const [notifs,setNotifs]=useState<FileServiceNotificacion[]>([])
  const [name,setName]=useState('Distribuidor')
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState<string|null>(null)

  async function load(){setLoading(true);setError(null);try{const [p,n,u]=await Promise.all([getMisPedidos(),getMisNotificaciones(),supabase.auth.getUser()]);setPedidos(p);setNotifs(n);const m=u.data.user?.user_metadata||{};setName(String(m.name||m.nombre||m.empresa||u.data.user?.email?.split('@')[0]||'Distribuidor'))}catch(e:any){setError(e?.message||'No se pudo cargar Inicio')}finally{setLoading(false)}}
  useEffect(()=>{load()},[])
  useEffect(()=>{let ch:any;supabase.auth.getUser().then(({data})=>{const id=data.user?.id;if(!id)return;ch=supabase.channel(`mission-${id}`).on('postgres_changes',{event:'*',schema:'public',table:'file_service_pedidos',filter:`user_id=eq.${id}`},load).on('postgres_changes',{event:'INSERT',schema:'public',table:'file_service_notificaciones',filter:`user_id=eq.${id}`},load).subscribe()});return()=>{if(ch)supabase.removeChannel(ch)}},[])

  const stats=useMemo(()=>{const pendientes=pedidos.filter(p=>p.estado==='pendiente').length;const enProceso=pedidos.filter(p=>p.estado==='en_proceso').length;const finalizados=pedidos.filter(p=>p.estado==='finalizado').length;const cancelados=pedidos.filter(p=>p.estado==='cancelado').length;const descargas=pedidos.filter(p=>Boolean(p.mod_path)).length;const vehiculos=new Set(pedidos.map(p=>[p.marca,p.modelo,p.motor].filter(Boolean).join('|')).filter(Boolean)).size;const tasaExito=pedidos.length?Math.round((finalizados/pedidos.length)*1000)/10:0
    const tiempos=pedidos.filter(p=>p.estado==='finalizado'&&p.created_at&&p.updated_at).map(p=>new Date(p.updated_at as string).getTime()-new Date(p.created_at as string).getTime()).filter(ms=>Number.isFinite(ms)&&ms>0)
    const tiempoMedioMs=tiempos.length?tiempos.reduce((a,b)=>a+b,0)/tiempos.length:0
    return{pendientes,enProceso,finalizados,cancelados,descargas,vehiculos,activos:pendientes+enProceso,tasaExito,tiempoMedioMs}},[pedidos])
  const latest=pedidos.slice(0,6);const unread=notifs.filter(n=>!n.leida).length

  const trends=useMemo(()=>{
    const day=24*3600*1000;const now=Date.now();const thisStart=now-7*day;const prevStart=now-14*day
    const inRange=(iso?:string|null,from?:number,to?:number)=>{if(!iso)return false;const t=new Date(iso).getTime();return t>=(from as number)&&t<(to as number)}
    const createdThis=pedidos.filter(p=>inRange(p.created_at,thisStart,now)).length
    const createdPrev=pedidos.filter(p=>inRange(p.created_at,prevStart,thisStart)).length
    const finalizadosThis=pedidos.filter(p=>p.estado==='finalizado'&&inRange(p.updated_at,thisStart,now)).length
    const finalizadosPrev=pedidos.filter(p=>p.estado==='finalizado'&&inRange(p.updated_at,prevStart,thisStart)).length
    const enProcesoThis=pedidos.filter(p=>p.estado==='en_proceso'&&inRange(p.created_at,thisStart,now)).length
    const enProcesoPrev=pedidos.filter(p=>p.estado==='en_proceso'&&inRange(p.created_at,prevStart,thisStart)).length
    const tiempoThis=avgTurnaroundMs(pedidos.filter(p=>p.estado==='finalizado'&&inRange(p.updated_at,thisStart,now)))
    const tiempoPrev=avgTurnaroundMs(pedidos.filter(p=>p.estado==='finalizado'&&inRange(p.updated_at,prevStart,thisStart)))
    return{
      activos:pctChange(createdThis,createdPrev),
      completados:pctChange(finalizadosThis,finalizadosPrev),
      enProceso:pctChange(enProcesoThis,enProcesoPrev),
      tiempoMedioDeltaMs:(tiempoThis&&tiempoPrev)?tiempoThis-tiempoPrev:0,
    }
  },[pedidos])

  const servicios=useMemo(()=>{const counts=new Map<string,number>();for(const p of pedidos){for(const s of p.servicios||[]){counts.set(s,(counts.get(s)||0)+1)}}const total=Array.from(counts.values()).reduce((a,b)=>a+b,0);const palette=['#ef1018','#3b82f6','#f59e0b','#32d583','#a855f7','#94a3b8'];return Array.from(counts.entries()).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([label,value],i)=>({label,value,pct:total?Math.round((value/total)*1000)/10:0,color:palette[i%palette.length]}))},[pedidos])

  const estadoDonut=useMemo(()=>{
    const segs=[
      {label:'Completados',value:stats.finalizados,color:'#32d583'},
      {label:'En proceso',value:stats.enProceso,color:'#3b82f6'},
      {label:'Pendientes',value:stats.pendientes,color:'#ef1018'},
      {label:'Cancelados',value:stats.cancelados,color:'#94a3b8'},
    ]
    const total=segs.reduce((a,s)=>a+s.value,0)
    let acc=0
    const stops=segs.map(s=>{const pct=total?(s.value/total)*100:0;const start=acc;acc+=pct*3.6;return {...s,pct:Math.round(pct*10)/10,gradient:`${s.color} ${start}deg ${acc}deg`}})
    return {segs:stops,total,gradient:total?`conic-gradient(${stops.map(s=>s.gradient).join(',')})`:'conic-gradient(rgba(255,255,255,.08) 0 360deg)'}
  },[stats])

  const dailyActivity=useMemo(()=>{
    const days=30
    const now=new Date();now.setHours(0,0,0,0)
    const buckets=Array.from({length:days},(_,i)=>{const d=new Date(now);d.setDate(d.getDate()-(days-1-i));return {date:d,count:0}})
    for(const p of pedidos){
      if(!p.created_at)continue
      const d=new Date(p.created_at);d.setHours(0,0,0,0)
      const b=buckets.find(x=>x.date.getTime()===d.getTime())
      if(b)b.count+=1
    }
    return buckets
  },[pedidos])

  const chart=useMemo(()=>{
    const w=600,h=170,padTop=10,padBottom=10,padLeft=30,padRight=10
    const counts=dailyActivity.map(b=>b.count)
    const rawMax=Math.max(5,...counts)
    const pow=Math.pow(10,Math.floor(Math.log10(rawMax)))
    const norm=rawMax/pow
    const niceNorm=norm<=1?1:norm<=2?2:norm<=5?5:10
    const max=niceNorm*pow
    const ticks=[0,.25,.5,.75,1].map(f=>Math.round(max*f))
    const plotW=w-padLeft-padRight
    const stepX=plotW/Math.max(1,dailyActivity.length-1)
    const points=dailyActivity.map((b,i)=>[padLeft+i*stepX,h-padBottom-((b.count/max)*(h-padTop-padBottom))] as const)
    const line=points.map((p,i)=>`${i===0?'M':'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
    const area=`${line} L${points[points.length-1][0].toFixed(1)},${h-padBottom} L${points[0][0].toFixed(1)},${h-padBottom} Z`
    return {w,h,padTop,padBottom,padLeft,padRight,stepX,points,line,area,max,ticks}
  },[dailyActivity])

  const pipeline=useMemo(()=>[
    {label:'Recibidos',value:pedidos.length,icon:CloudUpload},
    {label:'En laboratorio',value:stats.enProceso,icon:Gauge},
    {label:'Listos para descarga',value:stats.descargas,icon:Download},
    {label:'Finalizados',value:stats.finalizados,icon:CheckCircle2},
  ],[pedidos.length,stats])

  const alertas=useMemo(()=>{const now=Date.now();const lentos=pedidos.filter(p=>p.estado!=='finalizado'&&p.estado!=='cancelado'&&p.created_at&&(now-new Date(p.created_at).getTime())>24*3600*1000);const list:{icon:any;tone:string;title:string;sub:string}[]=[]
    if(lentos.length)list.push({icon:AlertTriangle,tone:'text-amber-300 bg-amber-400/10 border-amber-400/20',title:`${lentos.length} pedido${lentos.length===1?'':'s'} llevan más de 24h sin finalizar`,sub:dateTime(lentos[0].created_at)})
    if(unread)list.push({icon:BellRing,tone:'text-blue-300 bg-blue-400/10 border-blue-400/20',title:`${unread} notificación${unread===1?'':'es'} sin leer`,sub:'Revisa tu actividad'})
    if(!list.length)list.push({icon:CheckCircle2,tone:'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',title:'Todo al día',sub:'Sin incidencias pendientes'})
    return list},[pedidos,unread])

  return <AppShell><div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <div className="ak5-kicker">Bienvenido de nuevo</div>
        <h1 className="ak5-title mt-2 text-3xl sm:text-4xl">Hola, <span className="bg-gradient-to-r from-[#ff1924] to-[#ff8a3a] bg-clip-text text-transparent">{name}</span></h1>
        <p className="mt-2 max-w-2xl text-sm text-white/45">Resumen de tu actividad y rendimiento de servicios por archivo.</p>
      </div>
      <Link href="/nuevo-pedido" className="ak5-primary shrink-0"><CloudUpload size={18}/> Nuevo archivo / pedido</Link>
    </div>

    {error&&<div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Stat label="Pedidos activos" value={stats.activos} sub="vs. semana anterior" trendPct={trends.activos} icon={Clock3} tone="red"/>
      <Stat label="Completados" value={stats.finalizados} sub="vs. semana anterior" trendPct={trends.completados} icon={CheckCircle2} tone="green"/>
      <Stat label="En proceso" value={stats.enProceso} sub="vs. semana anterior" trendPct={trends.enProceso} icon={Gauge} tone="amber"/>
      <Stat label="Tiempo medio" value={formatDuration(stats.tiempoMedioMs)} sub="vs. semana anterior" trendDurationMs={trends.tiempoMedioDeltaMs} icon={Target} tone="blue"/>
    </section>

    <section className="grid gap-5 2xl:grid-cols-[1.5fr_1fr]">
      <div className="ak5-card relative overflow-hidden rounded-[26px] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><div className="ak5-kicker text-red-300">Actividad de pedidos</div><h3 className="mt-1 text-xl font-black">Últimos 30 días</h3></div>
          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-white/35"><i className="h-2 w-2 rounded-full bg-[var(--ak-red)]"/> Pedidos</span>
        </div>
        {loading ? <div className="py-16 text-center text-sm text-white/30">Cargando actividad...</div> : (
          <svg viewBox={`0 0 ${chart.w} ${chart.h+22}`} className="mt-4 w-full" preserveAspectRatio="none">
            <defs><linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef1018" stopOpacity="0.35"/><stop offset="100%" stopColor="#ef1018" stopOpacity="0"/></linearGradient></defs>
            {chart.ticks.map((t,i)=>{const y=chart.h-chart.padBottom-((t/chart.max)*(chart.h-chart.padTop-chart.padBottom));return <g key={i}><line x1={chart.padLeft} x2={chart.w-chart.padRight} y1={y} y2={y} stroke="rgba(255,255,255,.06)" strokeWidth="1"/><text x={chart.padLeft-8} y={y+3} textAnchor="end" fontSize="9" fill="rgba(255,255,255,.32)">{t}</text></g>})}
            <path d={chart.area} fill="url(#dashArea)" stroke="none"/>
            <path d={chart.line} fill="none" stroke="#ef1018" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            {dailyActivity.map((b,i)=> i%5===0 && <text key={i} x={chart.padLeft+i*chart.stepX} y={chart.h+16} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,.32)">{b.date.toLocaleDateString('es-ES',{day:'2-digit',month:'short'})}</text>)}
          </svg>
        )}
      </div>

      <div className="ak5-card relative overflow-hidden rounded-[26px] p-5 sm:p-6">
        <div className="ak5-kicker text-emerald-300">Estado de pedidos</div>
        <h3 className="mt-1 text-xl font-black">Distribución</h3>
        <div className="mt-6 flex items-center justify-center">
          <div className="relative h-36 w-36 shrink-0 rounded-full" style={{background:estadoDonut.gradient}}>
            <div className="absolute inset-[13px] grid place-items-center rounded-full bg-[#0a0b0d] text-center">
              <div><div className="text-2xl font-black">{estadoDonut.total}</div><div className="text-[9px] font-black uppercase tracking-[.16em] text-white/35">Total</div></div>
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-2">{estadoDonut.segs.map(s=><div key={s.label} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2 font-bold text-white/70"><i className="h-2.5 w-2.5 rounded-full" style={{background:s.color,boxShadow:`0 0 8px ${s.color}`}}/>{s.label}</span><span className="text-white/35">{s.value} ({s.pct}%)</span></div>)}</div>
        <Link href="/pedidos" className="mt-5 flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-red-300 transition hover:text-red-200">Ver todos los pedidos <ArrowRight size={13}/></Link>
      </div>
    </section>

    <section className="grid gap-5 2xl:grid-cols-[1.5fr_1fr]">
      <div className="ak5-card relative overflow-hidden rounded-[26px]">
        <div className="flex items-center justify-between border-b border-white/[.07] px-5 py-4 sm:px-6"><div><div className="ak5-kicker text-red-300">Actividad reciente</div><h2 className="mt-1 text-xl font-black">Pedidos recientes</h2></div><Link href="/pedidos" className="text-xs font-black uppercase tracking-wider text-red-300 transition hover:text-red-200">Ver todos →</Link></div>
        {loading?<div className="p-10 text-center text-white/35">Cargando Inicio...</div>:latest.length===0?<div className="p-10 text-center text-white/35">Todavía no hay pedidos.</div>:(
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead><tr className="border-b border-white/[.06] text-[10px] font-black uppercase tracking-[.14em] text-white/30"><th className="px-5 py-3 sm:px-6">Pedido</th><th className="px-5 py-3">Vehículo</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3 sm:px-6">Actualizado</th></tr></thead>
              <tbody className="divide-y divide-white/[.05]">{latest.map(p=><tr key={p.id} className="cursor-pointer transition hover:bg-white/[.025]" onClick={()=>{window.location.href=`/pedidos/${p.id}`}}>
                <td className="px-5 py-3.5 font-mono text-xs font-bold text-red-300 sm:px-6">#{p.numero||p.id.slice(0,8)}</td>
                <td className="px-5 py-3.5"><div className="font-bold">{vehicleTitle(p)}</div><div className="mt-0.5 text-xs text-white/30">{(p.servicios||[]).slice(0,2).join(' + ')||p.ecu||'—'}</div></td>
                <td className="px-5 py-3.5"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${tone(p.estado)}`}>{formatEstado(p.estado)}</span></td>
                <td className="px-5 py-3.5 text-xs text-white/35 sm:px-6">{dateTime(p.updated_at||p.created_at)}</td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
      </div>

      <div className="ak5-card relative overflow-hidden rounded-[26px] p-5 sm:p-6">
        <div className="ak5-kicker text-blue-300">Distribución</div>
        <h3 className="mt-1 text-xl font-black">Servicios más demandados</h3>
        {servicios.length===0?<div className="mt-8 py-8 text-center text-sm text-white/30">Sin datos de servicios todavía.</div>:(
          <div className="mt-6 space-y-4">{servicios.map(s=>(
            <div key={s.label}>
              <div className="flex items-center justify-between text-xs font-bold"><span className="text-white/75">{s.label}</span><span className="text-white/35">{s.value} ({s.pct}%)</span></div>
              <div className="mt-2 h-[6px] overflow-hidden rounded-full bg-white/[.06]"><div className="h-full rounded-full transition-[width]" style={{width:`${s.pct}%`,background:s.color,boxShadow:`0 0 10px ${s.color}66`}}/></div>
            </div>
          ))}</div>
        )}
        <Link href="/nuevo-pedido" className="mt-6 flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-red-300 transition hover:text-red-200">Solicitar un servicio <ArrowRight size={13}/></Link>
      </div>
    </section>

    <section className="grid gap-5 xl:grid-cols-[.9fr_1.4fr]">
      <div className="ak5-card relative overflow-hidden rounded-[26px] p-5 sm:p-6">
        <div className="pointer-events-none absolute -left-12 -top-16 h-56 w-56 rounded-full" style={{background:'radial-gradient(circle,rgba(245,158,11,.1),transparent 70%)'}}/>
        <div className="relative flex items-center justify-between"><div><div className="ak5-kicker text-amber-300">Estado</div><h3 className="mt-1 text-xl font-black">Alertas del sistema</h3></div><AlertTriangle className="text-amber-300"/></div>
        <div className="relative mt-5 space-y-3">{alertas.map((a,i)=>{const Icon=a.icon;return <div key={i} className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-xs ${a.tone}`}><Icon size={16} className="mt-0.5 shrink-0"/><div><div className="font-bold text-white">{a.title}</div><div className="mt-0.5 text-white/40">{a.sub}</div></div></div>})}</div>
        <div className="relative mt-5 grid grid-cols-4 gap-2">{pipeline.map(s=>{const Icon=s.icon;return <div key={s.label} className="rounded-xl border border-white/[.06] bg-black/20 p-2.5 text-center"><Icon size={14} className="mx-auto text-white/40"/><div className="mt-1.5 text-sm font-black">{s.value}</div><div className="mt-0.5 text-[8px] font-bold uppercase leading-tight text-white/30">{s.label}</div></div>})}</div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="ak5-card relative overflow-hidden rounded-[26px] p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full" style={{background:'radial-gradient(circle,rgba(239,16,24,.1),transparent 70%)'}}/>
          <div className="relative flex items-center justify-between"><div><div className="ak5-kicker text-blue-300">Trabaja más rápido</div><h3 className="mt-1 text-xl font-black">Accesos rápidos</h3></div><Zap className="text-red-300"/></div>
          <div className="relative mt-5 grid grid-cols-2 gap-3"><Quick href="/nuevo-pedido" icon={UploadCloud} label="Nuevo pedido"/><Quick href="/pedidos" icon={FileText} label="Pedidos"/><Quick href="/garage" icon={Car} label="Garage"/><Quick href="/biblioteca" icon={Library} label="Biblioteca"/><Quick href="/descargas" icon={Download} label="Versiones"/><Quick href="/soporte" icon={Headphones} label="Soporte"/></div>
        </div>
        <div className="ak5-card relative overflow-hidden rounded-[26px] p-5 sm:p-6">
          <div className="pointer-events-none absolute -left-10 -bottom-14 h-48 w-48 rounded-full" style={{background:'radial-gradient(circle,rgba(168,85,247,.1),transparent 70%)'}}/>
          <div className="relative flex items-center justify-between"><div><div className="ak5-kicker text-purple-300">Sistema</div><h3 className="mt-1 text-xl font-black">Estado del sistema</h3></div><Activity className="text-emerald-300"/></div>
          <div className="relative mt-5 space-y-3"><Health label="Sincronización" value="Realtime"/><Health label="Seguridad" value="Activa"/><Health label="Base de datos" value="Conectada"/><Health label="Soporte" value="Disponible"/></div>
          <Link href="/intelligence" className="ak5-secondary relative mt-5 w-full"><Cpu size={16}/> Abrir AK Intelligence</Link>
        </div>
      </div>
    </section>
  </div></AppShell>
}

function Stat({label,value,sub,icon:Icon,tone,trendPct,trendDurationMs}:{label:string;value:any;sub:string;icon:any;tone:'amber'|'green'|'blue'|'red'|'purple';trendPct?:number;trendDurationMs?:number}){
  const map:any={
    amber:{badge:'text-amber-300 bg-amber-400/10 border-amber-400/20',glow:'rgba(245,158,11,.16)',line:'rgba(245,158,11,.35)',dot:'bg-amber-400'},
    green:{badge:'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',glow:'rgba(52,211,153,.16)',line:'rgba(52,211,153,.35)',dot:'bg-emerald-400'},
    blue:{badge:'text-blue-300 bg-blue-400/10 border-blue-400/20',glow:'rgba(59,130,246,.16)',line:'rgba(59,130,246,.35)',dot:'bg-blue-400'},
    red:{badge:'text-red-300 bg-red-400/10 border-red-400/20',glow:'rgba(239,16,24,.18)',line:'rgba(239,16,24,.4)',dot:'bg-red-400'},
    purple:{badge:'text-purple-300 bg-purple-400/10 border-purple-400/20',glow:'rgba(168,85,247,.16)',line:'rgba(168,85,247,.35)',dot:'bg-purple-400'},
  }
  const t=map[tone]
  const durationLabel=trendDurationMs!==undefined?formatDurationDelta(trendDurationMs):null
  const positive=trendDurationMs!==undefined?(trendDurationMs!==0?trendDurationMs<0:null):(trendPct!==undefined?trendPct>0:null)
  const trendLabel=durationLabel||(trendPct!==undefined?`${trendPct>0?'+':''}${trendPct}%`:null)
  return (
    <div className="ak5-card ak5-card-hover relative overflow-hidden rounded-[22px] p-5">
      <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full" style={{background:`radial-gradient(circle,${t.glow},transparent 70%)`}}/>
      <div className="relative flex items-center gap-4">
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border ${t.badge}`}><Icon size={20}/></div>
        <div className="min-w-0">
          <div className="text-[11px] font-black uppercase tracking-[.14em] text-white/46">{label}</div>
          <div className="mt-1 text-2xl font-black xl:text-3xl">{value}</div>
        </div>
      </div>
      <div className="relative mt-3 flex items-center gap-1.5 text-xs">
        {trendLabel && positive!==null ? (
          <>
            <span className={`flex items-center gap-0.5 font-bold ${positive?'text-emerald-400':'text-red-400'}`}>{positive?<ArrowUp size={12}/>:<ArrowDown size={12}/>}{trendLabel}</span>
            <span className="text-white/28">{sub}</span>
          </>
        ) : <span className="text-white/30">{sub}</span>}
      </div>
    </div>
  )
}
function Quick({href,icon:Icon,label}:{href:string;icon:any;label:string}){return <Link href={href} className="group relative overflow-hidden rounded-2xl border border-white/[.07] bg-white/[.025] p-4 transition hover:border-red-400/25 hover:bg-red-500/[.055]"><div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl bg-black/25 text-red-300 transition group-hover:shadow-[0_0_16px_rgba(239,16,24,.35)]"><Icon size={17}/></span><ArrowRight size={15} className="text-white/20 transition group-hover:translate-x-1 group-hover:text-red-300"/></div><div className="mt-4 text-sm font-bold">{label}</div></Link>}
function Health({label,value}:{label:string;value:string}){return <div className="flex items-center justify-between rounded-xl border border-white/[.06] bg-black/20 px-4 py-3 text-sm"><span className="text-white/45">{label}</span><span className="flex items-center gap-2 font-bold text-emerald-300"><i className="ak5-live h-2 w-2 rounded-full bg-emerald-400"/>{value}</span></div>}
