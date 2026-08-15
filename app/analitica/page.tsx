'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, BarChart3, CalendarDays, CheckCircle2, Clock3, Repeat2, TrendingUp } from 'lucide-react'
import AppShell from '@/components/AppShell'
import { supabase } from '@/lib/supabase'
import { getMisPedidos, type FileServicePedido } from '@/lib/services/pedidos'

function hoursBetween(a?: string | null, b?: string | null) {
  if (!a || !b) return null
  const start = new Date(a).getTime()
  const end = new Date(b).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null
  return (end - start) / 3600000
}

function openAge(createdAt?: string | null) {
  if (!createdAt) return 'Antigüedad no disponible'
  const hours = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / 3600000)
  if (!Number.isFinite(hours)) return 'Antigüedad no disponible'
  if (hours >= 48) return `${Math.floor(hours / 24)} días abierto`
  return `${Math.floor(hours)} h abierto`
}

function vehicleKey(p: FileServicePedido) {
  return [p.marca, p.modelo, p.motor, p.ecu].filter(Boolean).map(v => String(v).trim().toLowerCase()).join('|')
}

export default function AnaliticaPage() {
  const [pedidos, setPedidos] = useState<FileServicePedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    let channel: ReturnType<typeof supabase.channel> | null = null

    async function load(showLoading = false) {
      if (showLoading && alive) setLoading(true)
      try {
        const data = await getMisPedidos()
        if (alive) {
          setPedidos(data)
          setError(null)
        }
      } catch (e: any) {
        if (alive) setError(e?.message || 'No se pudo cargar la analítica')
      } finally {
        if (showLoading && alive) setLoading(false)
      }
    }

    ;(async () => {
      await load(true)
      const { data } = await supabase.auth.getUser()
      const userId = data.user?.id
      if (!alive || !userId) return

      channel = supabase
        .channel(`analytics-${userId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'file_service_pedidos',
          filter: `user_id=eq.${userId}`,
        }, () => { void load(false) })
        .subscribe()
    })()

    return () => {
      alive = false
      if (channel) void supabase.removeChannel(channel)
    }
  }, [])

  const analytics = useMemo(() => {
    const now = Date.now()
    const d7 = now - 7 * 86400000
    const d14 = now - 14 * 86400000
    const d30 = now - 30 * 86400000
    const last7 = pedidos.filter(p => p.created_at && new Date(p.created_at).getTime() >= d7)
    const previous7 = pedidos.filter(p => {
      if (!p.created_at) return false
      const t = new Date(p.created_at).getTime()
      return t >= d14 && t < d7
    })
    const last30 = pedidos.filter(p => p.created_at && new Date(p.created_at).getTime() >= d30)
    const finished = pedidos.filter(p => p.estado === 'finalizado')
    const cycle = finished.map(p => hoursBetween(p.created_at, p.updated_at)).filter((v): v is number => v !== null)
    const avgHours = cycle.length ? cycle.reduce((a, b) => a + b, 0) / cycle.length : 0
    const open24 = pedidos
      .filter(p => p.estado !== 'finalizado' && p.estado !== 'cancelado' && p.created_at && now - new Date(p.created_at).getTime() > 86400000)
      .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())

    const vehicles = new Map<string, number>()
    for (const p of pedidos) {
      const key = vehicleKey(p)
      if (key) vehicles.set(key, (vehicles.get(key) || 0) + 1)
    }
    const recurrent = Array.from(vehicles.values()).filter(v => v > 1).length

    const services = new Map<string, number>()
    for (const p of pedidos) for (const s of p.servicios || []) services.set(s, (services.get(s) || 0) + 1)
    const topServices = Array.from(services.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
    const maxServiceCount = topServices[0]?.[1] || 0
    const weeklyDelta = previous7.length
      ? Math.round(((last7.length - previous7.length) / previous7.length) * 1000) / 10
      : last7.length > 0 ? 100 : 0

    return {
      last7: last7.length,
      previous7: previous7.length,
      weeklyDelta,
      last30: last30.length,
      completion: pedidos.length ? Math.round((finished.length / pedidos.length) * 1000) / 10 : 0,
      avgHours,
      recurrent,
      open24,
      topServices,
      maxServiceCount,
    }
  }, [pedidos])

  const weeklyTrend = analytics.weeklyDelta > 0
    ? `+${analytics.weeklyDelta}% vs. 7 días anteriores`
    : analytics.weeklyDelta < 0
      ? `${analytics.weeklyDelta}% vs. 7 días anteriores`
      : `${analytics.previous7} en los 7 días anteriores`

  return <AppShell><div className="space-y-6">
    <section className="ak5-card ak5-gridline relative overflow-hidden rounded-[28px] p-6 sm:p-8">
      <div className="ak5-kicker text-cyan-300">Fase 2.5</div>
      <h1 className="ak5-title mt-2 text-4xl sm:text-5xl">Analítica de tu actividad</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-white/45">Indicadores calculados únicamente con tus pedidos para ayudarte a detectar carga, recurrencia y tiempos de trabajo sin automatizar decisiones técnicas del laboratorio.</p>
    </section>

    {error && <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

    {loading ? <div className="ak5-card rounded-[24px] p-10 text-center text-white/35">Calculando indicadores...</div> : <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Metric icon={TrendingUp} label="Pedidos 7 días" value={analytics.last7} sub={weeklyTrend} />
        <Metric icon={CalendarDays} label="Pedidos 30 días" value={analytics.last30} sub="Volumen reciente" />
        <Metric icon={CheckCircle2} label="Finalización" value={`${analytics.completion}%`} sub="Sobre todos tus pedidos" />
        <Metric icon={Clock3} label="Ciclo medio" value={analytics.avgHours ? `${analytics.avgHours.toFixed(1)} h` : '—'} sub="Estimado con pedidos finalizados" />
        <Metric icon={Repeat2} label="Vehículos recurrentes" value={analytics.recurrent} sub="Con más de un trabajo" />
        <Metric icon={AlertTriangle} label="Abiertos +24 h" value={analytics.open24.length} sub="Pendientes de seguimiento" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_.9fr]">
        <div className="ak5-card rounded-[26px] p-5 sm:p-6">
          <div className="flex items-center gap-3"><BarChart3 className="text-cyan-300"/><div><div className="ak5-kicker text-cyan-300">Demanda</div><h2 className="mt-1 text-xl font-black">Servicios más solicitados</h2></div></div>
          <div className="mt-6 space-y-3">{analytics.topServices.length ? analytics.topServices.map(([name, count]) => <div key={name} className="rounded-2xl border border-white/[.06] bg-black/20 px-4 py-3"><div className="flex items-center justify-between text-sm"><span className="font-bold text-white/75">{name}</span><span className="font-black text-cyan-300">{count}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[.05]"><div className="h-full rounded-full bg-cyan-400/70" style={{width: `${analytics.maxServiceCount ? Math.max(8, (count / analytics.maxServiceCount) * 100) : 0}%`}}/></div></div>) : <div className="py-8 text-center text-sm text-white/30">Aún no hay suficiente actividad para calcular servicios principales.</div>}</div>
        </div>

        <div className="ak5-card rounded-[26px] p-5 sm:p-6">
          <div className="ak5-kicker text-amber-300">Seguimiento automático</div>
          <h2 className="mt-1 text-xl font-black">Pedidos que requieren atención</h2>
          <p className="mt-2 text-xs leading-5 text-white/35">Se muestran primero los pedidos abiertos durante más tiempo; este bloque no modifica estados ni archivos.</p>
          <div className="mt-5 space-y-3">{analytics.open24.length ? analytics.open24.slice(0, 6).map(p => <a key={p.id} href={`/pedidos/${p.id}`} className="block rounded-2xl border border-amber-400/15 bg-amber-400/[.05] px-4 py-3 transition hover:bg-amber-400/[.08]"><div className="flex items-start justify-between gap-3"><div className="text-sm font-bold">{[p.marca,p.modelo,p.motor].filter(Boolean).join(' ') || p.ori_nombre || 'Pedido'}</div><span className="shrink-0 rounded-full border border-amber-400/15 bg-amber-400/[.08] px-2.5 py-1 text-[10px] font-black text-amber-200">{openAge(p.created_at)}</span></div><div className="mt-1 text-xs text-white/35">#{p.numero || p.id.slice(0,8)} · {p.estado}</div></a>) : <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[.05] p-5 text-sm text-emerald-200">No tienes pedidos abiertos con más de 24 horas.</div>}</div>
        </div>
      </section>
    </>}
  </div></AppShell>
}

function Metric({icon:Icon,label,value,sub}:{icon:any;label:string;value:any;sub:string}) {
  return <div className="ak5-card ak5-card-hover rounded-[22px] p-5"><div className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-400/15 bg-cyan-400/[.06] text-cyan-300"><Icon size={18}/></div><div className="mt-5 text-3xl font-black">{value}</div><div className="mt-1 text-[11px] font-black uppercase tracking-[.13em] text-white/48">{label}</div><div className="mt-2 text-xs text-white/28">{sub}</div></div>
}
