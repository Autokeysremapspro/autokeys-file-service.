'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Brain, Cpu, FileArchive, ScanLine, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react'
import AppShell from '@/components/AppShell'

type Detection = {
  identified: boolean
  method: string
  confidence: number
  sha256: string
  vehiculo?: string | null
  marca?: string | null
  modelo?: string | null
  motor?: string | null
  ecu?: string | null
  hw?: string | null
  sw?: string | null
  message?: string | null
  missing_information?: string[]
  evidence?: string[]
  confirmations?: number
}

export default function IntelligencePage() {
  const router = useRouter()
  const [fileName, setFileName] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [detection, setDetection] = useState<Detection | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setFileName(file.name)
    setDetection(null)
    setError(null)
    setAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/ecu/detect', { method: 'POST', body: formData })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error || 'No se pudo analizar el archivo')
      setDetection(payload)
    } catch (e: any) {
      setError(e?.message || 'No se pudo analizar el archivo')
    } finally {
      setAnalyzing(false)
    }
  }

  function usarEnNuevoPedido() {
    if (!detection) return
    sessionStorage.setItem('ak-intel-handoff', JSON.stringify(detection))
    router.push('/nuevo-pedido')
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="ak5-card ak5-gridline relative overflow-hidden rounded-[28px] p-6 sm:p-8 lg:p-10">
          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div>
              <span className="ak5-chip border-cyan-400/20 bg-cyan-400/10 text-cyan-300"><Brain size={13} /> AK Intelligence</span>
              <h1 className="ak5-title mt-4 text-4xl sm:text-5xl">Analiza un archivo antes de pedir</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/48">
                Sube el .bin/.ori/.hex y AK Intelligence lo identifica por huella y patrones reales del archivo — la misma detección que usa Nuevo pedido, aquí como herramienta independiente.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
          <div className="ak5-card rounded-[26px] p-5 sm:p-6">
            <div className="ak5-kicker text-cyan-300">Paso 1</div>
            <h2 className="mt-1 text-xl font-black">Sube el archivo</h2>
            <label className="group mt-5 flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-white/15 bg-white/[0.02] p-8 text-center transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.03]">
              <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
              <div className="flex h-20 w-20 items-center justify-center rounded-[20px] border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 transition group-hover:scale-105">
                {fileName ? <FileArchive size={34} /> : <UploadCloud size={36} />}
              </div>
              <h3 className="mt-6 text-xl font-black">{fileName ? fileName : 'Arrastra tu archivo aquí'}</h3>
              <p className="mt-2 max-w-xs text-sm text-white/35">{fileName ? 'Toca para analizar otro archivo' : '.bin · .ori · .hex · .mod · .zip'}</p>
            </label>

            {analyzing && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4 text-sm text-cyan-200">
                <ScanLine size={18} className="animate-pulse" /> Analizando huella y patrones del archivo...
              </div>
            )}
            {error && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-200">
                <AlertCircle size={18} /> {error}
              </div>
            )}
          </div>

          <div className="ak5-card rounded-[26px] p-5 sm:p-6">
            <div className="ak5-kicker text-red-300">Paso 2</div>
            <h2 className="mt-1 text-xl font-black">Resultado del análisis</h2>

            {!detection && !analyzing && (
              <div className="mt-10 flex flex-col items-center py-10 text-center text-white/30">
                <Cpu size={40} />
                <p className="mt-4 max-w-xs text-sm">El resultado aparecerá aquí en cuanto subas un archivo.</p>
              </div>
            )}

            {detection && (
              <div className="mt-5 space-y-4">
                <div className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl border p-4 ${detection.identified ? 'border-emerald-400/25 bg-emerald-400/[0.06]' : 'border-amber-400/25 bg-amber-400/[0.06]'}`}>
                  <div className="flex items-center gap-2 text-sm font-black">
                    {detection.identified ? <Sparkles size={16} className="text-emerald-300" /> : <AlertCircle size={16} className="text-amber-300" />}
                    {detection.identified ? 'ECU identificada con evidencia verificada' : 'ECU no identificada por huella'}
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white/50">
                    {detection.method === 'huella_exacta_confirmada' ? 'Huella exacta confirmada' : detection.method === 'firma_verificada' ? 'Firma verificada' : 'Sin identificación'}
                  </span>
                </div>

                {detection.identified ? (
                  <>
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <div className="text-lg font-black">{[detection.marca, detection.modelo, detection.motor].filter(Boolean).join(' ') || 'Vehículo pendiente'}</div>
                      {detection.ecu && <div className="mt-1 text-sm text-white/45">ECU: {detection.ecu}{detection.hw ? ` · HW ${detection.hw}` : ''}{detection.sw ? ` · SW ${detection.sw}` : ''}</div>}
                      {detection.evidence?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">{detection.evidence.map((it) => <span key={it} className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold text-emerald-200">{it}</span>)}</div>
                      ) : null}
                    </div>
                    {typeof detection.confirmations === 'number' && detection.confirmations > 0 && (
                      <div className="flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-3 text-sm text-cyan-200">
                        <ShieldCheck size={16} /> Esta huella ya se ha visto {detection.confirmations} {detection.confirmations === 1 ? 'vez' : 'veces'} antes en AK Cloud.
                      </div>
                    )}
                    <button onClick={usarEnNuevoPedido} className="ak5-primary w-full">Usar esta detección en Nuevo pedido</button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-white/55">El sistema no asigna una ECU por aproximación. Completa los datos técnicos manualmente en el pedido para que el laboratorio la valide.</p>
                    {(detection.hw || detection.sw) && <p className="text-xs text-white/40">Extraído del archivo: {detection.hw ? `HW ${detection.hw}` : ''}{detection.hw && detection.sw ? ' · ' : ''}{detection.sw ? `SW ${detection.sw}` : ''}</p>}
                    {detection.missing_information?.length ? (
                      <div className="grid gap-2 sm:grid-cols-2">{detection.missing_information.map((it) => <div key={it} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/55"><AlertCircle size={14} className="text-amber-300" />{it}</div>)}</div>
                    ) : null}
                    <button onClick={usarEnNuevoPedido} className="ak5-secondary w-full">Continuar en Nuevo pedido de todos modos</button>
                  </>
                )}

                <div className="mono text-[11px] text-white/25">SHA-256: {detection.sha256}</div>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
