'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Download, FileDown, FolderOpen, ListRestart, RefreshCcw, Search } from 'lucide-react'
import AKPageShell from '@/components/ak/AKPageShell'
import AKCard from '@/components/ak/AKCard'
import CustomSelect from '@/components/ak/CustomSelect'
import { descargarArchivo, formatBytes, formatEstado, getMisPedidos, type FileServicePedido, type PedidoEstado } from '@/lib/services/pedidos'

function csvEscape(value: string) {
  const needsQuotes = /[",\n;]/.test(value)
  return needsQuotes ? `"${value.replace(/"/g, '""')}"` : value
}

const ESTADOS: { value: PedidoEstado | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'cancelado', label: 'Cancelado' },
]

export default function DescargasPage() {
  const [pedidos, setPedidos] = useState<FileServicePedido[]>([])
  const [query, setQuery] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('todos')
  const [servicioFiltro, setServicioFiltro] = useState('todos')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  function load() {
    setLoading(true)
    getMisPedidos().then(setPedidos).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const serviciosDisponibles = useMemo(() => {
    const set = new Set<string>()
    for (const p of pedidos) for (const s of p.servicios || []) set.add(s)
    return Array.from(set).sort()
  }, [pedidos])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const desde = fechaDesde ? new Date(fechaDesde).getTime() : null
    const hasta = fechaHasta ? new Date(fechaHasta).getTime() + 24 * 3600 * 1000 - 1 : null
    return pedidos.filter((p) => {
      if (estadoFiltro !== 'todos' && p.estado !== estadoFiltro) return false
      if (servicioFiltro !== 'todos' && !(p.servicios || []).includes(servicioFiltro)) return false
      if (desde || hasta) {
        const t = p.created_at ? new Date(p.created_at).getTime() : null
        if (!t) return false
        if (desde && t < desde) return false
        if (hasta && t > hasta) return false
      }
      if (q) {
        const hit = [p.numero, p.mod_nombre, p.ori_nombre, p.marca, p.modelo, p.ecu, p.hw, p.sw, ...(p.servicios || [])].some((v) => (v || '').toLowerCase().includes(q))
        if (!hit) return false
      }
      return true
    })
  }, [pedidos, query, estadoFiltro, servicioFiltro, fechaDesde, fechaHasta])

  const entregados = pedidos.filter((p) => p.mod_path).length
  const completados = pedidos.filter((p) => p.estado === 'finalizado').length
  const enProceso = pedidos.filter((p) => p.estado === 'en_proceso').length
  const almacenamiento = pedidos.reduce((sum, p) => sum + (p.ori_size || 0), 0)

  const actividadMensual = useMemo(() => {
    const months = 6
    const now = new Date()
    const buckets = Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1)
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('es-ES', { month: 'short' }), count: 0 }
    })
    for (const p of pedidos) {
      if (!p.created_at) continue
      const d = new Date(p.created_at)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      const b = buckets.find((x) => x.key === key)
      if (b) b.count += 1
    }
    return buckets
  }, [pedidos])
  const maxMes = Math.max(1, ...actividadMensual.map((b) => b.count))

  async function download(pedido: FileServicePedido) {
    if (!pedido.mod_bucket || !pedido.mod_path) return
    setDownloadingId(pedido.id)
    try {
      const blob = await descargarArchivo(pedido.mod_bucket, pedido.mod_path)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = pedido.mod_nombre || `MOD-${pedido.numero || pedido.id}.bin`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloadingId(null)
    }
  }

  function limpiarFiltros() {
    setQuery('')
    setEstadoFiltro('todos')
    setServicioFiltro('todos')
    setFechaDesde('')
    setFechaHasta('')
  }

  function exportarCsv() {
    const headers = ['Pedido', 'Vehículo', 'ECU', 'Servicios', 'Estado', 'Fecha', 'Archivo entregado']
    const rows = filtered.map((p) => [
      p.numero || p.id,
      [p.marca, p.modelo].filter(Boolean).join(' '),
      p.ecu || '',
      (p.servicios || []).join(' + '),
      formatEstado(p.estado),
      p.created_at ? new Date(p.created_at).toLocaleDateString('es-ES') : '',
      p.mod_nombre || (p.mod_path ? 'Disponible' : 'Pendiente'),
    ])
    const csv = [headers, ...rows].map((row) => row.map((c) => csvEscape(String(c))).join(';')).join('\n')
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historial-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AKPageShell title="Versiones" subtitle="Consulta y gestiona el historial de archivos y servicios entregados." eyebrow="Library">
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Archivos entregados" value={entregados} sub="Versiones MOD disponibles" tone="red" />
            <StatCard label="Completados" value={completados} sub="Pedidos finalizados" tone="green" />
            <StatCard label="En proceso" value={enProceso} sub="Trabajando ahora mismo" tone="blue" />
            <StatCard label="Almacenamiento" value={formatBytes(almacenamiento)} sub="Tamaño de archivos ORI" tone="amber" />
          </div>

          <AKCard className="p-5 sm:p-6">
            <div className="flex items-center justify-between"><h3 className="text-lg font-black">Actividad mensual</h3></div>
            <div className="mt-5 flex items-end gap-3" style={{ height: 140 }}>
              {actividadMensual.map((b) => (
                <div key={b.key} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end justify-center">
                    <div className="w-full max-w-[38px] rounded-t-lg bg-gradient-to-t from-[#b8090f] to-[#ef1018] shadow-[0_0_14px_rgba(239,16,24,.35)]" style={{ height: `${Math.max(6, (b.count / maxMes) * 100)}%` }} title={`${b.count} pedidos`} />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-white/35">{b.label}</span>
                </div>
              ))}
            </div>
          </AKCard>

          <AKCard className="p-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/45">
              <Search size={18} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por pedido, ECU, vehículo, HW, SW..." className="w-full bg-transparent outline-none placeholder:text-white/25" />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <CustomSelect value={estadoFiltro} onChange={setEstadoFiltro} options={ESTADOS.map((e) => ({ value: e.value, label: e.label }))} />
              <CustomSelect value={servicioFiltro} onChange={setServicioFiltro} options={[{ value: 'todos', label: 'Todos los servicios' }, ...serviciosDisponibles.map((s) => ({ value: s, label: s }))]} />
              <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/70 outline-none" />
              <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/70 outline-none" />
            </div>
          </AKCard>

          <AKCard className="overflow-hidden">
            {loading ? (
              <div className="p-8 text-white/45">Cargando historial...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-white/45">No hay pedidos que coincidan con los filtros.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-[.16em] text-white/32">
                      <th className="px-5 py-4">Pedido</th>
                      <th className="px-5 py-4">Vehículo</th>
                      <th className="px-5 py-4">Servicio</th>
                      <th className="px-5 py-4">Estado</th>
                      <th className="px-5 py-4">Fecha</th>
                      <th className="px-5 py-4 text-right">Archivo entregado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filtered.map((pedido) => (
                      <tr key={pedido.id} className="transition hover:bg-white/[.02]">
                        <td className="px-5 py-4"><span className="rounded-full border border-red-400/25 bg-red-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-red-300">{pedido.numero || 'FS'}</span></td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-white/85">{[pedido.marca, pedido.modelo].filter(Boolean).join(' ') || pedido.ecu || 'Pendiente'}</div>
                          <div className="text-xs text-white/32">{formatBytes(pedido.ori_size)}</div>
                        </td>
                        <td className="px-5 py-4 text-white/55">{(pedido.servicios || []).slice(0, 2).join(' + ') || '—'}</td>
                        <td className="px-5 py-4"><span className="rounded-full border border-white/10 bg-white/[.03] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white/60">{formatEstado(pedido.estado)}</span></td>
                        <td className="px-5 py-4 text-xs text-white/40">{pedido.created_at ? new Date(pedido.created_at).toLocaleDateString('es-ES') : '—'}</td>
                        <td className="px-5 py-4 text-right">
                          {pedido.mod_path ? (
                            <button onClick={() => download(pedido)} disabled={downloadingId === pedido.id} className="inline-flex items-center gap-2 rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-400/20 disabled:opacity-50"><Download size={14}/> {downloadingId === pedido.id ? 'Descargando...' : 'Descargar'}</button>
                          ) : (
                            <span className="text-xs text-white/25">En preparación</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AKCard>
        </div>

        <aside className="space-y-4">
          <AKCard className="p-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-white/60">Acciones rápidas</h3>
            <div className="mt-4 space-y-2">
              <button onClick={exportarCsv} className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-left transition hover:border-red-400/25">
                <FileDown size={17} className="shrink-0 text-red-300"/>
                <div><div className="text-sm font-bold">Exportar historial</div><div className="text-xs text-white/35">Descargar como CSV</div></div>
              </button>
              <button onClick={limpiarFiltros} className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-left transition hover:border-white/20">
                <ListRestart size={17} className="shrink-0 text-white/50"/>
                <div><div className="text-sm font-bold">Limpiar filtros</div><div className="text-xs text-white/35">Restablecer todos los filtros</div></div>
              </button>
              <button onClick={load} className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-left transition hover:border-white/20">
                <RefreshCcw size={17} className="shrink-0 text-white/50"/>
                <div><div className="text-sm font-bold">Actualizar historial</div><div className="text-xs text-white/35">Recargar datos</div></div>
              </button>
            </div>
          </AKCard>
          <AKCard className="p-5">
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white/60"><FolderOpen size={16} className="text-blue-300"/> Resumen</div>
            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between"><span className="text-white/40">Mostrando</span><span className="font-bold text-white/75">{filtered.length} de {pedidos.length}</span></div>
              <div className="flex items-center gap-2 text-emerald-300"><CheckCircle2 size={14}/> Datos sincronizados con AK Core</div>
            </div>
          </AKCard>
        </aside>
      </div>
    </AKPageShell>
  )
}

function StatCard({ label, value, sub, tone }: { label: string; value: any; sub: string; tone: 'red' | 'green' | 'blue' | 'amber' }) {
  const glow: any = { red: 'rgba(239,16,24,.14)', green: 'rgba(52,211,153,.14)', blue: 'rgba(59,130,246,.14)', amber: 'rgba(245,158,11,.14)' }
  return (
    <AKCard className="relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full" style={{ background: `radial-gradient(circle,${glow[tone]},transparent 70%)` }} />
      <div className="relative text-[10px] font-black uppercase tracking-[.2em] text-white/28">{label}</div>
      <div className="relative mt-3 text-3xl font-black tracking-tight">{value}</div>
      <div className="relative mt-1 text-xs text-white/35">{sub}</div>
    </AKCard>
  )
}
