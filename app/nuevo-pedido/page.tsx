'use client'

import AKSidebar from '@/components/ak/AKSidebar'
import AKUploader from '@/components/ak/AKUploader'
import AKECUCard from '@/components/ak/AKECUCard'
import AKServiceCard, { type AKService } from '@/components/ak/AKServiceCard'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import { useMemo, useState } from 'react'

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

export default function NuevoPedidoPage() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [analysed, setAnalysed] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  function handleFile(file: File) {
    setFileName(file.name)
    setAnalysed(false)
    setTimeout(() => setAnalysed(true), 900)
  }

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
  }

  const selectedServices = services.filter((s) => selected.includes(s.id))
  const total = useMemo(() => selectedServices.reduce((sum, item) => sum + item.price, 0), [selectedServices])

  return (
    <main className="ak-noise flex min-h-screen">
      <AKSidebar />
      <section className="flex-1 p-5 lg:p-8">
        <div className="mb-7">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--ak-glow)]">Create Tuning Request</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Upload. Analyse. Select. Send.</h1>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <AKUploader fileName={fileName} onFile={handleFile} />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {services.map((service) => <AKServiceCard key={service.id} service={service} selected={selected.includes(service.id)} onToggle={() => toggle(service.id)} />)}
            </div>
          </div>

          <div className="space-y-6">
            <AKECUCard visible={analysed} />
            <AKCard className="p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-glow)]">Order Summary</p>
              <div className="mt-5 space-y-3">
                {selectedServices.length === 0 ? <p className="text-sm text-white/35">Select compatible services to build your request.</p> : selectedServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between rounded-2xl bg-black/25 p-3 text-sm"><span>{service.icon} {service.name}</span><strong>{service.price} €</strong></div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-white/40">Total</span>
                <strong className="text-4xl text-[var(--ak-glow)]">{total} €</strong>
              </div>
              <AKButton className="mt-5 w-full" disabled={!fileName || selected.length === 0}>Send Request</AKButton>
            </AKCard>
          </div>
        </div>
      </section>
    </main>
  )
}
