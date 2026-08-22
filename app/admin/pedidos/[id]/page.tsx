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
  { value: 'esperando_prueba', label: 'Esperando prueba' },
  { value: 'revision_solicitada', label: 'Acción requerida' },
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
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5 flex items-center gap-3"><Wrench className="text-red-400" /><h2 className="text-xl font-black">Gestión técnica</h2></div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2"><span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Estado</span><CustomSelect value={estado} onChange={setEstado} options={estados} /></label>
                <label className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black/20 p-4"><input type="checkbox" checked={urgente} onChange={(e) => setUrgente(e.target.checked)} className="h-5 w-5 accent-red-600" /><span className="font-black">Marcar como urgente</span></label>
              </div>
              <label className="mt-4 block space-y-2"><span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Notas internas</span><textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={5} className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-sm outline-none focus:border-red-500/40" placeholder="Notas internas del laboratorio..." /></label>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5 flex items-center gap-3"><ScanLine className="text-red-400" /><h2 className="text-xl font-black">Datos técnicos</h2></div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[
                  ['Marca', pedido.marca], ['Modelo', pedido.modelo], ['Motor', pedido.motor], ['Año', pedido.anio], ['ECU', pedido.ecu], ['HW', pedido.hw], ['SW', pedido.sw], ['CV', pedido.cv], ['Lectura', pedido.tipo_lectura],
                ].map(([k, v]) => <div key={String(k)} className="rounded-2xl border border-white/10 bg-black/25 p-4"><p className="text-[11px] font-black uppercase tracking-[0.16em] text-zinc-600">{k}</p><p className="mt-1 font-black">{v || '—'}</p></div>)}
              </div>
              <button onClick={confirmarEcu} disabled={confirmandoEcu} className="mt-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-black text-emerald-300 hover:bg-emerald-500/15 disabled:opacity-50">
                <Star className="mr-2 inline" size={16} /> {confirmandoEcu ? 'Guardando huella...' : 'Confirmar ECU y aprender huella'}
              </button>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5 flex items-center gap-3"><FileArchive className="text-red-400" /><h2 className="text-xl font-black">Archivos</h2></div>
              <div className="space-y-3">
                <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 md:flex-row md:items-center">
                  <div><p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">ORI</p><p className="font-black">{pedido.ori_nombre || 'Sin archivo'}</p><p className="text-xs text-zinc-600">{formatBytes(pedido.ori_size)}</p></div>
                  <button onClick={() => download(pedido.ori_bucket, pedido.ori_path, pedido.ori_nombre)} disabled={!pedido.ori_path} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-black hover:bg-white/5 disabled:opacity-30"><Download className="mr-2 inline" size={15} /> Descargar</button>
                </div>
                <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 md:flex-row md:items-center">
                  <div><p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">MOD</p><p className="font-black">{pedido.mod_nombre || 'Pendiente'}</p><p className="text-xs text-zinc-600">{formatBytes(pedido.mod_size)}</p></div>
                  <button onClick={() => download(pedido.mod_bucket, pedido.mod_path, pedido.mod_nombre)} disabled={!pedido.mod_path} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-black hover:bg-white/5 disabled:opacity-30"><Download className="mr-2 inline" size={15} /> Descargar</button>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5 flex items-center gap-3"><UploadCloud className="text-red-400" /><h2 className="text-xl font-black">Entregar MOD</h2></div>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/15 bg-black/20 p-7 text-center hover:border-red-500/30">
                <FileUp size={30} className="mb-3 text-red-400" />
                <span className="font-black">{mod ? mod.name : 'Seleccionar archivo MOD'}</span>
                <input type="file" className="hidden" onChange={(e) => setMod(e.target.files?.[0] || null)} />
              </label>
              <button onClick={uploadModAndFinish} disabled={!mod || saving} className="mt-4 w-full rounded-2xl bg-emerald-600 px-4 py-3 font-black hover:bg-emerald-500 disabled:opacity-40"><CheckCircle2 className="mr-2 inline" size={17} /> Subir MOD y finalizar</button>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-4 flex items-center gap-3"><User className="text-red-400" /><h2 className="text-xl font-black">Cliente</h2></div>
              <p className="font-black">{pedido.cliente_nombre || '—'}</p><p className="text-sm text-zinc-500">{pedido.cliente_email || '—'}</p>
              {pedido.observaciones && <div className="mt-4 rounded-2xl border border-yellow-500/15 bg-yellow-500/5 p-4 text-sm text-yellow-100/80"><AlertTriangle className="mr-2 inline" size={15} />{pedido.observaciones}</div>}
            </div>

            <AKChat pedidoId={pedido.id} autorTipo="admin" title="Chat con distribuidor" compact />
          </section>
        </div>
      </div>
    </AppShell>
  )
}
