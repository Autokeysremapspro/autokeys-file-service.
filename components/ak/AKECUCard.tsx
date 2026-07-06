import AKCard from './AKCard'
import { AlertTriangle, Cpu, Gauge, ShieldCheck, Wrench, Zap } from 'lucide-react'

export type AKECUInfo = {
  vehicle: string
  engine: string
  ecu: string
  power: string
  year: string
  hw: string
  sw: string
  checksum: string
  identified?: boolean
  confidence?: number
  tools?: string[]
  notes?: string[]
}

const defaultInfo: AKECUInfo = {
  vehicle: 'Vehículo no identificado',
  engine: 'No identificado',
  ecu: 'ECU no identificada',
  power: '—',
  year: '—',
  hw: 'No detectado',
  sw: 'No detectado',
  checksum: 'No verificado',
  identified: false,
  confidence: 0,
  tools: ['Magic FLEX', 'KESS3', 'Autotuner', 'PCMFlash'],
}

export default function AKECUCard({ visible = false, info = defaultInfo }: { visible?: boolean; info?: AKECUInfo }) {
  const isIdentified = info.identified !== false && info.ecu !== 'ECU no identificada'

  if (!visible) {
    return (
      <AKCard className="p-6">
        <div className="flex min-h-[360px] flex-col items-center justify-center text-center text-white/30">
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.8rem] border border-white/10 bg-white/[0.035]"><Cpu size={42} /></div>
          <p className="mt-5 text-sm font-bold">Waiting for ECU analysis</p>
          <p className="mt-2 max-w-xs text-xs leading-5 text-white/25">Upload an ORI file to unlock technical details, services and compatible tools.</p>
        </div>
      </AKCard>
    )
  }

  return (
    <AKCard className="overflow-hidden p-6">
      <div className="relative">
        <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full ${isIdentified ? 'bg-[var(--ak-green)]/12' : 'bg-amber-500/12'} blur-3xl`} />
        <div className="relative flex items-start justify-between gap-5">
          <div>
            <p className={`text-xs font-black uppercase tracking-[0.24em] ${isIdentified ? 'text-[var(--ak-green)]' : 'text-amber-300'}`}>
              {isIdentified ? 'ECU identified' : 'Manual review required'}
            </p>
            <h3 className="mt-2 text-3xl font-black tracking-tight">{info.ecu}</h3>
            <p className="mt-1 text-sm text-white/42">{info.vehicle} · {info.engine} · {info.power}</p>
            {typeof info.confidence === 'number' && (
              <div className="mt-3 inline-flex rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-black text-white/45">
                Confidence {info.confidence}%
              </div>
            )}
          </div>
          <div className={`flex h-16 w-16 items-center justify-center rounded-[1.4rem] border ${isIdentified ? 'border-[var(--ak-green)]/25 bg-[var(--ak-green)]/10 text-[var(--ak-green)]' : 'border-amber-500/25 bg-amber-500/10 text-amber-300'}`}>
            {isIdentified ? <ShieldCheck size={31} /> : <AlertTriangle size={31} />}
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-3 text-sm">
          <TechBox label="Vehicle" value={info.vehicle} icon={<Gauge size={16} />} />
          <TechBox label="Engine" value={info.engine} icon={<Zap size={16} />} />
          <TechBox label="Hardware" value={info.hw} />
          <TechBox label="Software" value={info.sw} />
          <TechBox label="Year" value={info.year} />
          <TechBox label="Checksum" value={info.checksum} good={isIdentified} />
        </div>

        <div className="relative mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-black"><Wrench size={16} className="text-[var(--ak-glow)]" /> Compatible tools</div>
          <div className="flex flex-wrap gap-2 text-xs font-bold text-white/64">
            {(info.tools || defaultInfo.tools || []).map((tool) => <span key={tool} className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1">{tool}</span>)}
          </div>
        </div>

        {info.notes && info.notes.length > 0 && (
          <div className="relative mt-5 space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-5 text-white/40">
            {info.notes.map((note) => <p key={note}>• {note}</p>)}
          </div>
        )}
      </div>
    </AKCard>
  )
}

function TechBox({ label, value, good, icon }: { label: string; value: string; good?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/30">{icon}{label}</p>
      <p className={`mt-1 truncate font-black ${good ? 'text-[var(--ak-green)]' : 'text-white'}`}>{value}</p>
    </div>
  )
}
