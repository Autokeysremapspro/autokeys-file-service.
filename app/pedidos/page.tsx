'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, Download, Eye, Grid2X2, List, Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import AppShell from '@/components/AppShell'
import { getMisPedidos, type FileServicePedido, formatEstado } from '@/lib/services/pedidos'

function statusClass(estado?: string | null) {
  if (estado === 'finalizado') return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
  if (estado === 'en_proceso') return 'border-amber-400/20 bg-amber-400/10 text-amber-300'
  if (estado === 'cancelado') return 'border-red-400/20 bg-red-400/10 text-red-300'
  return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300'
}

function progress(estado?: string | null) {
  if (estado === 'finalizado') return 100
  if (estado === 'en_proceso') return 62
  if (estado === 'cancelado') return 8
  return 24
}

function prioridadInfo(prioridad?: string | null) {
  const value = (prioridad || '').toLowerCase()
  if (value === 'urgente' || value === 'alta') return { label: 'Alta', cls: 'text-red-300' }
  if (value === 'baja') return { label: 'Baja', cls: 'text-emerald-300' }
  if (value === 'media') return { label: 'Media', cls: 'text-amber-300' }
  return { label: 'Normal', cls: 'text-white/40' }
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<FileServicePedido[]>([])
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'cards' | 'compact'>('compact')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMisPedidos().then(setPedidos).catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pedidos
    return pedidos.filter((pedido) => [pedido.numero, pedido.ori_nombre, pedido.ecu, pedido.hw, pedido.sw, pedido.marca, pedido.modelo, pedido.motor, ...(pedido.servicios || [])].some((value) => (value || '').toLowerCase().includes(q)))
  }, [pedidos, query])

  const abiertos = pedidos.filter((p) => p.estado !== 'finalizado' && p.estado !== 'cancelado').length
  const finalizados = pedidos.filter((p) => p.estado === 'finalizado').length
  const esperando = pedidos.filter((p) => p.estado === 'pendiente').length

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="ak5-card ak5-gridline relative overflow-hidden rounded-[28px] p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full" style={{background:'radial-gradient(circle,rgba(239,16,24,.12),transparent 70%)'}}/>
          <div className="relative flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <span className="ak5-chip border-red-400/20 bg-red-400/10 text-red-300"><Sparkles size={13}/> Workspace · Pedidos</span>
              <h1 className="ak5-title mt-4 text-4xl sm:text-5xl">Mis trabajos</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">Controla cada archivo como un expediente vivo: estado, precio, revisiones, versiones y conversación técnica.</p>
            </div>
            <Link href="/nuevo-pedido" className="ak5-primary shrink-0"><Sparkles size={16}/> Crear nuevo trabajo</Link>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          {[['En curso', abiertos, 'Trabajos activos', 'red'], ['Esperando', esperando, 'Pendientes de análisis', 'amber'], ['Finalizados', finalizados, 'Listos y archivados', 'green']].map(([label, value, helper, t]) => {
            const glow: any = { red: 'rgba(239,16,24,.14)', amber: 'rgba(245,158,11,.14)', green: 'rgba(52,211,153,.14)' }
            return (
              <div key={String(label)} className="ak5-card relative overflow-hidden rounded-[22px] p-5">
                <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full" style={{ background: `radial-gradient(circle,${glow[t as string]},transparent 70%)` }} />
                <div className="relative text-[10px] font-black uppercase tracking-[.22em] text-white/28">{label}</div>
                <div className="relative mt-3 text-4xl font-black tracking-tight">{value}</div>
                <div className="relative mt-1 text-xs text-white/35">{helper}</div>
              </div>
            )
          })}
        </div>

        <div className="ak5-card flex flex-col gap-3 rounded-[22px] p-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
            <Search size={18} className="text-white/30" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pedido, vehículo, ECU, HW, SW o servicio..." className="w-full bg-transparent text-sm outline-none placeholder:text-white/22" />
          </div>
          <button className="flex items-center justify-center gap-2 rounded-2xl border border-white/8 bg-white/[.025] px-4 py-3 text-xs font-bold text-white/45"><SlidersHorizontal size={16}/> Filtros</button>
          <div className="flex rounded-2xl border border-white/[.08] bg-black/20 p-1">
            <button onClick={() => setView('cards')} className={`rounded-xl px-3 py-2 text-[11px] font-black transition ${view === 'cards' ? 'bg-red-400/15 text-red-300' : 'text-white/35'}`}><Grid2X2 size={15}/></button>
            <button onClick={() => setView('compact')} className={`rounded-xl px-3 py-2 text-[11px] font-black transition ${view === 'compact' ? 'bg-red-400/15 text-red-300' : 'text-white/35'}`}><List size={15}/></button>
          </div>
        </div>

        {loading ? (
          <div className="ak5-card p-8 text-white/35">Cargando trabajos...</div>
        ) : filtered.length === 0 ? (
          <div className="ak5-card p-10 text-center text-white/35">No hay trabajos que coincidan con la búsqueda.</div>
        ) : view === 'cards' ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {filtered.map((pedido) => (
              <Link key={pedido.id} href={`/pedidos/${pedido.id}`} className="ak5-card ak5-card-hover group block p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-red-400/25 bg-red-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-red-300">{pedido.numero || 'FS'}</span>
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${statusClass(pedido.estado)}`}>{formatEstado(pedido.estado)}</span>
                      {pedido.prioridad === 'urgente' && <span className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-[10px] font-black uppercase text-red-300">Urgente</span>}
                    </div>
                    <h2 className="mt-4 truncate text-2xl font-black tracking-tight">{pedido.ecu || 'ECU pendiente'}</h2>
                    <p className="mt-1 truncate text-sm text-white/38">{[pedido.marca, pedido.modelo, pedido.motor, pedido.cv].filter(Boolean).join(' · ') || pedido.ori_nombre || 'Vehículo pendiente'}</p>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/8 bg-white/[.025] text-white/28 transition group-hover:border-red-400/25 group-hover:text-red-300"><ArrowRight size={19}/></span>
                </div>

                <div className="mt-5 h-[7px] overflow-hidden rounded-full bg-white/[.055]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#ef1018] to-[#ff9a5a] shadow-[0_0_14px_rgba(239,16,24,.4)] transition-[width]" style={{ width: `${progress(pedido.estado)}%` }} />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {(pedido.servicios || []).slice(0, 4).map((servicio) => <span key={servicio} className="rounded-full border border-white/7 bg-white/[.025] px-3 py-1 text-[11px] font-bold text-white/42">{servicio}</span>)}
                  {(pedido.servicios || []).length > 4 && <span className="rounded-full border border-white/7 px-3 py-1 text-[11px] text-white/28">+{(pedido.servicios || []).length - 4}</span>}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/6 pt-4 text-xs text-white/32">
                  <span className="flex items-center gap-2"><Calendar size={14}/>{pedido.created_at ? new Date(pedido.created_at).toLocaleDateString('es-ES') : '—'}</span>
                  <span className="flex items-center gap-2"><Download size={14}/>{pedido.mod_path ? 'Versión disponible' : 'En preparación'}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="ak5-card overflow-hidden rounded-[22px]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[.07] text-[10px] font-black uppercase tracking-[.16em] text-white/32">
                    <th className="px-5 py-4 font-black">Pedido</th>
                    <th className="px-5 py-4 font-black">Vehículo</th>
                    <th className="px-5 py-4 font-black">Servicio</th>
                    <th className="px-5 py-4 font-black">Estado</th>
                    <th className="px-5 py-4 font-black">Prioridad</th>
                    <th className="px-5 py-4 font-black">Fecha</th>
                    <th className="px-5 py-4 text-right font-black">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[.05]">
                  {filtered.map((pedido) => {
                    const prio = prioridadInfo(pedido.prioridad)
                    return (
                      <tr key={pedido.id} className="transition hover:bg-white/[.02]">
                        <td className="px-5 py-4"><span className="rounded-full border border-red-400/25 bg-red-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-red-300">{pedido.numero || 'FS'}</span></td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-white/85">{[pedido.marca, pedido.modelo].filter(Boolean).join(' ') || pedido.ecu || 'Pendiente'}</div>
                          <div className="text-xs text-white/32">{[pedido.motor, pedido.cv].filter(Boolean).join(' · ') || '—'}</div>
                        </td>
                        <td className="px-5 py-4 text-white/55">{(pedido.servicios || []).slice(0, 2).join(' + ') || '—'}{(pedido.servicios || []).length > 2 ? ` +${(pedido.servicios || []).length - 2}` : ''}</td>
                        <td className="px-5 py-4"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${statusClass(pedido.estado)}`}>{formatEstado(pedido.estado)}</span></td>
                        <td className={`px-5 py-4 text-xs font-bold ${prio.cls}`}>{prio.label}</td>
                        <td className="px-5 py-4 text-xs text-white/40">{pedido.created_at ? new Date(pedido.created_at).toLocaleDateString('es-ES') : '—'}</td>
                        <td className="px-5 py-4 text-right">
                          <Link href={`/pedidos/${pedido.id}`} aria-label={`Ver pedido ${pedido.numero || ''}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-white/[.025] text-white/40 transition hover:border-red-400/25 hover:text-red-300"><Eye size={15}/></Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
