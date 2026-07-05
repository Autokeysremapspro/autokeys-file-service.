import AKCard from './AKCard'
import { CheckCircle2, Cpu, FileSearch, ShieldCheck, Sparkles, Wrench } from 'lucide-react'

const steps = [
  { label: 'Reading file structure', icon: FileSearch },
  { label: 'Detecting ECU family', icon: Cpu },
  { label: 'Reading HW / SW', icon: Wrench },
  { label: 'Checking checksum', icon: ShieldCheck },
  { label: 'Matching services', icon: Sparkles },
]

export default function AKAnalysisProgress({ active, done }: { active: boolean; done: boolean }) {
  if (!active) return null
  return (
    <AKCard className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--ak-glow)]">Intelligent file analysis</p>
          <h3 className="mt-2 text-2xl font-black">{done ? 'Analysis completed' : 'Analysing original file...'}</h3>
          <p className="mt-1 text-sm text-white/38">Simulated visual engine prepared for real ECU detection.</p>
        </div>
        <div className={`flex h-13 w-13 items-center justify-center rounded-2xl ${done ? 'bg-[var(--ak-green)]/12 text-[var(--ak-green)]' : 'ak-sweep bg-[var(--ak-red)]/12 text-[var(--ak-glow)]'}`}>
          {done ? <CheckCircle2 size={26} /> : <Sparkles size={25} />}
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon
          const completed = done || index < 3
          return (
            <div key={step.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/22 p-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${completed ? 'bg-[var(--ak-green)]/10 text-[var(--ak-green)]' : 'bg-white/5 text-white/30'}`}>
                <Icon size={17} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm font-bold"><span>{step.label}</span><span className={completed ? 'text-[var(--ak-green)]' : 'text-white/28'}>{completed ? 'OK' : 'Scanning'}</span></div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${completed ? 'w-full bg-[var(--ak-green)]' : 'w-2/3 bg-[var(--ak-red)]'} transition-all duration-700`} /></div>
              </div>
            </div>
          )
        })}
      </div>
    </AKCard>
  )
}
