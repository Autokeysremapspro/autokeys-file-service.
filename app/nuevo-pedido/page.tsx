'use client'

import AKSidebar from '@/components/ak/AKSidebar'
import AKTopbar from '@/components/ak/AKTopbar'
import AKUploader from '@/components/ak/AKUploader'
import AKAnalysisProgress from '@/components/ak/AKAnalysisProgress'
import AKECUCard from '@/components/ak/AKECUCard'
import AKServiceCard, { type AKService } from '@/components/ak/AKServiceCard'
import AKOrderSummary from '@/components/ak/AKOrderSummary'
import AKButton from '@/components/ak/AKButton'
import { crearPedidoFileService } from '@/lib/services/pedidos'
import { ChevronDown, ChevronUp, Gauge, Info, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const services: AKService[] = [
  { id: 'stage1', name: 'Stage 1', description: 'Safe performance calibration with OEM-like driveability.', price: 35, icon: '🚀', category: 'Performance' },
  { id: 'stage2', name: 'Stage 2', description: 'Hardware-ready calibration for upgraded vehicles.', price: 55, icon: '🏁', category: 'Performance' },
  { id: 'dpf', name: 'DPF OFF', description: 'Diesel particulate filter solution and diagnostics.', price: 30, icon: '🚫', category: 'Emissions' },
  { id: 'egr', name: 'EGR OFF', description: 'EGR solution with diagnostic calibration.', price: 20, icon: '🌿', category: 'Emissions' },
  { id: 'adblue', name: 'AdBlue OFF', description: 'SCR/AdBlue solution for supported ECUs.', price: 35, icon: '💧', category: 'Emissions' },
  { id: 'nox', name: 'NOx OFF', description: 'NOx system solution for selected platforms.', price: 30, icon: '🧪', category: 'Emissions' },
  { id: 'immo', name: 'IMMO OFF', description: 'Immobilizer solution when technically supported.', price: 45, icon: '🔑', category: 'Electronics' },
  { id: 'clone', name: 'ECU Clone', description: 'Support for cloning jobs and ECU replacement.', price: 60, icon: '🧬', category: 'Electronics' },
  { id: 'pops', name: 'Pops & Bangs', description: 'Sport exhaust calibration for petrol platforms.', price: 30, icon: '💥', category: 'Options', compatible: false },
  { id: 'hardcut', name: 'Hardcut', description: 'RPM limiter effect where compatible.', price: 25, icon: '🍿', category: 'Options' },
  { id: 'launch', name: 'Launch Control', description: 'Launch strategy for supported vehicles.', price: 35, icon: '⚡', category: 'Options' },
  { id: 'vmax', name: 'VMAX OFF', description: 'Speed limiter solution.', price: 25, icon: '🏎️', category: 'Options' },
]

const categories = ['Performance', 'Emissions', 'Options', 'Electronics']

export default function NuevoPedidoPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [analysing, setAnalysing] = useState(false)
  const [analysed, setAnalysed] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [advanced, setAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ marca: 'Audi', modelo: 'A4 B8', motor: '2.0 TDI', anio: '2016', ecu: 'Bosch EDC17C64', hw: '1037XXXXXX', sw: 'SW 5521', cv: '150', cambio: 'Manual', observaciones: '' })

  function handleFile(nextFile: File) {
    setFile(nextFile)
    setAnalysed(false)
    setAnalysing(true)
    window.setTimeout(() => setAnalysed(true), 1200)
  }

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
  }

  const selectedServices = services.filter((s) => selected.includes(s.id))
  const total = useMemo(() => selectedServices.reduce((sum, item) => sum + item.price, 0), [selectedServices])

  async function submit() {
    if (!file) return toast.error('Sube un archivo ORI')
    if (!selected.length) return toast.error('Selecciona al menos un servicio')
    setLoading(true)
    try {
      await crearPedidoFileService({
        ori: file,
        servicios: selectedServices.map((service) => service.name),
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
        precio: total,
      })
      toast.success('Pedido enviado correctamente')
      router.push('/pedidos')
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo enviar el pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="ak-noise ak-grid relative flex min-h-screen overflow-hidden">
      <AKSidebar />
      <section className="relative z-10 flex-1 p-5 lg:p-8">
        <AKTopbar title="Create New Job" subtitle="Drop the ORI, let AK Cloud prepare the workspace and send the request in seconds." />

        <div className="grid gap-6 2xl:grid-cols-[1fr_430px]">
          <div className="space-y-6">
            <AKUploader fileName={file?.name || null} onFile={handleFile} />
            <AKAnalysisProgress active={analysing} done={analysed} />

            {analysed && (
              <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
                <div className="space-y-6">
                  <AKECUCard visible={analysed} />
                  <div className="ak-glass rounded-[2rem] p-5">
                    <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-glow)]"><Gauge size={15} /> Fast details</div>
                    <button onClick={() => setAdvanced(!advanced)} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-black hover:bg-white/[0.06]">
                      Advanced vehicle data {advanced ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                    </button>
                    {advanced && (
                      <div className="mt-4 grid gap-3">
                        {(['marca','modelo','motor','anio','ecu','hw','sw','cv','cambio'] as const).map((key) => (
                          <label key={key} className="block">
                            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-white/32">{key}</span>
                            <input value={form[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[var(--ak-red)]/55" />
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-start gap-3 rounded-[1.7rem] border border-[var(--ak-blue)]/20 bg-[var(--ak-blue)]/8 p-4 text-sm text-white/58">
                    <Info className="mt-0.5 text-[var(--ak-blue)]" size={18} />
                    <p>Compatible services are shown based on the visual analysis profile. Real ECU recognition can be connected later.</p>
                  </div>
                  {categories.map((category) => (
                    <section key={category}>
                      <div className="mb-3 flex items-center gap-2">
                        <Sparkles size={16} className="text-[var(--ak-glow)]" />
                        <h3 className="text-lg font-black">{category}</h3>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {services.filter((service) => service.category === category).map((service) => <AKServiceCard key={service.id} service={service} selected={selected.includes(service.id)} onToggle={() => toggle(service.id)} />)}
                      </div>
                    </section>
                  ))}
                  <div className="ak-glass rounded-[2rem] p-5">
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/35">Observations</span>
                      <textarea value={form.observaciones} onChange={(e) => setForm((prev) => ({ ...prev, observaciones: e.target.value }))} placeholder="Notes for the technician..." className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[var(--ak-red)]/55" />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <AKOrderSummary services={selectedServices} total={total} fileName={file?.name || null} loading={loading} onSubmit={submit} />
        </div>
      </section>
    </main>
  )
}
