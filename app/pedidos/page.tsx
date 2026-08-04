'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, Download, Grid2X2, List, Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import AKPageShell from '@/components/ak/AKPageShell'
import { getMisPedidos, type FileServicePedido, formatEstado } from '@/lib/services/pedidos'

function statusClass(estado?: string | null) {
  if (estado === 'finalizado') return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
  if (estado === 'en_proceso') return 'border-amber-400/20 bg-amber-400/10 text-amber-300'
  if (estado === 'cancelado') return 'border-red-400/20 bg-red-400/10 text-red-300'
  return 'border-sky-400/20 bg-sky-400/10 text-sky-300'
}

function progress(estado?: string | null) {
  if (estado === 'finalizado') return 100
  if (estado === 'en_proceso') return 62
  if (estado === 'cancelado') return 8
  return 24
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<FileServicePedido[]>([])
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'cards' | 'compact'>('cards')
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
    <AKPageShell
      title="Mis trabajos"
      subtitle="Controla cada archivo como un expediente vivo: estado, precio, revisiones, versiones y conversación técnica."
      eyebrow="Workspace · Pedidos"
      actions={<Link href="/nuevo-pedido" className="ak-v6-primary px-5 py-3 text-xs"><Sparkles size={16}/> Crear nuevo trabajo</Link>}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[['En curso', abiertos, 'Trabajos activos'], ['Esperando', esperando, 'Pendientes de análisis'], ['Finalizados', finalizados, 'Listos y archivados']].map(([label, value, helper]) => (
          <div key={String(label)} className="ak-v6-panel p-5">
            <div className="text-[10px] font-black uppercase tracking-[.22em] text-white/28">{label}</div>
            <div className="mt-3 text-4xl font-black tracking-tight">{value}</div>
            <div className="mt-1 text-xs text-white/35">{helper}</div>
          </div>
        ))}
      </div>

      <div className="ak-v6-panel mt-5 flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
          <Search size={18} className="text-white/30" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pedido, vehículo, ECU, HW, SW o servicio..." className="w-full bg-transparent text-sm outline-none placeholder:text-white/22" />
        </div>
        <button className="flex items-center justify-center gap-2 rounded-2xl border border-white/8 bg-white/[.025] px-4 py-3 text-xs font-bold text-white/45"><SlidersHorizontal size={16}/> Filtros</button>
        <div className="ak-v6-view-switch">
          <button data-active={view === 'cards'} onClick={() => setView('cards')}><Grid2X2 size={15}/></button>
          <button data-active={view === 'compact'} onClick={() => setView('compact')}><List size={15}/></button>
        </div>
      </div>

      <div className={`mt-5 ${view === 'cards' ? 'grid gap-4 xl:grid-cols-2' : 'space-y-3'}`}>
        {loading ? (
          <div className="ak-v6-panel p-8 text-white/35">Cargando trabajos...</div>
        ) : filtered.length === 0 ? (
          <div className="ak-v6-panel p-10 text-center text-white/35">No hay trabajos que coincidan con la búsqueda.</div>
        ) : filtered.map((pedido) => (
          <Link key={pedido.id} href={`/pedidos/${pedido.id}`} className="ak-v6-panel group block p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#e5a05d]/25 bg-[#e5a05d]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#ffd09a]">{pedido.numero || 'FS'}</span>
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${statusClass(pedido.estado)}`}>{formatEstado(pedido.estado)}</span>
                  {pedido.prioridad === 'urgente' && <span className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-[10px] font-black uppercase text-red-300">Urgente</span>}
                </div>
                <h2 className="mt-4 truncate text-2xl font-black tracking-tight">{pedido.ecu || 'ECU pendiente'}</h2>
                <p className="mt-1 truncate text-sm text-white/38">{[pedido.marca, pedido.modelo, pedido.motor, pedido.cv].filter(Boolean).join(' · ') || pedido.ori_nombre || 'Vehículo pendiente'}</p>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/8 bg-white/[.025] text-white/28 transition group-hover:border-[#e5a05d]/25 group-hover:text-[#ffd09a]"><ArrowRight size={19}/></span>
            </div>

            <div className="mt-5 ak-v6-status-track"><span style={{ width: `${progress(pedido.estado)}%` }} /></div>

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
    </AKPageShell>
  )
}
