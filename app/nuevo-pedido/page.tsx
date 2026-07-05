'use client'

import { useMemo, useState } from 'react'
import AppShell from '@/components/AppShell'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import {
  BadgeCheck,
  Ban,
  Car,
  Check,
  Flame,
  Gauge,
  KeyRound,
  LockOpen,
  Rocket,
  Settings,
  ShieldOff,
  Sparkles,
  UploadCloud,
  Wrench,
  Zap,
} from 'lucide-react'

type ServiceItem = {
  id: string
  label: string
  description: string
  category: string
  icon: React.ElementType
}

const serviceGroups: { title: string; subtitle: string; items: ServiceItem[] }[] = [
  {
    title: 'Reprogramación',
    subtitle: 'Potencia, par y calibraciones principales.',
    items: [
      { id: 'Stage 1', label: 'Stage 1', description: 'Optimización segura', category: 'Repro', icon: Rocket },
      { id: 'Stage 2', label: 'Stage 2', description: 'Hardware + potencia', category: 'Repro', icon: Gauge },
      { id: 'Original', label: 'Original', description: 'Archivo de serie', category: 'Repro', icon: BadgeCheck },
    ],
  },
  {
    title: 'Anticontaminación',
    subtitle: 'Servicios frecuentes para gestión de sistemas.',
    items: [
      { id: 'DPF OFF', label: 'DPF OFF', description: 'Filtro partículas', category: 'Eco', icon: Ban },
      { id: 'EGR OFF', label: 'EGR OFF', description: 'Válvula EGR', category: 'Eco', icon: ShieldOff },
      { id: 'AdBlue OFF', label: 'AdBlue OFF', description: 'Sistema SCR', category: 'Eco', icon: Sparkles },
      { id: 'NOx OFF', label: 'NOx OFF', description: 'Sensores NOx', category: 'Eco', icon: Zap },
    ],
  },
  {
    title: 'Opciones',
    subtitle: 'Extras racing y funciones especiales.',
    items: [
      { id: 'Pops & Bangs', label: 'Pops & Bangs', description: 'Petardeo escape', category: 'Opciones', icon: Flame },
      { id: 'Hardcut', label: 'Hardcut', description: 'Corte racing', category: 'Opciones', icon: Gauge },
      { id: 'Launch Control', label: 'Launch Control', description: 'Salida controlada', category: 'Opciones', icon: Rocket },
      { id: 'VMAX OFF', label: 'VMAX OFF', description: 'Limitador velocidad', category: 'Opciones', icon: Car },
    ],
  },
  {
    title: 'Electrónica',
    subtitle: 'Servicios técnicos de ECU e inmovilizador.',
    items: [
      { id: 'IMMO OFF', label: 'IMMO OFF', description: 'Inmovilizador', category: 'Electrónica', icon: LockOpen },
      { id: 'Clonación ECU', label: 'Clonación ECU', description: 'Datos ECU', category: 'Electrónica', icon: Settings },
      { id: 'Reparación ECU', label: 'Reparación ECU', description: 'Avería módulo', category: 'Electrónica', icon: Wrench },
      { id: 'Llaves', label: 'Llaves', description: 'PIN / ISN / key', category: 'Electrónica', icon: KeyRound },
    ],
  },
]

const quickDefaults = ['Stage 1', 'DPF OFF', 'EGR OFF']

export default function NuevoPedido() {
  const [loading, setLoading] = useState(false)
  const [advanced, setAdvanced] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>(['Stage 1'])
  const [fileName, setFileName] = useState('')
  const [form, setForm] = useState({
    marca: '',
    modelo: '',
    motor: '',
    ecu: '',
    hw: '',
    sw: '',
    observaciones: '',
  })

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const resumenServicios = useMemo(() => selectedServices.join(' + '), [selectedServices])

  function toggleService(service: string) {
    setSelectedServices((current) => {
      if (current.includes(service)) return current.filter((item) => item !== service)
      return [...current, service]
    })
  }

  function selectQuickPack() {
    setSelectedServices(quickDefaults)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()

    if (selectedServices.length === 0) {
      toast.error('Selecciona al menos un servicio')
      return
    }

    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('file_service').insert({
      cliente: user?.email || 'Distribuidor',
      marca: form.marca || null,
      modelo: form.modelo || null,
      motor: form.motor || null,
      ecu: form.ecu || null,
      hw: form.hw || null,
      sw: form.sw || null,
      servicio: resumenServicios,
      notas: [form.observaciones, fileName ? `Archivo seleccionado: ${fileName}` : '']
        .filter(Boolean)
        .join('\n'),
      estado: 'pendiente',
      pagado: false,
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Pedido creado correctamente')
    setForm({ marca: '', modelo: '', motor: '', ecu: '', hw: '', sw: '', observaciones: '' })
    setFileName('')
    setSelectedServices(['Stage 1'])
  }

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-red-400">
            Autokeys File Service
          </div>
          <h1 className="text-4xl font-black tracking-tight">Nuevo pedido</h1>
          <p className="mt-2 max-w-2xl text-zinc-500">
            Selecciona servicios con tarjetas. Puedes combinar varios trabajos en el mismo archivo.
          </p>
        </div>

        <button type="button" onClick={selectQuickPack} className="btn btn-dark inline-flex items-center gap-2">
          <Zap size={18} /> Pack rápido Stage 1 + DPF + EGR
        </button>
      </div>

      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {serviceGroups.map((group) => (
            <section key={group.title} className="card p-5">
              <div className="mb-4">
                <h2 className="text-xl font-black">{group.title}</h2>
                <p className="text-sm text-zinc-500">{group.subtitle}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = selectedServices.includes(item.id)

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleService(item.id)}
                      className={`group relative overflow-hidden rounded-3xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 ${
                        active
                          ? 'border-red-500 bg-red-600/15 shadow-xl shadow-red-950/30'
                          : 'border-white/10 bg-white/[0.03] hover:border-red-500/40 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border ${active ? 'border-red-400/40 bg-red-500/20 text-red-300' : 'border-white/10 bg-black/20 text-zinc-400 group-hover:text-red-300'}`}>
                        <Icon size={24} />
                      </div>

                      <div className="font-black text-white">{item.label}</div>
                      <div className="mt-1 text-xs text-zinc-500">{item.description}</div>

                      {active && (
                        <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white">
                          <Check size={16} />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </section>
          ))}

          <section className="card p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">Datos del archivo</h2>
                <p className="text-sm text-zinc-500">Modo rápido o modo avanzado según lo que necesites.</p>
              </div>
              <button type="button" onClick={() => setAdvanced(!advanced)} className="btn btn-dark">
                {advanced ? 'Modo rápido' : 'Modo avanzado'}
              </button>
            </div>

            <label className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-red-500/30 bg-red-500/5 p-8 text-center transition hover:bg-red-500/10">
              <UploadCloud className="mb-3 text-red-400" size={38} />
              <span className="font-black">Subir archivo ORI</span>
              <span className="mt-1 text-sm text-zinc-500">BIN / ORI / ZIP / archivo de lectura</span>
              {fileName && <span className="mt-3 rounded-full bg-red-600/20 px-4 py-2 text-sm font-bold text-red-200">{fileName}</span>}
              <input
                type="file"
                className="hidden"
                onChange={(event) => setFileName(event.target.files?.[0]?.name || '')}
              />
            </label>

            {advanced && (
              <div className="grid gap-4 md:grid-cols-2">
                <input placeholder="Marca" value={form.marca} onChange={(e) => set('marca', e.target.value)} />
                <input placeholder="Modelo" value={form.modelo} onChange={(e) => set('modelo', e.target.value)} />
                <input placeholder="Motor" value={form.motor} onChange={(e) => set('motor', e.target.value)} />
                <input placeholder="ECU" value={form.ecu} onChange={(e) => set('ecu', e.target.value)} />
                <input placeholder="HW" value={form.hw} onChange={(e) => set('hw', e.target.value)} />
                <input placeholder="SW" value={form.sw} onChange={(e) => set('sw', e.target.value)} />
              </div>
            )}

            <textarea
              className="mt-4 min-h-32"
              placeholder="Observaciones: DTC, modificaciones, urgencia, detalles del vehículo..."
              value={form.observaciones}
              onChange={(e) => set('observaciones', e.target.value)}
            />
          </section>
        </div>

        <aside className="card h-fit p-5 xl:sticky xl:top-6">
          <h2 className="text-2xl font-black">Resumen</h2>
          <p className="mt-1 text-sm text-zinc-500">Revisa el pedido antes de enviarlo.</p>

          <div className="mt-5 space-y-3">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-black uppercase tracking-wider text-zinc-500">Servicios</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedServices.map((service) => (
                  <span key={service} className="rounded-full bg-red-600/20 px-3 py-1 text-sm font-bold text-red-200">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-black uppercase tracking-wider text-zinc-500">Archivo</div>
              <div className="mt-2 font-bold">{fileName || 'Pendiente de seleccionar'}</div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-black uppercase tracking-wider text-zinc-500">Modo</div>
              <div className="mt-2 font-bold">{advanced ? 'Avanzado' : 'Rápido'}</div>
            </div>
          </div>

          <button disabled={loading} className="btn btn-red mt-5 w-full text-lg disabled:opacity-60">
            {loading ? 'Enviando pedido...' : 'Enviar pedido'}
          </button>

          <p className="mt-4 text-center text-xs text-zinc-500">
            El pedido quedará en estado pendiente para revisión del laboratorio.
          </p>
        </aside>
      </form>
    </AppShell>
  )
}
