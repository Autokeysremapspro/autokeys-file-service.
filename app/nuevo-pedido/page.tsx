'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, FileUp, Send, Sparkles } from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'
import AKUploader from '@/components/ak/AKUploader'
import AKECUCard from '@/components/ak/AKECUCard'
import AKServiceCard, { type AKService } from '@/components/ak/AKServiceCard'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import AKAnalysisProgress from '@/components/ak/AKAnalysisProgress'
import { crearPedidoFileService } from '@/lib/services/pedidos'

const services: AKService[] = [
  { id: 'stage1', name: 'Stage 1', description: 'Safe performance calibration.', price: 35, icon: '🚀' },
  { id: 'stage2', name: 'Stage 2', description: 'Hardware-ready calibration.', price: 55, icon: '🏁' },
  { id: 'dpf', name: 'DPF OFF', description: 'Diesel particulate filter solution.', price: 30, icon: '🚫' },
  { id: 'egr', name: 'EGR OFF', description: 'EGR solution and diagnostics.', price: 20, icon: '🌿' },
  { id: 'adblue', name: 'AdBlue OFF', description: 'SCR/AdBlue solution.', price: 35, icon: '💧' },
  { id: 'immo', name: 'IMMO OFF', description: 'Immobilizer solution.', price: 45, icon: '🔑' },
  { id: 'pops', name: 'Pops & Bangs', description: 'Sport exhaust calibration.', price: 30, icon: '💥', compatible: false },
  { id: 'hardcut', name: 'Hardcut', description: 'RPM limiter effect.', price: 25, icon: '🍿' },
]

const groups = [
  { title: 'Performance', ids: ['stage1', 'stage2'] },
  { title: 'Eco Systems', ids: ['dpf', 'egr', 'adblue'] },
  { title: 'Options', ids: ['immo', 'pops', 'hardcut'] },
]

export default function NuevoPedidoPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [analysing, setAnalysing] = useState(false)
  const [analysed, setAnalysed] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [observaciones, setObservaciones] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFile(nextFile: File) {
    setFile(nextFile)
    setFileName(nextFile.name)
    setAnalysed(false)
    setAnalysing(true)
    setSelected([])
    setError(null)
    window.setTimeout(() => {
      setAnalysing(false)
      setAnalysed(true)
    }, 1400)
  }

  function toggle(id: string) {
    const service = services.find((item) => item.id === id)
    if (service?.compatible === false) return
    setSelected((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
  }

  const selectedServices = services.filter((s) => selected.includes(s.id))
  const total = useMemo(() => selectedServices.reduce((sum, item) => sum + item.price, 0), [selectedServices])

  async function enviarPedido() {
    if (!file) {
      setError('Sube primero el archivo ORI.')
      return
    }
    if (selected.length === 0) {
      setError('Selecciona al menos un servicio.')
      return
    }

    setSending(true)
    setError(null)
    try {
      const pedido = await crearPedidoFileService({
        ori: file,
        servicios: selectedServices.map((service) => service.name),
        observaciones,
        precio: total,
        marca: 'Audi',
        modelo: 'A4',
        motor: '2.0 TDI',
        ecu: 'Bosch EDC17C64',
        hw: '1037XXXXXX',
        sw: 'SW 5521',
        cv: '150 CV',
      })
      router.push(`/pedidos/${pedido.id}`)
    } catch (err: any) {
      setError(err?.message || 'No se pudo crear el pedido')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="ak-noise flex min-h-screen">
      <AKSidebar />
      <section className="flex-1 p-4 lg:p-8">
        <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--ak-glow)]">Create Tuning Request</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Upload. Analyse. Select. Send.</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/40">Una sola pantalla para subir el ORI, ver el análisis visual, seleccionar servicios y crear el pedido.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--ak-green)]/25 bg-[var(--ak-green)]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--ak-green)]">
            <CheckCircle2 size={15} /> Fast mode enabled
          </div>
        </div>

        <div className="grid gap-6 2xl:grid-cols-[1fr_430px]">
          <div className="space-y-6">
            <AKUploader fileName={fileName} onFile={handleFile} />
            <AKAnalysisProgress active={analysing} done={analysed} />

            {analysed && (
              <AKCard className="p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-glow)]">Compatible Services</p>
                    <h2 className="mt-1 text-2xl font-black">Selecciona servicios</h2>
                  </div>
                  <div className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs font-black text-white/45">{selected.length} selected</div>
                </div>

                <div className="space-y-6">
                  {groups.map((group) => (
                    <div key={group.title}>
                      <h3 className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-white/35">{group.title}</h3>
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {services.filter((service) => group.ids.includes(service.id)).map((service) => (
                          <AKServiceCard key={service.id} service={service} selected={selected.includes(service.id)} onToggle={() => toggle(service.id)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </AKCard>
            )}
          </div>

          <aside className="space-y-6 2xl:sticky 2xl:top-6 2xl:self-start">
            <AKECUCard visible={analysed} />

            <AKCard className="p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-glow)]">Order Summary</p>
              <div className="mt-5 space-y-3">
                {!fileName && <p className="text-sm text-white/35">Sube un ORI para preparar el pedido.</p>}
                {fileName && <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-sm"><FileUp size={16} className="mb-2 text-[var(--ak-glow)]" />{fileName}</div>}
                {selectedServices.length === 0 ? (
                  <p className="text-sm text-white/35">Selecciona servicios compatibles para calcular el precio.</p>
                ) : selectedServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between rounded-2xl bg-black/25 p-3 text-sm"><span>{service.icon} {service.name}</span><strong>{service.price} €</strong></div>
                ))}
              </div>

              <textarea
                value={observaciones}
                onChange={(event) => setObservaciones(event.target.value)}
                placeholder="Observaciones para el técnico..."
                className="mt-5 h-28 w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[var(--ak-red)]/60"
              />

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-white/40">Total</span>
                <strong className="text-4xl text-[var(--ak-glow)]">{total} €</strong>
              </div>

              {error && <div className="mt-4 flex gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"><AlertCircle size={18} /> {error}</div>}

              <AKButton className="mt-5 w-full" disabled={!file || selected.length === 0 || sending} onClick={enviarPedido}>
                {sending ? <Sparkles className="animate-spin" size={18} /> : <Send size={18} />}
                {sending ? 'Sending...' : 'Send Request'}
              </AKButton>
            </AKCard>
          </aside>
        </div>
      </section>
    </main>
  )
}
