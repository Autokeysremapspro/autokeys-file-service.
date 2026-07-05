'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Briefcase, Calendar, Download, Search } from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'
import AKCard from '@/components/ak/AKCard'
import AKStatCard from '@/components/ak/AKStatCard'
import { getMisPedidos, type FileServicePedido, formatEstado } from '@/lib/services/pedidos'

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<FileServicePedido[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMisPedidos()
      .then(setPedidos)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pedidos
    return pedidos.filter((pedido) => [pedido.numero, pedido.ori_nombre, pedido.ecu, pedido.hw, pedido.sw, pedido.marca, pedido.modelo, pedido.motor, ...(pedido.servicios || [])].some((value) => (value || '').toLowerCase().includes(q)))
  }, [pedidos, query])

  const abiertos = pedidos.filter((p) => p.estado !== 'finalizado' && p.estado !== 'cancelado').length
  const finalizados = pedidos.filter((p) => p.estado === 'finalizado').length

  return (
    <main className="ak-noise flex min-h-screen">
      <AKSidebar />
      <section className="flex-1 p-4 lg:p-8">
        <div className="mb-7">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--ak-glow)]">Orders</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Mis trabajos</h1>
          <p className="mt-2 text-sm text-white/40">Consulta estados, archivos ORI/MOD, servicios y timeline de cada pedido.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <AKStatCard label="Total" value={String(pedidos.length)} helper="Pedidos creados" tone="red" />
          <AKStatCard label="Abiertos" value={String(abiertos)} helper="Pendientes / proceso" tone="orange" />
          <AKStatCard label="Finalizados" value={String(finalizados)} helper="Listos para descarga" tone="green" />
        </div>

        <AKCard className="mt-6 p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
            <Search size={18} className="text-white/35" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por pedido, ECU, HW, SW, matrícula, servicio..." className="w-full bg-transparent text-sm outline-none placeholder:text-white/25" />
          </div>
        </AKCard>

        <div className="mt-6 space-y-3">
          {loading ? (
            <AKCard className="p-8 text-white/35">Cargando pedidos...</AKCard>
          ) : filtered.length === 0 ? (
            <AKCard className="p-8 text-center text-white/35">No hay pedidos que coincidan con la búsqueda.</AKCard>
          ) : filtered.map((pedido) => (
            <Link key={pedido.id} href={`/pedidos/${pedido.id}`} className="group block rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 transition hover:border-[var(--ak-red)]/40 hover:bg-white/[0.055]">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[var(--ak-red)]/25 bg-[var(--ak-red)]/10 px-3 py-1 text-xs font-black text-[var(--ak-glow)]">{pedido.numero || 'FS'}</span>
                    <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-black text-white/55">{formatEstado(pedido.estado)}</span>
                    {pedido.prioridad === 'urgente' && <span className="rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-black text-orange-300">Urgente</span>}
                  </div>
                  <h2 className="mt-3 text-xl font-black">{pedido.ecu || 'ECU pendiente'} · {pedido.ori_nombre || 'Sin ORI'}</h2>
                  <p className="mt-1 text-sm text-white/35">{[pedido.marca, pedido.modelo, pedido.motor, pedido.cv].filter(Boolean).join(' · ') || 'Sin datos de vehículo'}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(pedido.servicios || []).map((servicio) => <span key={servicio} className="rounded-full bg-white/[0.05] px-3 py-1 text-xs font-bold text-white/50">{servicio}</span>)}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-white/35">
                  <div className="hidden items-center gap-2 md:flex"><Calendar size={16} /> {pedido.created_at ? new Date(pedido.created_at).toLocaleDateString('es-ES') : '—'}</div>
                  <div className="hidden items-center gap-2 md:flex"><Download size={16} /> {pedido.mod_path ? 'MOD listo' : 'Esperando MOD'}</div>
                  <ArrowRight size={20} className="text-white/25 transition group-hover:text-[var(--ak-glow)]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
