import AKCard from './AKCard'
import { Cpu, Gauge, ShieldCheck, Wrench, Zap } from 'lucide-react'

export type AKECUInfo = {
  vehicle: string
  engine: string
  ecu: string
  power: string
  year: string
  hw: string
  sw: string
  checksum: string
}

const defaultInfo: AKECUInfo = {
  vehicle: 'Audi A4 B8',
  engine: '2.0 TDI',
  ecu: 'Bosch EDC17C64',
  power: '150 CV',
  year: '2014-2018',
  hw: '1037XXXXXX',
  sw: 'SW 5521',
  checksum: 'OK',
}

export default function AKECUCard({ visible = false, info = defaultInfo }: { visible?: boolean; info?: AKECUInfo }) {
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
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[var(--ak-green)]/12 blur-3xl" />
        <div className="relative flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--ak-green)]">ECU identified</p>
            <h3 className="mt-2 text-3xl font-black tracking-tight">{info.ecu}</h3>
            <p className="mt-1 text-sm text-white/42">{info.vehicle} · {info.engine} · {info.power}</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-[var(--ak-green)]/25 bg-[var(--ak-green)]/10 text-[var(--ak-green)]"><ShieldCheck size={31} /></div>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-3 text-sm">
          <TechBox label="Vehicle" value={info.vehicle} icon={<Gauge size={16} />} />
          <TechBox label="Engine" value={info.engine} icon={<Zap size={16} />} />
          <TechBox label="Hardware" value={info.hw} />
          <TechBox label="Software" value={info.sw} />
          <TechBox label="Year" value={info.year} />
          <TechBox label="Checksum" value={info.checksum} good />
        </div>

        <div className="relative mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-black"><Wrench size={16} className="text-[var(--ak-glow)]" /> Compatible tools</div>
          <div className="flex flex-wrap gap-2 text-xs font-bold text-white/64">
            {['Magic FLEX', 'KESS3', 'Autotuner', 'CMDFlash', 'PCMFlash'].map((tool) => <span key={tool} className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1">{tool}</span>)}
          </div>
        </div>
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
