'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, FileArchive, Loader2, ShieldCheck, MessageSquare, History, Layers3, Activity } from 'lucide-react'
import AKPageShell from '@/components/ak/AKPageShell'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import AKTimeline from '@/components/ak/AKTimeline'
import AKChat from '@/components/ak/AKChat'
import { descargarArchivo, formatBytes, formatEstado, getPedidoById, type FileServicePedido } from '@/lib/services/pedidos'
import { supabase } from '@/lib/supabase'

export default function PedidoDetallePage({ params }: { params: { id: string } }) {
  const [pedido, setPedido] = useState<FileServicePedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [justUpdated, setJustUpdated] = useState(false)
  const [activeTab, setActiveTab] = useState<'resumen' | 'versiones' | 'conversacion' | 'historial'>('resumen')

  useEffect(() => {
    getPedidoById(params.id)
      .then(setPedido)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  // Sin esto, el distribuidor tenía que refrescar la página a mano para
  // enterarse de que su pedido cambió de estado — justo el momento en el
  // que más pendiente está de la pantalla. Ahora se entera al instante.
  useEffect(() => {
    const channel = supabase
      .channel(`pedido-${params.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'file_service_pedidos', filter: `id=eq.${params.id}` },
        (payload) => {
          setPedido((current) => (current ? { ...current, ...(payload.new as Partial<FileServicePedido>) } : current))
          setJustUpdated(true)
          setTimeout(() => setJustUpdated(false), 4000)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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
    return <AKPageShell title="Cargando trabajo" eyebrow="Workspace"><AKCard className="p-8 text-white/35"><Loader2 className="mr-2 inline animate-spin" /> Cargando pedido...</AKCard></AKPageShell>
  }

  if (!pedido) {
    return <AKPageShell title="Pedido no encontrado" eyebrow="Workspace"><AKCard className="p-8 text-white/35">Pedido no encontrado.</AKCard></AKPageShell>
  }

  return (
    <AKPageShell
      title={pedido.numero || 'Pedido File Service'}
      subtitle={`${pedido.ecu || 'ECU pendiente'} · ${[pedido.marca, pedido.modelo, pedido.motor].filter(Boolean).join(' ') || 'Vehículo pendiente'}`}
      eyebrow="Order Workspace"
      actions={
        <div className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors ${justUpdated ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-black/25 text-white/55'}`}>
          {justUpdated && <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />}
          {formatEstado(pedido.estado)}
        </div>
      }
    >
      <Link href="/pedidos" className="mb-5 inline-flex items-center gap-2 text-sm font-black text-white/40 transition hover:text-white"><ArrowLeft size={17} /> Volver a trabajos</Link>

      <div className="ak-v6-panel mb-6 p-4 md:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Info label="ECU" value={pedido.ecu || 'No identificada'} />
            <Info label="HW" value={pedido.hw || '—'} />
            <Info label="SW" value={pedido.sw || '—'} />
            <Info label="Precio" value={`${pedido.precio || 0} €`} />
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[.055] px-4 py-3 text-emerald-300">
            <Activity size={18}/><div><div className="text-[10px] font-black uppercase tracking-wider">Estado vivo</div><div className="text-xs text-emerald-200/65">Actualización en tiempo real</div></div>
          </div>
        </div>
      </div>

      <div className="ak-v6-tabs mb-6">
        <button onClick={() => setActiveTab('resumen')} className={`ak-v6-tab ${activeTab === 'resumen' ? 'ak-v6-tab-active' : ''}`}><ShieldCheck size={14} className="mr-2 inline"/>Resumen</button>
        <button onClick={() => setActiveTab('versiones')} className={`ak-v6-tab ${activeTab === 'versiones' ? 'ak-v6-tab-active' : ''}`}><Layers3 size={14} className="mr-2 inline"/>Versiones</button>
        <button onClick={() => setActiveTab('conversacion')} className={`ak-v6-tab ${activeTab === 'conversacion' ? 'ak-v6-tab-active' : ''}`}><MessageSquare size={14} className="mr-2 inline"/>Conversación</button>
        <button onClick={() => setActiveTab('historial')} className={`ak-v6-tab ${activeTab === 'historial' ? 'ak-v6-tab-active' : ''}`}><History size={14} className="mr-2 inline"/>Historial</button>
      </div>

      {activeTab === 'resumen' && (
        <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
          <section className="space-y-6">
            <div className="ak-v6-panel p-6">
              <div className="flex items-start justify-between gap-4">
                <div><div className="ak-v6-kicker">Ficha técnica</div><h2 className="mt-3 text-3xl font-black">{pedido.ecu || 'ECU pendiente'}</h2><p className="mt-2 text-sm text-white/38">{[pedido.marca, pedido.modelo, pedido.motor, pedido.cv].filter(Boolean).join(' · ') || 'Datos del vehículo pendientes'}</p></div>
                <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[#e5a05d]/20 bg-[#e5a05d]/10 text-[#ffd09a]"><ShieldCheck size={26}/></div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">{(pedido.servicios || []).map((servicio) => <span key={servicio} className="rounded-full border border-[#e5a05d]/18 bg-[#e5a05d]/8 px-4 py-2 text-xs font-black text-[#ffd09a]">{servicio}</span>)}</div>
              {pedido.observaciones && <div className="mt-6 rounded-2xl border border-white/7 bg-black/20 p-4 text-sm leading-6 text-white/45">{pedido.observaciones}</div>}
            </div>
            <div className="ak-v6-panel p-6">
              <div className="ak-v6-kicker">Archivos del trabajo</div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <FileBox title="Archivo original" name={pedido.ori_nombre} size={formatBytes(pedido.ori_size)} ready={!!pedido.ori_path} loading={downloading === pedido.ori_path} onClick={() => download(pedido.ori_bucket, pedido.ori_path, pedido.ori_nombre)} />
                <FileBox title="Última versión" name={pedido.mod_nombre} size={pedido.mod_path ? 'Disponible' : 'En preparación'} ready={!!pedido.mod_path} loading={downloading === pedido.mod_path} onClick={() => download(pedido.mod_bucket, pedido.mod_path, pedido.mod_nombre)} />
              </div>
            </div>
          </section>
          <aside className="space-y-6"><AKTimeline estado={pedido.estado}/><AKChat pedidoId={pedido.id} autorTipo="cliente" compact/></aside>
        </div>
      )}

      {activeTab === 'versiones' && (
        <div className="ak-v6-panel p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><div className="ak-v6-kicker">Control de revisiones</div><h2 className="mt-2 text-2xl font-black">Versiones entregadas</h2><p className="mt-2 text-sm text-white/38">Cada revisión queda vinculada al pedido y nunca sustituye el historial anterior.</p></div></div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <FileBox title="ORI · Base" name={pedido.ori_nombre} size={formatBytes(pedido.ori_size)} ready={!!pedido.ori_path} loading={downloading === pedido.ori_path} onClick={() => download(pedido.ori_bucket, pedido.ori_path, pedido.ori_nombre)} />
            <FileBox title={pedido.mod_path ? 'V1 · Última entrega' : 'V1 · Pendiente'} name={pedido.mod_nombre} size={pedido.mod_path ? 'Versión disponible' : 'El laboratorio está trabajando'} ready={!!pedido.mod_path} loading={downloading === pedido.mod_path} onClick={() => download(pedido.mod_bucket, pedido.mod_path, pedido.mod_nombre)} />
          </div>
        </div>
      )}

      {activeTab === 'conversacion' && <div className="mx-auto max-w-5xl"><AKChat pedidoId={pedido.id} autorTipo="cliente" /></div>}
      {activeTab === 'historial' && <div className="mx-auto max-w-4xl"><AKTimeline estado={pedido.estado}/></div>}
    </AKPageShell>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/7 bg-black/20 p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/30">{label}</p><p className="mt-1 truncate text-sm font-black">{value}</p></div>
}

function FileBox({ title, name, size, ready, loading, onClick }: { title: string; name?: string | null; size?: string; ready: boolean; loading?: boolean; onClick: () => void }) {
  return (
    <button disabled={!ready || loading} onClick={onClick} className="ak-v6-file p-5 text-left disabled:cursor-not-allowed disabled:opacity-50">
      <FileArchive className="text-[var(--ak-glow)]" size={24} />
      <div className="mt-3 text-lg font-black">{title}</div>
      <div className="mt-1 truncate text-sm text-white/35">{name || 'No disponible'}</div>
      <div className="mt-4 flex items-center justify-between text-xs font-black uppercase tracking-[0.18em] text-white/35"><span>{size || '—'}</span>{ready && (loading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />)}</div>
    </button>
  )
}
