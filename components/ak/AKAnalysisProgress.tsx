'use client'

import { CheckCircle2, Cpu, FileSearch, ShieldCheck, Sparkles, Wrench } from 'lucide-react'

const steps = [
  { label: 'Archivo recibido', icon: FileSearch },
  { label: 'Detectando ECU', icon: Cpu },
  { label: 'Leyendo HW / SW', icon: Wrench },
  { label: 'Checksum OK', icon: ShieldCheck },
  { label: 'Servicios compatibles', icon: Sparkles },
]

export default function AKAnalysisProgress({ active = false, done = false }: { active?: boolean; done?: boolean }) {
  if (!active && !done) return null

  return (
    <div className="rounded-[2rem] border border-white/10 bg-black/35 p-5 shadow-[0_30px_90px_rgba(0,0,0,.35)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-glow)]">AK Cloud Intelligence</p>
          <h3 className="mt-1 text-xl font-black">{done ? 'Análisis completado' : 'Analizando archivo...'}</h3>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${done ? 'bg-[var(--ak-green)]/15 text-[var(--ak-green)]' : 'bg-[var(--ak-red)]/15 text-[var(--ak-glow)]'}`}>
          {done ? <CheckCircle2 size={25} /> : <Sparkles className="animate-pulse" size={24} />}
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={step.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${done || index < 3 ? 'bg-[var(--ak-green)]/12 text-[var(--ak-green)]' : 'bg-white/5 text-white/35'}`}>
                {done || index < 3 ? <CheckCircle2 size={17} /> : <Icon size={17} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>{step.label}</span>
                  <span className="text-xs text-white/35">{done ? 'OK' : index < 3 ? 'OK' : '...'}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div className={`h-full rounded-full ${done || index < 3 ? 'w-full bg-[var(--ak-green)]' : 'w-1/2 animate-pulse bg-[var(--ak-glow)]'}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
