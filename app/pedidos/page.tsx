'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, CheckCircle2, Clock3, Download, Eye, FileDown, Gauge, Grid2X2, List, ShoppingBag, Search } from 'lucide-react'
import AppShell from '@/components/AppShell'
import CustomSelect from '@/components/ak/CustomSelect'
import { getMisPedidos, type FileServicePedido, formatEstado, type PedidoEstado } from '@/lib/services/pedidos'

function statusClass(estado?: string | null) {
  if (estado === 'finalizado') return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
  if (estado === 'en_proceso') return 'border-blue-400/20 bg-blue-400/10 text-blue-300'
  if (estado === 'cancelado') return 'border-slate-400/20 bg-slate-400/10 text-slate-300'
  return 'border-red-400/20 bg-red-400/10 text-red-300'
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

function csvEscape(value: string) {
  const needsQuotes = /[",\n;]/.test(value)
  const escaped = value.replace(/"/g, '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

const ESTADOS: { value: PedidoEstado | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'cancelado', label: 'Cancelado' },
]

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<FileServicePedido[]>([])
  const [query, setQuery] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<string>('todos')
  const [servicioFiltro, setServicioFiltro] = useState<string>('todos')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [view, setView] = useState<'cards' | 'compact'>('compact')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMisPedidos().then(setPedidos).catch(console.error).finally(() => setLoading(false))
  }, [])

  const serviciosDisponibles = useMemo(() => {
    const set = new Set<string>()
    for (const p of pedidos) for (const s of p.servicios || []) set.add(s)
    return Array.from(set).sort()
  }, [pedidos])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const desde = fechaDesde ? new Date(fechaDesde).getTime() : null
    const hasta = fechaHasta ? new Date(fechaHasta).getTime() + 24 * 3600 * 1000 - 1 : null
    return pedidos.filter((pedido) => {
      if (estadoFiltro !== 'todos' && pedido.estado !== estadoFiltro) return false
      if (servicioFiltro !== 'todos' && !(pedido.servicios || []).includes(servicioFiltro)) return false
      if (desde || hasta) {
        const t = pedido.created_at ? new Date(pedido.created_at).getTime() : null
        if (!t) return false
        if (desde && t < desde) return false
        if (hasta && t > hasta) return false
      }
      if (q) {
        const hit = [pedido.numero, pedido.ori_nombre, pedido.ecu, pedido.hw, pedido.sw, pedido.marca, pedido.modelo, pedido.motor, ...(pedido.servicios || [])].some((value) => (value || '').toLowerCase().includes(q))
        if (!hit) return false
      }
      return true
    })
  }, [pedidos, query, estadoFiltro, servicioFiltro, fechaDesde, fechaHasta])

  const total = pedidos.length
  const finalizados = pedidos.filter((p) => p.estado === 'finalizado').length
  const enProceso = pedidos.filter((p) => p.estado === 'en_proceso').length
  const pendientes = pedidos.filter((p) => p.estado === 'pendiente').length

  function exportarCsv() {
    const headers = ['Pedido', 'Marca', 'Modelo', 'Motor', 'ECU', 'Servicios', 'Estado', 'Prioridad', 'Fecha']
    const rows = filtered.map((p) => [
      p.numero || p.id,
      p.marca || '',
      p.modelo || '',
      p.motor || '',
      p.ecu || '',
      (p.servicios || []).join(' + '),
      formatEstado(p.estado),
      prioridadInfo(p.prioridad).label,
      p.created_at ? new Date(p.created_at).toLocaleDateString('es-ES') : '',
    ])
    const csv = [headers, ...rows].map((row) => row.map((cell) => csvEscape(String(cell))).join(';')).join('\n')
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="ak5-title text-3xl sm:text-4xl">Pedidos</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/45">Gestiona y da seguimiento a todos tus pedidos de archivos.</p>
          </div>
          <Link href="/nuevo-pedido" className="ak5-primary shrink-0"><ArrowRight size={16}/> Nuevo pedido</Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {([['Total pedidos', total, 'Histórico completo', 'red', ShoppingBag], ['Completados', finalizados, 'Listos y archivados', 'green', CheckCircle2], ['En proceso', enProceso, 'Trabajando ahora mismo', 'amber', Gauge], ['Pendientes', pendientes, 'Esperando análisis', 'red', Clock3]] as const).map(([label, value, helper, t, Icon]) => {
            const glow: any = { red: 'rgba(239,16,24,.14)', amber: 'rgba(245,158,11,.14)', green: 'rgba(52,211,153,.14)', blue: 'rgba(59,130,246,.14)' }
            const badge: any = { red: 'border-red-400/20 bg-red-400/10 text-red-300', amber: 'border-amber-400/20 bg-amber-400/10 text-amber-300', green: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300', blue: 'border-blue-400/20 bg-blue-400/10 text-blue-300' }
            return (
              <div key={String(label)} className="ak5-card relative overflow-hidden rounded-[22px] p-5">
                <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full" style={{ background: `radial-gradient(circle,${glow[t as string]},transparent 70%)` }} />
                <div className={`relative grid h-11 w-11 place-items-center rounded-full border ${badge[t as string]}`}><Icon size={19}/></div>
                <div className="relative mt-4 text-4xl font-black tracking-tight">{value}</div>
                <div className="relative mt-1 text-[10px] font-black uppercase tracking-[.2em] text-white/40">{label}</div>
                <div className="relative mt-1 text-xs text-white/28">{helper}</div>
              </div>
            )
          })}
        </div>

        <div className="ak5-card grid gap-3 rounded-[22px] p-3 lg:grid-cols-[1fr_1fr_auto_auto_auto_auto]">
          <CustomSelect value={estadoFiltro} onChange={setEstadoFiltro} options={ESTADOS.map((e) => ({ value: e.value, label: e.label }))} />
          <CustomSelect value={servicioFiltro} onChange={setServicioFiltro} options={[{ value: 'todos', label: 'Todos los servicios' }, ...serviciosDisponibles.map((s) => ({ value: s, label: s }))]} />
          <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/70 outline-none" />
          <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/70 outline-none" />
          <button onClick={exportarCsv} className="flex items-center justify-center gap-2 rounded-2xl border border-white/8 bg-white/[.025] px-4 py-3 text-xs font-bold text-white/55 transition hover:border-red-400/25 hover:text-red-300"><FileDown size={16}/> Exportar</button>
          <div className="flex rounded-2xl border border-white/[.08] bg-black/20 p-1">
            <button onClick={() => setView('compact')} className={`flex-1 rounded-xl px-3 py-2 text-[11px] font-black transition ${view === 'compact' ? 'bg-red-400/15 text-red-300' : 'text-white/35'}`}><List size={15} className="mx-auto"/></button>
            <button onClick={() => setView('cards')} className={`flex-1 rounded-xl px-3 py-2 text-[11px] font-black transition ${view === 'cards' ? 'bg-red-400/15 text-red-300' : 'text-white/35'}`}><Grid2X2 size={15} className="mx-auto"/></button>
          </div>
        </div>

        <div className="ak5-card flex items-center gap-3 rounded-[18px] px-4 py-3">
          <Search size={17} className="shrink-0 text-white/30" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por ID, vehículo, ECU o servicio..." className="w-full bg-transparent text-sm outline-none placeholder:text-white/22" />
        </div>

        {loading ? (
          <div className="ak5-card p-8 text-white/35">Cargando pedidos...</div>
        ) : filtered.length === 0 ? (
          <div className="ak5-card p-10 text-center text-white/35">No hay pedidos que coincidan con los filtros.</div>
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
