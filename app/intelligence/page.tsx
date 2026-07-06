'use client'

import { useMemo, useState } from 'react'
import { Brain, CheckCircle2, FileSearch, Sparkles, UploadCloud } from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import AKUploader from '@/components/ak/AKUploader'
import AKAnalysisProgress from '@/components/ak/AKAnalysisProgress'
import AKIntelligencePanel from '@/components/ak/AKIntelligencePanel'
import { analizarArchivoLocal, type AkDetectedEcu } from '@/lib/services/intelligence'

export default function IntelligencePage() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [analysing, setAnalysing] = useState(false)
  const [done, setDone] = useState(false)
  const [result, setResult] = useState<AkDetectedEcu>(analizarArchivoLocal(null))

  const services = useMemo(() => result.compatibles.map((item) => item.toUpperCase()).join(' · '), [result])

  function analyse(file: File) {
    setFileName(file.name)
    setDone(false)
    setAnalysing(true)
    window.setTimeout(() => {
      setResult(analizarArchivoLocal(file.name))
      setAnalysing(false)
      setDone(true)
    }, 1500)
  }

  return (
    <main className="ak-noise flex min-h-screen">
      <AKSidebar />
      <section className="flex-1 p-4 lg:p-8">
        <header className="mb-8 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--ak-glow)]">AK Intelligence</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">ECU analysis workspace</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/40">Laboratorio visual para analizar ORI, preparar detección real y mostrar servicios compatibles antes de crear un pedido.</p>
          </div>
          <AKButton href="/nuevo-pedido"><UploadCloud size={18} /> Create job</AKButton>
        </header>

        <div className="grid gap-6 2xl:grid-cols-[1fr_460px]">
          <section className="space-y-6">
            <AKCard className="p-6 md:p-8">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--ak-red)]/25 bg-[var(--ak-red)]/10 text-[var(--ak-glow)]"><Brain size={27} /></div>
                <div>
                  <h2 className="text-2xl font-black">Drag & analyse</h2>
                  <p className="text-sm text-white/40">Sube un archivo para ver el análisis visual AK Cloud.</p>
                </div>
              </div>
              <AKUploader fileName={fileName} onFile={analyse} />
            </AKCard>

            <AKAnalysisProgress active={analysing} done={done} />

            {done && (
              <AKCard className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300"><CheckCircle2 size={24} /></div>
                  <div>
                    <h2 className="text-2xl font-black">Analysis completed</h2>
                    <p className="text-sm text-white/40">Servicios sugeridos: {services}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <MiniStat label="ECU" value={result.ecu} />
                  <MiniStat label="Checksum" value={result.checksum} />
                  <MiniStat label="Risk" value={result.riesgo} />
                </div>
              </AKCard>
            )}
          </section>

          <aside className="space-y-6 2xl:sticky 2xl:top-6 2xl:self-start">
            <AKIntelligencePanel visible={done} info={result} />
            <AKCard className="p-6">
              <div className="flex items-center gap-3">
                <FileSearch className="text-[var(--ak-glow)]" size={22} />
                <div>
                  <h3 className="text-xl font-black">Next objective</h3>
                  <p className="text-sm text-white/40">Conectar esta experiencia a un detector real de ECU / HW / SW.</p>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm text-white/45">
                <p>✔ Análisis visual listo.</p>
                <p>✔ Servicios dinámicos listos.</p>
                <p>✔ Historial Autokeys preparado.</p>
              </div>
              <AKButton href="/nuevo-pedido" className="mt-5 w-full"><Sparkles size={18} /> Use in new job</AKButton>
            </AKCard>
          </aside>
        </div>
      </section>
    </main>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
      <div className="text-xs font-black uppercase tracking-[0.2em] text-white/30">{label}</div>
      <div className="mt-2 truncate text-lg font-black text-white">{value}</div>
    </div>
  )
}
