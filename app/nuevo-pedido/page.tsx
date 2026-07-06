'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Car, FileUp, Gauge, Send, Wrench } from 'lucide-react'
import AKPageShell from '@/components/ak/AKPageShell'
import AKUploader from '@/components/ak/AKUploader'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import AKServiceCard, { type AKService } from '@/components/ak/AKServiceCard'
import { crearPedidoFileService } from '@/lib/services/pedidos'

const services: AKService[] = [
  { id: 'stage1', name: 'Stage 1', description: 'Reprogramación segura para uso diario.', price: 35, icon: '🚀' },
  { id: 'stage2', name: 'Stage 2', description: 'Calibración para vehículos con hardware.', price: 55, icon: '🏁' },
  { id: 'dpf', name: 'DPF OFF', description: 'Solución filtro partículas diesel.', price: 30, icon: '🚫' },
  { id: 'egr', name: 'EGR OFF', description: 'Solución EGR y ajustes relacionados.', price: 20, icon: '🌿' },
  { id: 'adblue', name: 'AdBlue OFF', description: 'Solución SCR / AdBlue.', price: 35, icon: '💧' },
  { id: 'dtc', name: 'DTC OFF', description: 'Desactivación de códigos específicos.', price: 20, icon: '⚠️' },
  { id: 'immo', name: 'IMMO OFF', description: 'Solución inmovilizador bajo solicitud.', price: 45, icon: '🔑' },
  { id: 'pops', name: 'Pops & Bangs', description: 'Calibración sonido escape sport.', price: 30, icon: '💥' },
  { id: 'hardcut', name: 'Hardcut', description: 'Limitador con efecto hardcut.', price: 25, icon: '🍿' },
  { id: 'original', name: 'Original', description: 'Restaurar o preparar archivo original.', price: 15, icon: '⚙️' },
]

const groups = [
  { title: 'Performance', ids: ['stage1', 'stage2'] },
  { title: 'Anticontaminación', ids: ['dpf', 'egr', 'adblue', 'dtc'] },
  { title: 'Opciones técnicas', ids: ['immo', 'pops', 'hardcut', 'original'] },
]

const initialVehicle = { marca: '', modelo: '', motor: '', anio: '', cv: '', cambio: '', ecu: '', hw: '', sw: '', lectura: '' }

type VehicleForm = typeof initialVehicle

export default function NuevoPedidoPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [vehicle, setVehicle] = useState<VehicleForm>(initialVehicle)
  const [observaciones, setObservaciones] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateVehicle(key: keyof VehicleForm, value: string) {
    setVehicle((current) => ({ ...current, [key]: value }))
  }

  function handleFile(nextFile: File) {
    setFile(nextFile)
    setFileName(nextFile.name)
    setError(null)
  }

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
  }

  const selectedServices = services.filter((service) => selected.includes(service.id))
  const total = useMemo(() => selectedServices.reduce((sum, item) => sum + item.price, 0), [selectedServices])

  async function enviarPedido() {
    if (!file) return setError('Sube primero el archivo ORI.')
    if (!vehicle.marca.trim() || !vehicle.modelo.trim()) return setError('Añade al menos marca y modelo del vehículo.')
    if (!vehicle.ecu.trim()) return setError('Añade la ECU. Si no la sabes, escribe “No sé / revisar”.')
    if (selected.length === 0) return setError('Selecciona al menos un servicio.')

    setSending(true)
    setError(null)
    try {
      const pedido = await crearPedidoFileService({
        ori: file,
        servicios: selectedServices.map((service) => service.name),
        observaciones,
        precio: total,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        motor: vehicle.motor,
        anio: vehicle.anio,
        ecu: vehicle.ecu,
        hw: vehicle.hw,
        sw: vehicle.sw,
        cv: vehicle.cv,
        cambio: vehicle.cambio,
      })
      router.push(`/pedidos/${pedido.id}`)
    } catch (err: any) {
      setError(err?.message || 'No se pudo crear el pedido')
    } finally {
      setSending(false)
    }
  }

  return (
    <AKPageShell
      title="Nuevo pedido"
      subtitle="Sube el ORI, añade los datos técnicos manualmente y selecciona los servicios. Hemos quitado la detección automática para evitar errores."
      eyebrow="File Service"
    >
      <div className="grid gap-6 2xl:grid-cols-[1fr_430px]">
        <div className="space-y-6">
          <AKCard className="p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-300"><FileUp size={24} /></div>
              <div>
                <h2 className="text-2xl font-black">Archivo ORI</h2>
                <p className="text-sm text-white/40">Formatos recomendados: .bin, .ori, .hex, .mod, .zip.</p>
              </div>
            </div>
            <AKUploader fileName={fileName} onFile={handleFile} compact />
          </AKCard>

          <AKCard className="p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-300"><Car size={24} /></div>
              <div>
                <h2 className="text-2xl font-black">Datos del vehículo</h2>
                <p className="text-sm text-white/40">Estos datos los introduce el cliente. Si no sabe un campo, puede dejarlo vacío excepto marca, modelo y ECU.</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Marca *" value={vehicle.marca} onChange={(v) => updateVehicle('marca', v)} placeholder="BMW, Audi, VW..." />
              <Field label="Modelo *" value={vehicle.modelo} onChange={(v) => updateVehicle('modelo', v)} placeholder="320d, A4, Golf 7..." />
              <Field label="Motor" value={vehicle.motor} onChange={(v) => updateVehicle('motor', v)} placeholder="2.0 TDI, 3.0d..." />
              <Field label="Año" value={vehicle.anio} onChange={(v) => updateVehicle('anio', v)} placeholder="2017" />
              <Field label="Potencia" value={vehicle.cv} onChange={(v) => updateVehicle('cv', v)} placeholder="150 cv" />
              <Field label="Cambio" value={vehicle.cambio} onChange={(v) => updateVehicle('cambio', v)} placeholder="Manual, DSG, ZF..." />
            </div>
          </AKCard>

          <AKCard className="p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-300"><Gauge size={24} /></div>
              <div>
                <h2 className="text-2xl font-black">Datos ECU</h2>
                <p className="text-sm text-white/40">Sin detección automática. El cliente rellena ECU / HW / SW manualmente.</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="ECU *" value={vehicle.ecu} onChange={(v) => updateVehicle('ecu', v)} placeholder="EDC17C64, MD1CS003..." />
              <Field label="Hardware" value={vehicle.hw} onChange={(v) => updateVehicle('hw', v)} placeholder="HW / Bosch / referencia" />
              <Field label="Software" value={vehicle.sw} onChange={(v) => updateVehicle('sw', v)} placeholder="SW / versión" />
              <Field label="Herramienta lectura" value={vehicle.lectura} onChange={(v) => updateVehicle('lectura', v)} placeholder="KESS3, FLEX, Autotuner..." />
            </div>
          </AKCard>

          <AKCard className="p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-300"><Wrench size={24} /></div>
              <div>
                <h2 className="text-2xl font-black">Servicios</h2>
                <p className="text-sm text-white/40">Selecciona uno o varios servicios para este archivo.</p>
              </div>
            </div>
            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group.title}>
                  <h3 className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-white/35">{group.title}</h3>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {services.filter((service) => group.ids.includes(service.id)).map((service) => (
                      <AKServiceCard key={service.id} service={{ ...service, compatible: true }} selected={selected.includes(service.id)} onToggle={() => toggle(service.id)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AKCard>
        </div>

        <aside className="space-y-6 2xl:sticky 2xl:top-24 2xl:self-start">
          <AKCard className="p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Resumen</p>
            <h2 className="mt-2 text-3xl font-black">Pedido</h2>
            <div className="mt-5 space-y-3 text-sm">
              <SummaryRow label="Archivo" value={fileName || 'Sin archivo'} />
              <SummaryRow label="Vehículo" value={[vehicle.marca, vehicle.modelo, vehicle.motor].filter(Boolean).join(' ') || 'Pendiente'} />
              <SummaryRow label="ECU" value={vehicle.ecu || 'Pendiente'} />
            </div>
            <div className="mt-5 space-y-2">
              {selectedServices.length === 0 ? <p className="text-sm text-white/35">Sin servicios seleccionados.</p> : selectedServices.map((service) => (
                <div key={service.id} className="flex items-center justify-between rounded-2xl bg-black/25 p-3 text-sm"><span>{service.icon} {service.name}</span><strong>{service.price} €</strong></div>
              ))}
            </div>
            <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Observaciones para el técnico..." className="ak-input mt-5 h-28" />
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5"><span className="text-white/40">Total</span><strong className="text-4xl text-red-400">{total} €</strong></div>
            {error && <div className="mt-4 flex gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"><AlertCircle size={18} /> {error}</div>}
            <AKButton className="mt-5 w-full" disabled={sending} onClick={enviarPedido}><Send size={18} /> {sending ? 'Enviando...' : 'Enviar pedido'}</AKButton>
          </AKCard>
        </aside>
      </div>
    </AKPageShell>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label>
      <span className="ak-label">{label}</span>
      <input className="ak-input" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><span className="text-white/35">{label}</span><strong className="max-w-[220px] truncate text-right text-white">{value}</strong></div>
}
