'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, FileArchive, Loader2, ShieldCheck } from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import AKTimeline from '@/components/ak/AKTimeline'
import AKChat from '@/components/ak/AKChat'
import { descargarArchivo, formatBytes, formatEstado, getPedidoById, type FileServicePedido } from '@/lib/services/pedidos'

export default function PedidoDetallePage({ params }: { params: { id: string } }) {
  const [pedido, setPedido] = useState<FileServicePedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    getPedidoById(params.id)
      .then(setPedido)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  async function download(bucket?: string | null, path?: string | null, name?: string | null) {
    if (!bucket || !path) return
    setDownloading(path)
    try {
      const blob = await descargarArchivo(bucket, path)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = name || 'archivo.bin'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return <main className="ak-noise flex min-h-screen"><AKSidebar /><section className="flex-1 p-8"><AKCard className="p-8 text-white/35"><Loader2 className="mr-2 inline animate-spin" /> Cargando pedido...</AKCard></section></main>
  }

  if (!pedido) {
    return <main className="ak-noise flex min-h-screen"><AKSidebar /><section className="flex-1 p-8"><AKCard className="p-8 text-white/35">Pedido no encontrado.</AKCard></section></main>
  }

  return (
    <main className="ak-noise flex min-h-screen">
      <AKSidebar />
      <section className="flex-1 p-4 lg:p-8">
        <Link href="/pedidos" className="mb-5 inline-flex items-center gap-2 text-sm font-black text-white/45 hover:text-white"><ArrowLeft size={17} /> Volver a pedidos</Link>

        <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--ak-glow)]">Order Workspace</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">{pedido.numero || 'Pedido File Service'}</h1>
            <p className="mt-2 text-sm text-white/40">{pedido.ecu || 'ECU pendiente'} · {formatEstado(pedido.estado)}</p>
          </div>
          <div className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm font-black text-white/55">{formatEstado(pedido.estado)}</div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <section className="space-y-6">
            <AKCard className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-green)]">ECU Identified</p>
                  <h2 className="mt-2 text-3xl font-black">{pedido.ecu || 'Bosch EDC17C64'}</h2>
                  <p className="mt-1 text-sm text-white/40">{[pedido.marca, pedido.modelo, pedido.motor, pedido.cv].filter(Boolean).join(' · ') || 'Vehículo pendiente'}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ak-green)]/10 text-[var(--ak-green)]"><ShieldCheck size={26} /></div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-4">
                <Info label="HW" value={pedido.hw || '—'} />
                <Info label="SW" value={pedido.sw || '—'} />
                <Info label="Archivo" value={pedido.ori_nombre || '—'} />
                <Info label="Precio" value={`${pedido.precio || 0} €`} />
              </div>
            </AKCard>

            <AKCard className="p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-glow)]">Servicios</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(pedido.servicios || []).length === 0 ? <span className="text-sm text-white/35">Sin servicios seleccionados.</span> : (pedido.servicios || []).map((servicio) => <span key={servicio} className="rounded-full border border-[var(--ak-red)]/25 bg-[var(--ak-red)]/10 px-4 py-2 text-sm font-black text-[var(--ak-glow)]">{servicio}</span>)}
              </div>
              {pedido.observaciones && <div className="mt-5 rounded-2xl bg-black/25 p-4 text-sm text-white/45">{pedido.observaciones}</div>}
            </AKCard>

            <AKCard className="p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Archivos</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <FileBox title="ORI" name={pedido.ori_nombre} size={formatBytes(pedido.ori_size)} ready={!!pedido.ori_path} loading={downloading === pedido.ori_path} onClick={() => download(pedido.ori_bucket, pedido.ori_path, pedido.ori_nombre)} />
                <FileBox title="MOD" name={pedido.mod_nombre} size={pedido.mod_path ? 'Listo' : 'Pendiente'} ready={!!pedido.mod_path} loading={downloading === pedido.mod_path} onClick={() => download(pedido.mod_bucket, pedido.mod_path, pedido.mod_nombre)} />
              </div>
            </AKCard>
          </section>

          <aside className="space-y-6">
            <AKTimeline estado={pedido.estado} />
            <AKChat pedidoId={pedido.id} autorTipo="cliente" compact />
          </aside>
        </div>
      </section>
    </main>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/30">{label}</p><p className="mt-1 truncate text-sm font-black">{value}</p></div>
}

function FileBox({ title, name, size, ready, loading, onClick }: { title: string; name?: string | null; size?: string; ready: boolean; loading?: boolean; onClick: () => void }) {
  return (
    <button disabled={!ready || loading} onClick={onClick} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 text-left transition hover:border-[var(--ak-red)]/40 disabled:cursor-not-allowed disabled:opacity-50">
      <FileArchive className="text-[var(--ak-glow)]" size={24} />
      <div className="mt-3 text-lg font-black">{title}</div>
      <div className="mt-1 truncate text-sm text-white/35">{name || 'No disponible'}</div>
      <div className="mt-4 flex items-center justify-between text-xs font-black uppercase tracking-[0.18em] text-white/35"><span>{size || '—'}</span>{ready && (loading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />)}</div>
    </button>
  )
}
