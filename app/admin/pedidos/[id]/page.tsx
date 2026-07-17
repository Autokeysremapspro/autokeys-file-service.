'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileArchive,
  FileUp,
  Gauge,
  MessageSquare,
  Save,
  ScanLine,
  Star,
  UploadCloud,
  User,
  Wrench,
} from 'lucide-react'
import AppShell from '@/components/AppShell'
import AKChat from '@/components/ak/AKChat'
import CustomSelect from '@/components/ak/CustomSelect'
import {
  actualizarPedidoAdmin,
  descargarArchivo,
  estadoColor,
  formatBytes,
  formatEstado,
  getPedidoById,
  subirModPedido,
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

const estados = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'cancelado', label: 'Cancelado' },
]

export default function AdminPedidoDetallePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [pedido, setPedido] = useState<FileServicePedido | null>(null)
  const [estado, setEstado] = useState('pendiente')
  const [notas, setNotas] = useState('')
  const [urgente, setUrgente] = useState(false)
  const [mod, setMod] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confirmandoEcu, setConfirmandoEcu] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await getPedidoById(params.id)
      setPedido(data)
      setEstado(data.estado || 'pendiente')
      setNotas((data as any).notas_internas || '')
      setUrgente(Boolean((data as any).urgente))
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo cargar el pedido')
      router.push('/admin/pedidos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) load()
  }, [params.id])

  async function save() {
    if (!pedido) return
    setSaving(true)
    try {
      const updated = await actualizarPedidoAdmin(pedido.id, {
        estado,
        notas_internas: notas || null,
        urgente,
      } as any)
      setPedido(updated)
      toast.success('Pedido actualizado')
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  async function uploadModAndFinish() {
    if (!pedido) return
    if (!mod) return toast.error('Selecciona un archivo MOD')
    setSaving(true)
    try {
      const updated = await subirModPedido(pedido.id, mod)
      setPedido(updated)
      setEstado(updated.estado)
      setMod(null)
      toast.success('MOD subido y pedido finalizado')
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo subir el MOD')
    } finally {
      setSaving(false)
    }
  }

  async function confirmarEcu() {
    if (!pedido) return
    if (!pedido.ori_bucket || !pedido.ori_path) {
      toast.error('Este pedido no tiene archivo ORI para calcular la huella')
      return
    }
    setConfirmandoEcu(true)
    try {
      const blob = await descargarArchivo(pedido.ori_bucket, pedido.ori_path)
      const buffer = await blob.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
      const sha256 = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('')

      const res = await fetch('/api/ecu/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sha256,
          vehiculo: [pedido.marca, pedido.modelo].filter(Boolean).join(' ') || null,
          marca: pedido.marca || null,
          modelo: pedido.modelo || null,
          motor: pedido.motor || null,
          ecu: pedido.ecu || null,
          hw: pedido.hw || null,
          sw: pedido.sw || null,
          pedido_id: pedido.id,
          file_size: pedido.ori_size || null,
        }),
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error)
      toast.success('Huella guardada — el próximo archivo idéntico se identificará al instante')
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo guardar la huella')
    } finally {
      setConfirmandoEcu(false)
    }
  }

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
    return <AppShell><div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-zinc-400">Cargando pedido...</div></AppShell>
  }

  if (!pedido) return null

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <Link href="/admin/pedidos" className="mb-4 inline-flex items-center gap-2 text-sm font-black text-zinc-400 hover:text-white">
              <ArrowLeft size={16} /> Volver a pedidos
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-red-300">
                {pedido.numero || 'FS'}
              </span>
              <span className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${estadoColor(pedido.estado)}`}>
                {formatEstado(pedido.estado)}
              </span>
              {(pedido as any).urgente && (
                <span className="rounded-full border border-yellow-500/35 bg-yellow-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-yellow-300">
                  Urgente
                </span>
              )}
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight">{title}</h1>
            <p className="mt-2 text-zinc-500">Cliente: {pedido.cliente_nombre || pedido.cliente_email || '—'} · {formatDate(pedido.created_at)}</p>
          </div>

          <button onClick={save} disabled={saving} className="rounded-2xl border border-red-500/30 bg-red-600 px-5 py-3 text-sm font-black shadow-lg shadow-red-950/40 hover:bg-red-500 disabled:opacity-50">
            <Save className="mr-2 inline" size={16} /> Guardar cambios
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <section className="space-y-6">
            <Panel title="Gestión interna" icon={<Wrench size={20} />}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Estado</span>
                  <CustomSelect
                    value={estado}
                    onChange={setEstado}
                    options={estados.map((item) => ({ value: item.value, label: item.label }))}
                  />
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                  <input type="checkbox" checked={urgente} onChange={(e) => setUrgente(e.target.checked)} className="h-5 w-5 accent-red-600" />
                  <span className="font-black"><Star className="mr-2 inline text-yellow-300" size={17} /> Marcar urgente</span>
                </label>
              </div>
              <label className="mt-4 block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Notas internas</span>
                <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={7} placeholder="Notas que solo verá Autokeys..." className="w-full rounded-3xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none focus:border-red-500" />
              </label>
            </Panel>

            <Panel title="Subir MOD y finalizar" icon={<UploadCloud size={20} />}>
              <div className="rounded-[2rem] border border-dashed border-red-500/25 bg-red-500/10 p-6 text-center">
                <FileUp className="mx-auto text-red-300" size={36} />
                <h3 className="mt-3 text-xl font-black">Archivo modificado</h3>
                <p className="mt-1 text-sm text-zinc-500">Sube el MOD terminado. El pedido pasará automáticamente a finalizado.</p>
                <input type="file" onChange={(e) => setMod(e.target.files?.[0] || null)} className="mt-5 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm" />
                {mod && <p className="mt-3 text-sm font-bold text-red-200">{mod.name} · {formatBytes(mod.size)}</p>}
                <button onClick={uploadModAndFinish} disabled={saving || !mod} className="mt-5 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black shadow-lg shadow-red-950/40 hover:bg-red-500 disabled:opacity-50">
                  Subir MOD y finalizar
                </button>
              </div>
            </Panel>

            <Panel title="Datos técnicos" icon={<Gauge size={20} />}>
              <div className="grid gap-3 md:grid-cols-2">
                <Info label="Marca / Modelo" value={[pedido.marca, pedido.modelo].filter(Boolean).join(' ') || '—'} />
                <Info label="Motor / Año" value={[pedido.motor, pedido.anio].filter(Boolean).join(' · ') || '—'} />
                <Info label="ECU" value={pedido.ecu || '—'} />
                <Info label="HW / SW" value={[pedido.hw, pedido.sw].filter(Boolean).join(' / ') || '—'} />
                <Info label="Potencia / Cambio" value={[pedido.cv, pedido.cambio].filter(Boolean).join(' · ') || '—'} />
                <Info label="Precio" value={`${Number(pedido.precio || 0).toFixed(2)} €`} />
              </div>
              <div className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-500/[.06] p-4">
                <p className="text-sm text-zinc-400">
                  ¿Los datos de arriba son correctos? Confirma la huella de este archivo ORI para que la
                  próxima vez que llegue uno idéntico se identifique al instante, sin depender de heurística.
                </p>
                <button
                  onClick={confirmarEcu}
                  disabled={confirmandoEcu || !pedido.ecu}
                  className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-blue-300 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ScanLine size={16} /> {confirmandoEcu ? 'Guardando huella...' : 'Confirmar identificación ECU'}
                </button>
                {!pedido.ecu && <p className="mt-2 text-xs text-zinc-500">Rellena el campo ECU antes de confirmar.</p>}
              </div>
            </Panel>
          </section>

          <aside className="space-y-6">
            <Panel title="Cliente" icon={<User size={20} />}>
              <Info label="Nombre" value={pedido.cliente_nombre || '—'} />
              <Info label="Email" value={pedido.cliente_email || '—'} />
            </Panel>

            <Panel title="Archivos" icon={<FileArchive size={20} />}>
              <FileRow label="ORI" name={pedido.ori_nombre} size={pedido.ori_size} available={!!pedido.ori_path} onClick={() => download(pedido.ori_bucket, pedido.ori_path, pedido.ori_nombre)} />
              <FileRow label="MOD" name={pedido.mod_nombre} size={null} available={!!pedido.mod_path} onClick={() => download(pedido.mod_bucket, pedido.mod_path, pedido.mod_nombre)} />
            </Panel>

            <Panel title="Servicios" icon={<CheckCircle2 size={20} />}>
              <div className="flex flex-wrap gap-2">
                {(pedido.servicios || []).map((service) => <span key={service} className="rounded-full border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-red-200">{service}</span>)}
              </div>
            </Panel>

            <Panel title="Observaciones cliente" icon={<MessageSquare size={20} />}>
              <p className="whitespace-pre-wrap text-zinc-300">{pedido.observaciones || 'Sin observaciones.'}</p>
            </Panel>

            <AKChat pedidoId={pedido.id} autorTipo="admin" title="Chat con distribuidor" compact />

            {pedido.estado === 'cancelado' && (
              <div className="rounded-[2rem] border border-red-500/25 bg-red-500/10 p-5 text-red-200">
                <AlertTriangle className="mb-2" /> Pedido cancelado.
              </div>
            )}
          </aside>
        </div>
      </div>
    </AppShell>
  )
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
      <div className="mb-5 flex items-center gap-3 text-red-300">
        {icon}
        <h2 className="text-xl font-black text-white">{title}</h2>
      </div>
      {children}
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
