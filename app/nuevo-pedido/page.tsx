'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Check, ChevronDown, ChevronUp, FileUp, Gauge, Leaf, LockOpen, Plus, Rocket, Send, Settings, ShieldOff, Sparkles, UploadCloud, Wrench, Zap } from 'lucide-react'
import AppShell from '@/components/AppShell'
import { crearPedidoFileService } from '@/lib/services/pedidos'

type Servicio = {
  id: string
  label: string
  category: string
  description: string
  icon: any
}

const SERVICIOS: Servicio[] = [
  { id: 'stage_1', label: 'Stage 1', category: 'Reprogramación', description: 'Optimización segura', icon: Rocket },
  { id: 'stage_2', label: 'Stage 2', category: 'Reprogramación', description: 'Preparación avanzada', icon: Gauge },
  { id: 'original', label: 'Original', category: 'Reprogramación', description: 'Volver a serie', icon: Settings },
  { id: 'dpf_off', label: 'DPF OFF', category: 'Anticontaminación', description: 'Anulación filtro partículas', icon: ShieldOff },
  { id: 'egr_off', label: 'EGR OFF', category: 'Anticontaminación', description: 'Anulación EGR', icon: Leaf },
  { id: 'adblue_off', label: 'AdBlue OFF', category: 'Anticontaminación', description: 'SCR / AdBlue', icon: Sparkles },
  { id: 'pops_bangs', label: 'Pops & Bangs', category: 'Opciones', description: 'Sonido escape', icon: Zap },
  { id: 'hardcut', label: 'Hard Cut', category: 'Opciones', description: 'Corte racing', icon: Gauge },
  { id: 'launch_control', label: 'Launch Control', category: 'Opciones', description: 'Salida asistida', icon: Rocket },
  { id: 'immo_off', label: 'IMMO OFF', category: 'Electrónica', description: 'Inmovilizador', icon: LockOpen },
  { id: 'clonacion_ecu', label: 'Clonación ECU', category: 'Electrónica', description: 'Original a donante', icon: Wrench },
  { id: 'otro', label: 'Otro', category: 'Electrónica', description: 'Servicio personalizado', icon: Plus },
]

const CATEGORIAS = Array.from(new Set(SERVICIOS.map((s) => s.category)))

export default function NuevoPedidoPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])
  const [advanced, setAdvanced] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    marca: '',
    modelo: '',
    motor: '',
    anio: '',
    ecu: '',
    hw: '',
    sw: '',
    cv: '',
    cambio: '',
    prioridad: 'normal',
    observaciones: '',
  })

  const selectedLabels = useMemo(() => {
    return SERVICIOS.filter((s) => selected.includes(s.id)).map((s) => s.label)
  }, [selected])

  function toggleServicio(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
  }

  function setField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submit() {
    if (!file) {
      toast.error('Sube el archivo ORI antes de enviar')
      return
    }
    if (selected.length === 0) {
      toast.error('Selecciona al menos un servicio')
      return
    }

    setSaving(true)
    try {
      const pedido = await crearPedidoFileService({
        servicios: selected,
        observaciones: form.observaciones,
        marca: form.marca,
        modelo: form.modelo,
        motor: form.motor,
        anio: form.anio,
        ecu: form.ecu,
        hw: form.hw,
        sw: form.sw,
        cv: form.cv,
        cambio: form.cambio,
        prioridad: form.prioridad,
        ori: file,
      })

      toast.success(`Pedido ${pedido.numero || ''} creado correctamente`)
      router.push('/pedidos')
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo crear el pedido')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-red-400">
              <UploadCloud size={14} /> Nuevo pedido
            </div>
            <h1 className="text-3xl font-black tracking-tight">Enviar archivo</h1>
            <p className="mt-1 text-zinc-500">Sube el ORI, selecciona servicios y envía el pedido al laboratorio.</p>
          </div>
          <button onClick={submit} disabled={saving} className="btn btn-red inline-flex items-center justify-center gap-2 disabled:opacity-50">
            <Send size={18} /> {saving ? 'Enviando...' : 'Enviar pedido'}
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="card p-6">
              <h2 className="text-xl font-black">1. Archivo ORI</h2>
              <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-red-500/30 bg-red-500/5 p-8 text-center hover:bg-red-500/10">
                <FileUp className="mb-3 text-red-400" size={40} />
                <div className="font-black">{file ? file.name : 'Arrastra o selecciona el archivo original'}</div>
                <div className="mt-1 text-sm text-zinc-500">BIN, ORI, EEPROM, ZIP o archivo leído con tu herramienta</div>
                {file && <div className="mt-2 text-xs text-zinc-400">{Math.round(file.size / 1024)} KB</div>}
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            </section>

            <section className="card p-6">
              <h2 className="text-xl font-black">2. Servicios</h2>
              <p className="mt-1 text-sm text-zinc-500">Puedes seleccionar varios servicios para el mismo archivo.</p>

              <div className="mt-5 space-y-6">
                {CATEGORIAS.map((cat) => (
                  <div key={cat}>
                    <h3 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-zinc-500">{cat}</h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {SERVICIOS.filter((s) => s.category === cat).map((servicio) => {
                        const Icon = servicio.icon
                        const active = selected.includes(servicio.id)
                        return (
                          <button
                            key={servicio.id}
                            type="button"
                            onClick={() => toggleServicio(servicio.id)}
                            className={`group relative rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 ${active ? 'border-red-500 bg-red-600/15 shadow-lg shadow-red-950/30' : 'border-white/10 bg-white/[0.03] hover:border-red-500/40'}`}
                          >
                            {active && <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white"><Check size={14} /></div>}
                            <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${active ? 'bg-red-600 text-white' : 'bg-black/30 text-red-400'}`}>
                              <Icon size={22} />
                            </div>
                            <div className="font-black">{servicio.label}</div>
                            <div className="mt-1 text-xs text-zinc-500">{servicio.description}</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="card p-6">
              <button onClick={() => setAdvanced((v) => !v)} className="flex w-full items-center justify-between gap-3 text-left">
                <div>
                  <h2 className="text-xl font-black">3. Datos del vehículo</h2>
                  <p className="mt-1 text-sm text-zinc-500">Modo avanzado opcional para identificar ECU, HW y SW.</p>
                </div>
                {advanced ? <ChevronUp /> : <ChevronDown />}
              </button>

              {advanced && (
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <Field label="Marca" value={form.marca} onChange={(v) => setField('marca', v)} />
                  <Field label="Modelo" value={form.modelo} onChange={(v) => setField('modelo', v)} />
                  <Field label="Motor" value={form.motor} onChange={(v) => setField('motor', v)} />
                  <Field label="Año" value={form.anio} onChange={(v) => setField('anio', v)} />
                  <Field label="ECU" value={form.ecu} onChange={(v) => setField('ecu', v)} />
                  <Field label="HW" value={form.hw} onChange={(v) => setField('hw', v)} />
                  <Field label="SW" value={form.sw} onChange={(v) => setField('sw', v)} />
                  <Field label="CV" value={form.cv} onChange={(v) => setField('cv', v)} />
                  <Field label="Cambio" value={form.cambio} onChange={(v) => setField('cambio', v)} />
                </div>
              )}

              <div className="mt-5">
                <label className="mb-2 block text-sm font-bold text-zinc-300">Observaciones</label>
                <textarea
                  value={form.observaciones}
                  onChange={(e) => setField('observaciones', e.target.value)}
                  className="h-32 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-red-500"
                  placeholder="Ej: DPF + EGR OFF, revisar checksums, cliente indica fallo P0401..."
                />
              </div>
            </section>
          </div>

          <aside className="card h-fit p-6 xl:sticky xl:top-6">
            <h2 className="text-xl font-black">Resumen</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-black/25 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">Archivo</div>
                <div className="mt-1 font-black">{file?.name || 'Sin archivo'}</div>
              </div>
              <div className="rounded-2xl bg-black/25 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">Servicios</div>
                {selectedLabels.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedLabels.map((label) => <span key={label} className="rounded-full bg-red-600/15 px-3 py-1 text-xs font-bold text-red-300">{label}</span>)}
                  </div>
                ) : <div className="mt-1 text-zinc-500">Sin servicios</div>}
              </div>
              <button onClick={submit} disabled={saving} className="btn btn-red w-full justify-center disabled:opacity-50">
                {saving ? 'Enviando pedido...' : 'Enviar al laboratorio'}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-zinc-300">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-red-500" />
    </label>
  )
}
