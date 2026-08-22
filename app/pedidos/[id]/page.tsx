'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, Download, FileArchive, Loader2, Printer, ShieldCheck, MessageSquare, History, Layers3, User, Car, Hash } from 'lucide-react'
import AKPageShell from '@/components/ak/AKPageShell'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import AKTimeline, { getTimelineState, timelineFlow } from '@/components/ak/AKTimeline'
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
    getPedidoById(params.id).then(setPedido).catch(console.error).finally(() => setLoading(false))
  }, [params.id])

  useEffect(() => {
    const channel = supabase.channel(`pedido-${params.id}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'file_service_pedidos', filter: `id=eq.${params.id}` }, (payload) => {
      setPedido((current) => (current ? { ...current, ...(payload.new as Partial<FileServicePedido>) } : current))
      setJustUpdated(true)
      setTimeout(() => setJustUpdated(false), 4000)
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
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
    } finally { setDownloading(null) }
  }

  if (loading) {
    return <AKPageShell title="Cargando trabajo" eyebrow="Pedidos"><AKCard className="p-8 text-white/35"><Loader2 className="mr-2 inline animate-spin" /> Cargando pedido...</AKCard></AKPageShell>
  }

  if (!pedido) {
    return <AKPageShell title="Pedido no encontrado" eyebrow="Pedidos"><AKCard className="p-8 text-white/35">Pedido no encontrado.</AKCard></AKPageShell>
  }

  const actionRequired = pedido.estado === 'revision_solicitada'

  return (
    <AKPageShell
      title={`Detalle del pedido #${pedido.numero || pedido.id.slice(0, 8)}`}
      subtitle={pedido.created_at ? `Realizado el ${new Date(pedido.created_at).toLocaleDateString('es-ES')} a las ${new Date(pedido.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` : 'Fecha de creación no disponible'}
      eyebrow="Pedido"
      actions={
        <div className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors ${actionRequired ? 'border-amber-400/35 bg-amber-400/10 text-amber-300' : justUpdated ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-black/25 text-white/55'}`}>
          {(justUpdated || actionRequired) && <span className={`h-2 w-2 rounded-full ${actionRequired ? 'bg-amber-300' : 'animate-pulse bg-emerald-400'}`} />}
          {formatWorkspaceEstado(pedido.estado)}
        </div>
      }
    >
      <Link href="/pedidos" className="mb-5 inline-flex items-center gap-2 text-sm font-black text-white/40 transition hover:text-white"><ArrowLeft size={17} /> Volver a trabajos</Link>

      <div className="mb-6"><AKTimeline estado={pedido.estado} orientation="horizontal" /></div>

      {actionRequired && (
        <div className="mb-6 rounded-[1.75rem] border border-amber-400/25 bg-amber-400/[0.08] p-5 shadow-[0_18px_60px_rgba(245,158,11,0.08)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-amber-300/25 bg-amber-300/10 text-amber-300"><AlertTriangle size={21} /></div>
              <div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Acción requerida</div>
                <h2 className="mt-1 text-lg font-black text-white">Autokeys necesita información o una comprobación para continuar</h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-white/45">Revisa la conversación del pedido y responde a la solicitud del laboratorio. El trabajo permanece abierto y la decisión técnica final sigue siendo de Autokeys.</p>
              </div>
            </div>
            <AKButton onClick={() => setActiveTab('conversacion')} className="shrink-0"><MessageSquare size={17} /> Abrir conversación</AKButton>
          </div>
        </div>
      )}

      <div className="flex gap-1.5 overflow-auto rounded-2xl border border-white/[.075] bg-black/20 p-1.5">
        {[
          ['resumen', 'Resumen', ShieldCheck],
          ['versiones', 'Versiones', Layers3],
          ['conversacion', 'Conversación', MessageSquare],
          ['historial', 'Historial', History],
        ].map(([key, label, Icon]: any) => (
          <button key={key} onClick={() => setActiveTab(key)} className={`whitespace-nowrap rounded-xl px-3.5 py-2.5 text-[11px] font-black transition ${activeTab === key ? 'bg-red-400/12 text-red-300' : 'text-white/38 hover:text-white/60'}`}><Icon size={14} className="mr-2 inline"/>{label}</button>
        ))}
      </div>

      {activeTab === 'resumen' && (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            <div className="ak5-card p-6">
              <div className="ak5-kicker text-red-300">Información del pedido</div>
              <div className="mt-4 grid gap-6 sm:grid-cols-3">
                <InfoGroup icon={User} title="Cliente">
                  <InfoLine label="Nombre" value={pedido.cliente_nombre || 'Sin identificar'} />
                  <InfoLine label="Email" value={pedido.cliente_email || '—'} />
                </InfoGroup>
                <InfoGroup icon={Car} title="Vehículo">
                  <InfoLine label="Marca / modelo" value={[pedido.marca, pedido.modelo].filter(Boolean).join(' ') || 'Pendiente'} />
                  <InfoLine label="Motor / potencia" value={[pedido.motor, pedido.cv].filter(Boolean).join(' · ') || '—'} />
                  <InfoLine label="Año" value={pedido.anio || '—'} />
                  <InfoLine label="ECU" value={pedido.ecu || 'No identificada'} />
                </InfoGroup>
                <InfoGroup icon={Hash} title="Pedido">
                  <InfoLine label="ID de pedido" value={pedido.numero || pedido.id.slice(0, 8)} />
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/25">Prioridad</div>
                    <span className={`mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-black uppercase ${prioridadPillClass(pedido.prioridad)}`}>{pedido.prioridad || 'Normal'}</span>
                  </div>
                  <InfoLine label="Precio" value={`${pedido.precio || 0} €`} />
                  <InfoLine label="Fecha" value={pedido.created_at ? new Date(pedido.created_at).toLocaleString('es-ES') : '—'} />
                </InfoGroup>
              </div>

              <div className="mt-6 border-t border-white/[.06] pt-6">
                <div className="ak5-kicker text-red-300">Servicios solicitados</div>
                <div className="mt-3 flex flex-wrap gap-2">{(pedido.servicios || []).map((servicio, i) => <span key={servicio} className={i === 0 ? 'rounded-full border border-red-400/30 bg-red-400/15 px-4 py-2 text-xs font-black text-red-300' : 'rounded-full border border-white/10 bg-white/[.03] px-4 py-2 text-xs font-black text-white/60'}>{servicio}</span>)}</div>
              </div>

              {pedido.observaciones && (
                <div className="mt-6 border-t border-white/[.06] pt-6">
                  <div className="ak5-kicker text-red-300">Notas del cliente</div>
                  <div className="mt-3 rounded-2xl border border-white/7 bg-black/20 p-4 text-sm leading-6 text-white/45">{pedido.observaciones}</div>
                </div>
              )}
            </div>

            <div className="ak5-card p-6">
              <div className="ak5-kicker text-red-300">Archivos adjuntos ({[pedido.ori_path, pedido.mod_path].filter(Boolean).length})</div>
              <div className="mt-5 space-y-3">
                <FileRow title="Archivo original (ORI)" name={pedido.ori_nombre} size={formatBytes(pedido.ori_size)} ready={!!pedido.ori_path} loading={downloading === pedido.ori_path} onClick={() => download(pedido.ori_bucket, pedido.ori_path, pedido.ori_nombre)} />
                <FileRow title="Última versión (MOD)" name={pedido.mod_nombre} size={pedido.mod_path ? 'Disponible' : 'En preparación'} ready={!!pedido.mod_path} loading={downloading === pedido.mod_path} onClick={() => download(pedido.mod_bucket, pedido.mod_path, pedido.mod_nombre)} />
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <EstadoActualCard pedido={pedido} />
            <div className="ak5-card p-5">
              <div className="ak5-kicker text-red-300">Acciones</div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <AccionButton icon={Download} label="Descargar archivo" sub={pedido.mod_path ? 'Disponible' : 'Cuando esté listo'} onClick={() => download(pedido.mod_bucket, pedido.mod_path, pedido.mod_nombre)} disabled={!pedido.mod_path || downloading === pedido.mod_path} primary />
                <AccionButton icon={MessageSquare} label="Enviar mensaje" sub="Hablar con soporte" onClick={() => setActiveTab('conversacion')} />
                <AccionButton icon={History} label="Ver historial" sub="Seguimiento completo" onClick={() => setActiveTab('historial')} />
                <AccionButton icon={Printer} label="Imprimir pedido" sub="Generar PDF" onClick={() => window.print()} />
              </div>
            </div>
            <AKTimeline estado={pedido.estado}/>
          </aside>
        </div>
      )}

      {activeTab === 'versiones' && <div className="ak5-card p-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><div className="ak5-kicker text-red-300">Control de revisiones</div><h2 className="mt-2 text-2xl font-black">Versiones entregadas</h2><p className="mt-2 text-sm text-white/38">Cada revisión queda vinculada al pedido y nunca sustituye el historial anterior.</p></div></div><div className="mt-6 grid gap-4 md:grid-cols-2"><FileBox title="ORI · Base" name={pedido.ori_nombre} size={formatBytes(pedido.ori_size)} ready={!!pedido.ori_path} loading={downloading === pedido.ori_path} onClick={() => download(pedido.ori_bucket, pedido.ori_path, pedido.ori_nombre)} /><FileBox title={pedido.mod_path ? 'V1 · Última entrega' : 'V1 · Pendiente'} name={pedido.mod_nombre} size={pedido.mod_path ? 'Versión disponible' : 'El laboratorio está trabajando'} ready={!!pedido.mod_path} loading={downloading === pedido.mod_path} onClick={() => download(pedido.mod_bucket, pedido.mod_path, pedido.mod_nombre)} /></div></div>}

      {activeTab === 'conversacion' && <div className="mx-auto max-w-5xl"><AKChat pedidoId={pedido.id} autorTipo="cliente" actionRequired={actionRequired} /></div>}
      {activeTab === 'historial' && <div className="mx-auto max-w-4xl"><AKTimeline estado={pedido.estado}/></div>}
    </AKPageShell>
  )
}

function formatWorkspaceEstado(estado?: string | null) {
  const map: Record<string, string> = { pendiente: 'Pendiente', en_proceso: 'En proceso', esperando_prueba: 'Esperando prueba', revision_solicitada: 'Acción requerida', finalizado: 'Finalizado', cancelado: 'Cancelado' }
  return map[estado || ''] || estado || 'Pendiente'
}

function InfoGroup({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/50"><Icon size={14} className="text-red-300"/>{title}</div>
      <div className="mt-3 space-y-2.5">{children}</div>
    </div>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return <div><div className="text-[10px] font-bold uppercase tracking-wider text-white/25">{label}</div><div className="mt-0.5 truncate text-sm font-bold text-white/80">{value}</div></div>
}

function EstadoActualCard({ pedido }: { pedido: FileServicePedido }) {
  const state = getTimelineState(pedido.estado)
  const pct = Math.round(((state.activeIndex + 1) / timelineFlow.length) * 100)
  const circumference = 2 * Math.PI * 42
  const ringColor = pedido.estado === 'finalizado' ? '#32d583' : state.actionRequired ? '#f59e0b' : 'var(--ak-red)'
  return (
    <div className="ak5-card p-5">
      <div className="flex items-center justify-between">
        <div className="ak5-kicker text-red-300">Estado actual</div>
        <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${state.actionRequired ? 'border-amber-400/30 bg-amber-400/10 text-amber-300' : pedido.estado === 'finalizado' ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'border-blue-400/25 bg-blue-400/10 text-blue-300'}`}>{formatEstado(pedido.estado)}</span>
      </div>
      <div className="mt-5 flex items-center justify-center">
        <div className="relative grid h-32 w-32 place-items-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8"/>
            <circle cx="50" cy="50" r="42" fill="none" stroke={ringColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - pct / 100)} />
          </svg>
          <div className="text-2xl font-black">{pct}%</div>
        </div>
      </div>
      <p className="mt-4 text-center text-sm leading-6 text-white/50">{state.label}.</p>
      <p className="mt-2 text-center text-xs text-white/30">Última actualización: {pedido.updated_at ? new Date(pedido.updated_at).toLocaleString('es-ES') : '—'}</p>
    </div>
  )
}

function AccionButton({ icon: Icon, label, sub, onClick, disabled, primary }: { icon: any; label: string; sub: string; onClick: () => void; disabled?: boolean; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${primary ? 'border-red-400/30 bg-red-400/10 hover:bg-red-400/15' : 'border-white/[.08] bg-black/20 hover:border-white/20'}`}
    >
      <Icon size={18} className={primary ? 'text-red-300' : 'text-white/50'} />
      <div className="mt-2.5 text-xs font-black leading-tight">{label}</div>
      <div className="mt-0.5 text-[10px] text-white/30">{sub}</div>
    </button>
  )
}

function fileExtBadge(name?: string | null) {
  const ext = name?.split('.').pop()?.toUpperCase()
  return ext && ext.length <= 5 ? `Archivo ${ext}` : null
}

function prioridadPillClass(prioridad?: string | null) {
  const v = (prioridad || '').toLowerCase()
  if (v === 'urgente' || v === 'alta') return 'bg-red-500 text-white'
  if (v === 'media') return 'bg-amber-500/20 text-amber-300'
  if (v === 'baja') return 'bg-emerald-500/20 text-emerald-300'
  return 'bg-white/10 text-white/60'
}

function FileRow({ title, name, size, ready, loading, onClick }: { title: string; name?: string | null; size?: string; ready: boolean; loading?: boolean; onClick: () => void }) {
  const typeBadge = ready ? fileExtBadge(name) : null
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[.08] bg-black/20 p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-red-400/20 bg-red-400/10 text-red-300"><FileArchive size={18}/></div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-bold">{title}</span>{typeBadge && <span className="rounded-md border border-white/10 bg-white/[.04] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white/40">{typeBadge}</span>}</div>
        <div className="truncate text-xs text-white/35">{name || 'No disponible'} {size ? `· ${size}` : ''}</div>
      </div>
      {ready && (
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" onClick={onClick} disabled={loading} aria-label={`Descargar ${title}`} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/50 transition hover:border-red-400/25 hover:text-red-300 disabled:opacity-50">{loading ? <Loader2 size={16} className="animate-spin"/> : <Download size={16}/>}</button>
        </div>
      )}
    </div>
  )
}

function FileBox({ title, name, size, ready, loading, onClick }: { title: string; name?: string | null; size?: string; ready: boolean; loading?: boolean; onClick: () => void }) {
  return <button disabled={!ready || loading} onClick={onClick} className="rounded-[22px] border border-white/[.08] bg-black/20 p-5 text-left transition hover:-translate-y-0.5 hover:border-red-400/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:border-white/[.08]"><FileArchive className="text-red-300" size={24} /><div className="mt-3 text-lg font-black">{title}</div><div className="mt-1 truncate text-sm text-white/35">{name || 'No disponible'}</div><div className="mt-4 flex items-center justify-between text-xs font-black uppercase tracking-[0.18em] text-white/35"><span>{size || '—'}</span>{ready && (loading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />)}</div></button>
}