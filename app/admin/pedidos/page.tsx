'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Clock, Download, FileUp, Search, XCircle } from 'lucide-react'
import AppShell from '@/components/AppShell'
import { getPedidosAdmin, type PedidoAdmin } from '@/lib/file-service-admin'

const estados = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'finalizado', label: 'Finalizados' },
  { value: 'cancelado', label: 'Cancelados' },
]

function estadoClass(estado?: string | null) {
  if (estado === 'finalizado') return 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
  if (estado === 'en_proceso') return 'text-blue-300 border-blue-500/30 bg-blue-500/10'
  if (estado === 'cancelado') return 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10'
  return 'text-yellow-300 border-yellow-500/30 bg-yellow-500/10'
}

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([])
  const [estado, setEstado] = useState('todos')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      setPedidos(await getPedidosAdmin(estado))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [estado])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pedidos
    return pedidos.filter((p) => [
      p.numero,
      p.marca,
      p.modelo,
      p.motor,
      p.ecu,
      p.hw,
      p.sw,
      p.ori_nombre,
      (p.servicios || []).join(' '),
    ].some((v) => (v || '').toLowerCase().includes(q)))
  }, [pedidos, query])

  const counts = {
    pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
    proceso: pedidos.filter(p => p.estado === 'en_proceso').length,
    finalizados: pedidos.filter(p => p.estado === 'finalizado').length,
    urgentes: pedidos.filter(p => p.urgente).length,
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-red-400">Administración</p>
            <h1 className="mt-2 text-3xl font-black">Pedidos File Service</h1>
            <p className="mt-1 text-zinc-500">Gestiona solicitudes, ORI, MOD, estados, urgencias y notas internas.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="card p-5"><Clock className="text-yellow-300" /><p className="mt-3 text-3xl font-black">{counts.pendientes}</p><p className="text-zinc-500">Pendientes</p></div>
          <div className="card p-5"><FileUp className="text-blue-300" /><p className="mt-3 text-3xl font-black">{counts.proceso}</p><p className="text-zinc-500">En proceso</p></div>
          <div className="card p-5"><CheckCircle2 className="text-emerald-300" /><p className="mt-3 text-3xl font-black">{counts.finalizados}</p><p className="text-zinc-500">Finalizados</p></div>
          <div className="card p-5"><AlertTriangle className="text-red-300" /><p className="mt-3 text-3xl font-black">{counts.urgentes}</p><p className="text-zinc-500">Urgentes</p></div>
        </div>

        <div className="card p-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-2xl bg-black/20 px-4 py-3">
            <Search size={18} className="text-zinc-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por número, ECU, HW, SW, archivo, servicio..." className="w-full bg-transparent outline-none" />
          </div>
          <div className="flex flex-wrap gap-2">
            {estados.map((item) => (
              <button key={item.value} onClick={() => setEstado(item.value)} className={`rounded-2xl px-4 py-2 text-sm font-black ${estado === item.value ? 'bg-red-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="card p-8 text-zinc-500">Cargando pedidos...</div>
        ) : filtered.length === 0 ? (
          <div className="card p-8 text-zinc-500">No hay pedidos que coincidan.</div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filtered.map((pedido) => (
              <Link key={pedido.id} href={`/admin/pedidos/${pedido.id}`} className="card block p-5 transition hover:-translate-y-0.5 hover:border-red-500/30">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black">{pedido.numero || 'FS sin número'}</span>
                      {pedido.urgente && <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-black text-white">URGENTE</span>}
                    </div>
                    <p className="mt-1 text-zinc-500">{[pedido.marca, pedido.modelo, pedido.motor].filter(Boolean).join(' · ') || 'Datos de vehículo pendientes'}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${estadoClass(pedido.estado)}`}>{pedido.estado || 'pendiente'}</span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-black/20 p-3"><p className="text-xs uppercase text-zinc-500">ECU / HW / SW</p><p className="mt-1 font-bold">{pedido.ecu || 'ECU —'} · {pedido.hw || 'HW —'} · {pedido.sw || 'SW —'}</p></div>
                  <div className="rounded-2xl bg-black/20 p-3"><p className="text-xs uppercase text-zinc-500">Servicios</p><p className="mt-1 font-bold">{(pedido.servicios || []).join(', ') || '—'}</p></div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500"><Download size={15} /> {pedido.ori_nombre || 'ORI pendiente'} {pedido.mod_nombre ? `→ ${pedido.mod_nombre}` : ''}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
