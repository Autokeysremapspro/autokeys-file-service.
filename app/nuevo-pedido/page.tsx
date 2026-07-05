'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, CloudUpload, FileCode2, Loader2, Send } from 'lucide-react'
import ServiceCard from '@/components/ServiceCard'

const services = [
  { id: 'stage1', icon: '🚀', title: 'Stage 1', price: 35, category: 'Reprogramación' },
  { id: 'stage2', icon: '🏁', title: 'Stage 2', price: 55, category: 'Reprogramación' },
  { id: 'dpf', icon: '🚫', title: 'DPF OFF', price: 30, category: 'Anticontaminación' },
  { id: 'egr', icon: '🌿', title: 'EGR OFF', price: 20, category: 'Anticontaminación' },
  { id: 'adblue', icon: '💧', title: 'AdBlue OFF', price: 35, category: 'Anticontaminación' },
  { id: 'pops', icon: '💥', title: 'Pops & Bangs', price: 35, category: 'Opciones' },
  { id: 'hardcut', icon: '🍿', title: 'Hardcut', price: 25, category: 'Opciones' },
  { id: 'immo', icon: '🔑', title: 'IMMO OFF', price: 45, category: 'Electrónica' },
]

const categories = ['Reprogramación', 'Anticontaminación', 'Opciones', 'Electrónica']

export default function NuevoPedidoPage() {
  const [file, setFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  const selectedServices = services.filter((s) => selected.includes(s.id))
  const total = useMemo(() => selectedServices.reduce((sum, s) => sum + s.price, 0), [selectedServices])

  function pickFile(nextFile: File | null) {
    if (!nextFile) return
    setFile(nextFile)
    setAnalyzing(true)
    setAnalyzed(false)
    setTimeout(() => {
      setAnalyzing(false)
      setAnalyzed(true)
    }, 1500)
  }

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
  }

  return (
    <main className="min-h-screen bg-[#050509] text-white">
      <div className="mx-auto max-w-7xl p-5">
        <Link href="/dashboard" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white"><ArrowLeft size={16} /> Volver</Link>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <div className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-red-400">Nuevo pedido</div>
              <h1 className="text-4xl font-black">Sube tu ORI y selecciona servicios</h1>
              <p className="mt-2 text-zinc-400">Modo rápido premium para enviar un archivo en menos de un minuto.</p>
            </div>

            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); pickFile(e.dataTransfer.files?.[0] || null) }}
              className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-[2rem] border border-dashed border-red-500/35 bg-gradient-to-br from-red-950/30 to-white/[0.03] p-8 text-center transition hover:border-red-400"
            >
              <input type="file" className="hidden" onChange={(e) => pickFile(e.target.files?.[0] || null)} />
              <CloudUpload size={54} className="text-red-400" />
              <div className="mt-4 text-2xl font-black">Arrastra aquí el ORI</div>
              <div className="mt-2 text-zinc-400">o pulsa para seleccionar archivo</div>
              {file && <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-bold text-zinc-200"><FileCode2 className="mr-2 inline" size={18} />{file.name}</div>}
            </label>

            {(analyzing || analyzed) && (
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center gap-3">
                  {analyzing ? <Loader2 className="animate-spin text-red-400" /> : <CheckCircle2 className="text-emerald-400" />}
                  <h2 className="text-2xl font-black">{analyzing ? 'Analizando archivo...' : 'ECU identificada'}</h2>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <Info label="Vehículo" value="Audi A4 2.0 TDI" />
                  <Info label="ECU" value="Bosch EDC17C64" />
                  <Info label="Checksum" value="OK" />
                  <Info label="HW" value="1037XXXXXX" />
                  <Info label="SW" value="5289XXXXXX" />
                  <Info label="Herramientas" value="Flex · KESS3 · Autotuner" />
                </div>
              </div>
            )}

            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category}>
                  <h3 className="mb-3 text-xl font-black">{category}</h3>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {services.filter((s) => s.category === category).map((service) => (
                      <ServiceCard key={service.id} {...service} selected={selected.includes(service.id)} onClick={() => toggle(service.id)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="lg:sticky lg:top-5 h-fit rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="text-sm font-bold uppercase tracking-[0.25em] text-red-400">Resumen</div>
            <h2 className="mt-2 text-3xl font-black">Pedido</h2>
            <div className="mt-5 space-y-3">
              <Info label="Archivo" value={file?.name || 'Pendiente'} />
              <Info label="ECU" value={analyzed ? 'Bosch EDC17C64' : 'Sin analizar'} />
            </div>
            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="mb-3 font-black">Servicios</div>
              {selectedServices.length === 0 ? <p className="text-sm text-zinc-500">Selecciona uno o varios servicios.</p> : (
                <div className="space-y-2">
                  {selectedServices.map((s) => <div key={s.id} className="flex justify-between rounded-2xl bg-black/25 p-3"><span>{s.title}</span><b>{s.price} €</b></div>)}
                </div>
              )}
              <div className="mt-5 flex justify-between text-2xl font-black"><span>Total</span><span className="text-red-300">{total} €</span></div>
            </div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones para el técnico..." className="mt-5 h-28 w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white outline-none focus:border-red-500" />
            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 font-black shadow-lg shadow-red-950/40 disabled:opacity-50" disabled={!file || selected.length === 0}>
              <Send size={18} /> Enviar pedido
            </button>
          </aside>
        </div>
      </div>
    </main>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/25 p-4"><div className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</div><div className="mt-1 font-black text-white">{value}</div></div>
}
