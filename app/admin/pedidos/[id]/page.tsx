'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Download, Save, UploadCloud } from 'lucide-react'
import AppShell from '@/components/AppShell'
import { getPedidoAdmin, getSignedUrl, updatePedidoAdmin, uploadModFile, type PedidoAdmin, type PedidoEstado } from '@/lib/file-service-admin'

type Props = { params: { id: string } }

export default function PedidoAdminDetallePage({ params }: Props) {
  const [pedido, setPedido] = useState<PedidoAdmin | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modFile, setModFile] = useState<File | null>(null)

  async function load() {
    setLoading(true)
    try {
      setPedido(await getPedidoAdmin(params.id))
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo cargar el pedido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [params.id])

  async function savePatch(patch: Partial<PedidoAdmin>) {
    setSaving(true)
    try {
      await updatePedidoAdmin(params.id, patch)
      toast.success('Pedido actualizado')
      await load()
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  async function download(bucket?: string | null, path?: string | null) {
    try {
      const url = await getSignedUrl(bucket, path)
      if (!url) return toast.error('Archivo no disponible')
      window.open(url, '_blank')
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo descargar')
    }
  }

  async function uploadMod() {
    if (!modFile) return toast.error('Selecciona un archivo MOD')
    setSaving(true)
    try {
      await uploadModFile(params.id, modFile)
      toast.success('MOD subido y pedido finalizado')
      setModFile(null)
      await load()
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo subir el MOD')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <AppShell><div className="card p-8 text-zinc-500">Cargando pedido...</div></AppShell>
  if (!pedido) return <AppShell><div className="card p-8 text-zinc-500">Pedido no encontrado.</div></AppShell>

  return (
    <AppShell>
      <div className="space-y-6">
        <Link href="/admin/pedidos" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white"><ArrowLeft size={16} /> Volver a pedidos</Link>

        <div className="card p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-red-400">Pedido File Service</p>
              <h1 className="mt-2 text-3xl font-black">{pedido.numero || 'FS sin número'}</h1>
              <p className="mt-1 text-zinc-500">{[pedido.marca, pedido.modelo, pedido.motor].filter(Boolean).join(' · ') || 'Datos del vehículo pendientes'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={pedido.estado || 'pendiente'} onChange={(e) => savePatch({ estado: e.target.value as PedidoEstado })} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-bold outline-none">
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En proceso</option>
                <option value="finalizado">Finalizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
              <button onClick={() => savePatch({ urgente: !pedido.urgente })} className={`rounded-2xl px-4 py-3 font-black ${pedido.urgente ? 'bg-red-600 text-white' : 'bg-white/5 text-zinc-300'}`}>Urgente</button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <section className="xl:col-span-2 card p-6 space-y-4">
            <h2 className="text-2xl font-black">Datos técnicos</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Info label="ECU" value={pedido.ecu} />
              <Info label="HW" value={pedido.hw} />
              <Info label="SW" value={pedido.sw} />
              <Info label="Servicios" value={(pedido.servicios || []).join(', ')} />
            </div>
            <div className="rounded-3xl bg-black/20 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-zinc-500">Observaciones del distribuidor</p>
              <p className="mt-2 whitespace-pre-wrap text-zinc-200">{pedido.observaciones || '—'}</p>
            </div>
          </section>

          <section className="card p-6 space-y-4">
            <h2 className="text-2xl font-black">Archivos</h2>
            <button onClick={() => download(pedido.ori_bucket, pedido.ori_path)} className="btn btn-dark w-full flex items-center justify-center gap-2"><Download size={18} /> Descargar ORI</button>
            {pedido.mod_path && <button onClick={() => download(pedido.mod_bucket, pedido.mod_path)} className="btn btn-red w-full flex items-center justify-center gap-2"><Download size={18} /> Descargar MOD</button>}

            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-4">
              <p className="font-black">Subir MOD</p>
              <input type="file" onChange={(e) => setModFile(e.target.files?.[0] || null)} className="mt-3 w-full text-sm" />
              <button disabled={saving || !modFile} onClick={uploadMod} className="btn btn-red mt-4 w-full flex items-center justify-center gap-2 disabled:opacity-50"><UploadCloud size={18} /> Subir y finalizar</button>
            </div>
          </section>
        </div>

        <section className="card p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black">Notas internas</h2>
            <button disabled={saving} onClick={() => savePatch({ notas_internas: pedido.notas_internas || '' })} className="btn btn-red flex items-center gap-2"><Save size={18} /> Guardar</button>
          </div>
          <textarea value={pedido.notas_internas || ''} onChange={(e) => setPedido({ ...pedido, notas_internas: e.target.value })} className="mt-4 h-40 w-full rounded-3xl border border-white/10 bg-black/30 p-4 outline-none focus:border-red-500" placeholder="Notas solo visibles para Autokeys..." />
        </section>
      </div>
    </AppShell>
  )
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return <div className="rounded-3xl bg-black/20 p-4"><p className="text-xs font-black uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-2 font-bold text-zinc-100">{value || '—'}</p></div>
}
