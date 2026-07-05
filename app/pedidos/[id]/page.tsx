'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  FileArchive,
  Gauge,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Wrench,
  XCircle,
} from 'lucide-react'
import AppShell from '@/components/AppShell'
import {
  descargarArchivo,
  estadoColor,
  formatBytes,
  formatEstado,
  getPedidoPublicoById,
  type FileServicePedido,
} from '@/lib/services/pedidos'

function formatDate(date?: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function currency(value?: number | null) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(value || 0))
}

const timeline = [
  { key: 'pendiente', label: 'Pedido recibido', description: 'Tu solicitud está registrada en AK Cloud.' },
  { key: 'en_proceso', label: 'En proceso', description: 'El equipo técnico está trabajando sobre tu archivo.' },
  { key: 'finalizado', label: 'Archivo listo', description: 'El MOD está disponible para descarga.' },
]

function stepState(pedidoEstado: string, key: string) {
  const order = ['pendiente', 'en_proceso', 'finalizado']
  if (pedidoEstado === 'cancelado') return 'cancelado'
  const current = order.indexOf(pedidoEstado)
  const target = order.indexOf(key)
  if (target < current) return 'done'
  if (target === current) return 'active'
  return 'pending'
}

export default function PedidoDetallePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [pedido, setPedido] = useState<FileServicePedido | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      setPedido(await getPedidoPublicoById(params.id))
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo cargar el pedido')
      router.push('/pedidos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) load()
  }, [params.id])

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

  const title = useMemo(() => {
    if (!pedido) return 'Pedido'
    return [pedido.marca, pedido.modelo, pedido.ecu].filter(Boolean).join(' · ') || 'Pedido rápido'
  }, [pedido])

  if (loading) {
    return (
      <AppShell>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-zinc-400">Cargando pedido...</div>
      </AppShell>
    )
  }

  if (!pedido) return null

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <Link href="/pedidos" className="mb-4 inline-flex items-center gap-2 text-sm font-black text-zinc-400 hover:text-white">
              <ArrowLeft size={16} /> Volver a mis pedidos
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-red-300">
                {pedido.numero || 'FS'}
              </span>
              <span className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${estadoColor(pedido.estado)}`}>
                {formatEstado(pedido.estado)}
              </span>
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight">{title}</h1>
            <p className="mt-2 text-zinc-500">Creado {formatDate(pedido.created_at)} · Actualizado {formatDate(pedido.updated_at)}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => download(pedido.ori_bucket, pedido.ori_path, pedido.ori_nombre)} className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black hover:bg-white/[0.08]">
              <Download className="mr-2 inline" size={16} /> Descargar ORI
            </button>
            <button onClick={() => download(pedido.mod_bucket, pedido.mod_path, pedido.mod_nombre)} disabled={!pedido.mod_path} className="rounded-2xl border border-red-500/30 bg-red-600 px-5 py-3 text-sm font-black shadow-lg shadow-red-950/40 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40">
              <Download className="mr-2 inline" size={16} /> Descargar MOD
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
          <section className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.025))] p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/20 text-red-300">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h2 className="text-2xl font-black">Timeline del pedido</h2>
                  <p className="text-sm text-zinc-500">Seguimiento visual de tu archivo dentro de AK Cloud.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {timeline.map((step) => {
                  const state = stepState(pedido.estado, step.key)
                  const activeClass = state === 'done' || state === 'active'
                    ? 'border-red-500/35 bg-red-500/10 text-white'
                    : state === 'cancelado'
                      ? 'border-zinc-500/25 bg-zinc-500/10 text-zinc-400'
                      : 'border-white/10 bg-black/20 text-zinc-500'
                  return (
                    <div key={step.key} className={`rounded-3xl border p-5 ${activeClass}`}>
                      <div className="mb-4 flex items-center justify-between">
                        {state === 'done' ? <CheckCircle2 className="text-emerald-300" /> : state === 'active' ? <Clock3 className="text-red-300" /> : state === 'cancelado' ? <XCircle /> : <Clock3 />}
                        <span className="text-xs font-black uppercase tracking-[0.18em]">{state === 'active' ? 'Ahora' : state === 'done' ? 'OK' : 'Pendiente'}</span>
                      </div>
                      <h3 className="font-black">{step.label}</h3>
                      <p className="mt-2 text-sm text-zinc-500">{step.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <InfoPanel title="Datos técnicos" icon={<Gauge size={20} />}>
                <Info label="Marca / Modelo" value={[pedido.marca, pedido.modelo].filter(Boolean).join(' ') || '—'} />
                <Info label="Motor / Año" value={[pedido.motor, pedido.anio].filter(Boolean).join(' · ') || '—'} />
                <Info label="ECU" value={pedido.ecu || '—'} />
                <Info label="HW / SW" value={[pedido.hw, pedido.sw].filter(Boolean).join(' / ') || '—'} />
                <Info label="Potencia / Cambio" value={[pedido.cv, pedido.cambio].filter(Boolean).join(' · ') || '—'} />
              </InfoPanel>

              <InfoPanel title="Servicios" icon={<Wrench size={20} />}>
                <div className="flex flex-wrap gap-2">
                  {(pedido.servicios || []).length ? (pedido.servicios || []).map((service) => (
                    <span key={service} className="rounded-full border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-red-200">
                      {service}
                    </span>
                  )) : <p className="text-zinc-500">Sin servicios indicados.</p>}
                </div>
                <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Precio estimado</p>
                  <p className="mt-1 text-3xl font-black text-white">{currency(pedido.precio)}</p>
                </div>
              </InfoPanel>
            </div>

            <InfoPanel title="Observaciones" icon={<MessageSquare size={20} />}>
              <p className="whitespace-pre-wrap text-zinc-300">{pedido.observaciones || 'Sin observaciones del cliente.'}</p>
            </InfoPanel>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <div className="mb-4 flex items-center gap-3">
                <FileArchive className="text-red-300" />
                <h2 className="text-xl font-black">Archivos</h2>
              </div>
              <FileRow label="Archivo ORI" name={pedido.ori_nombre} size={pedido.ori_size} available={!!pedido.ori_path} onClick={() => download(pedido.ori_bucket, pedido.ori_path, pedido.ori_nombre)} />
              <FileRow label="Archivo MOD" name={pedido.mod_nombre} size={null} available={!!pedido.mod_path} onClick={() => download(pedido.mod_bucket, pedido.mod_path, pedido.mod_nombre)} />
            </div>

            <div className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/10 p-6">
              <div className="mb-3 flex items-center gap-2 text-emerald-300">
                <ShieldCheck size={20} />
                <h2 className="font-black">Calidad AK Cloud</h2>
              </div>
              <p className="text-sm text-zinc-300">Los archivos se mantienen vinculados a tu pedido para que puedas descargarlos siempre que lo necesites.</p>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  )
}

function InfoPanel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
      <div className="mb-5 flex items-center gap-3 text-red-300">
        {icon}
        <h2 className="text-xl font-black text-white">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-1 truncate font-bold text-zinc-200">{value}</p>
    </div>
  )
}

function FileRow({ label, name, size, available, onClick }: { label: string; name?: string | null; size?: number | null; available: boolean; onClick: () => void }) {
  return (
    <div className="mb-3 rounded-3xl border border-white/10 bg-black/25 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-1 truncate font-black">{name || 'No disponible'}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-zinc-500">{formatBytes(size)}</span>
        <button onClick={onClick} disabled={!available} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40">
          Descargar
        </button>
      </div>
    </div>
  )
}
