'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Download, FileText, Plus, RefreshCw, Search } from 'lucide-react'
import AppShell from '@/components/AppShell'
import { descargarArchivo, formatEstado, getMisPedidos, type FileServicePedido } from '@/lib/services/pedidos'

function formatDate(date?: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
}

function estadoClass(estado: string) {
  if (estado === 'finalizado') return 'bg-emerald-600/15 text-emerald-300 border-emerald-500/25'
  if (estado === 'en_proceso') return 'bg-blue-600/15 text-blue-300 border-blue-500/25'
  if (estado === 'cancelado') return 'bg-zinc-600/15 text-zinc-300 border-zinc-500/25'
  return 'bg-yellow-600/15 text-yellow-300 border-yellow-500/25'
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<FileServicePedido[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  async function load() {
    setLoading(true)
    try {
      setPedidos(await getMisPedidos())
    } catch (error: any) {
      toast.error(error?.message || 'No se pudieron cargar los pedidos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pedidos
    return pedidos.filter((p) => [p.numero, p.marca, p.modelo, p.ecu, p.hw, p.sw, p.ori_nombre, ...(p.servicios || [])].some((value) => (value || '').toLowerCase().includes(q)))
  }, [pedidos, query])

  async function download(bucket?: string | null, path?: string | null, name?: string | null) {
    if (!bucket || !path) return toast.error('Archivo no disponible')
    try {
      const blob = await descargarArchivo(bucket, path)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name || 'archivo'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo descargar')
    }
  }

  const pendientes = pedidos.filter((p) => p.estado === 'pendiente').length
  const proceso = pedidos.filter((p) => p.estado === 'en_proceso').length
  const finalizados = pedidos.filter((p) => p.estado === 'finalizado').length

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-red-400">
              <FileText size={14} /> Mis pedidos
            </div>
            <h1 className="text-3xl font-black tracking-tight">Pedidos File Service</h1>
            <p className="mt-1 text-zinc-500">Estado, archivos ORI/MOD y servicios solicitados.</p>
          </div>
          <Link href="/nuevo-pedido" className="btn btn-red inline-flex items-center justify-center gap-2"><Plus size={18} /> Nuevo pedido</Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Total" value={pedidos.length} />
          <Stat label="Pendientes" value={pendientes} />
          <Stat label="En proceso" value={proceso} />
          <Stat label="Finalizados" value={finalizados} />
        </div>

        <div className="card flex items-center gap-3 p-4">
          <Search size={20} className="text-zinc-500" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por FS, ECU, HW, SW, archivo o servicio..." className="w-full border-0 bg-transparent p-0 outline-none" />
          <button onClick={load} className="btn btn-dark inline-flex items-center gap-2"><RefreshCw size={16} /> Actualizar</button>
        </div>

        {loading ? (
          <div className="card p-8 text-zinc-500">Cargando pedidos...</div>
        ) : filtered.length === 0 ? (
          <div className="card p-8 text-zinc-500">No hay pedidos todavía.</div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((pedido) => (
              <div key={pedido.id} className="card p-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-red-300">{pedido.numero || 'FS sin número'}</span>
                      <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${estadoClass(pedido.estado)}`}>{formatEstado(pedido.estado)}</span>
                    </div>
                    <h3 className="mt-2 text-xl font-black">{[pedido.marca, pedido.modelo, pedido.ecu].filter(Boolean).join(' · ') || 'Pedido rápido'}</h3>
                    <p className="mt-1 text-sm text-zinc-500">Creado {formatDate(pedido.created_at)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => download(pedido.ori_bucket, pedido.ori_path, pedido.ori_nombre)} className="btn btn-dark inline-flex items-center gap-2 text-sm"><Download size={15} /> ORI</button>
                    <button onClick={() => download(pedido.mod_bucket, pedido.mod_path, pedido.mod_nombre)} disabled={!pedido.mod_path} className="btn btn-red inline-flex items-center gap-2 text-sm disabled:opacity-40"><Download size={15} /> MOD</button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(pedido.servicios || []).map((s) => <span key={s} className="rounded-full bg-red-600/15 px-3 py-1 text-xs font-bold text-red-300">{s}</span>)}
                </div>

                <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                  <Info label="ORI" value={pedido.ori_nombre || '—'} />
                  <Info label="HW / SW" value={[pedido.hw, pedido.sw].filter(Boolean).join(' / ') || '—'} />
                  <Info label="Observaciones" value={pedido.observaciones || '—'} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="card p-4"><p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-1 text-3xl font-black">{value}</p></div>
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-black/25 p-3"><div className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</div><div className="mt-1 truncate font-bold">{value}</div></div>
}
