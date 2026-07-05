import AKCard from './AKCard'
import { Cpu, ShieldCheck, Wrench } from 'lucide-react'

export default function AKECUCard({ visible = false }: { visible?: boolean }) {
  if (!visible) {
    return (
      <AKCard className="p-6">
        <div className="flex h-[300px] flex-col items-center justify-center text-center text-white/30">
          <Cpu size={44} />
          <p className="mt-4 text-sm">Waiting for file analysis</p>
        </div>
      </AKCard>
    )
  }

  return (
    <AKCard className="overflow-hidden p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-green)]">ECU Identified</p>
          <h3 className="mt-2 text-2xl font-black">Bosch EDC17C64</h3>
          <p className="text-sm text-white/40">Audi A4 · 2.0 TDI · 150 CV</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ak-green)]/10 text-[var(--ak-green)]"><ShieldCheck size={26} /></div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-black/25 p-3"><p className="text-white/30">Hardware</p><p className="font-black">1037XXXXXX</p></div>
        <div className="rounded-2xl bg-black/25 p-3"><p className="text-white/30">Software</p><p className="font-black">SW 5521</p></div>
        <div className="rounded-2xl bg-black/25 p-3"><p className="text-white/30">Checksum</p><p className="font-black text-[var(--ak-green)]">OK</p></div>
        <div className="rounded-2xl bg-black/25 p-3"><p className="text-white/30">Risk</p><p className="font-black">Low</p></div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-black"><Wrench size={16} className="text-[var(--ak-glow)]" /> Compatible tools</div>
        <div className="flex flex-wrap gap-2 text-xs font-bold text-white/60">
          {['Magic FLEX', 'KESS3', 'Autotuner', 'CMDFlash', 'PCMFlash'].map((tool) => <span key={tool} className="rounded-full border border-white/10 bg-black/25 px-3 py-1">{tool}</span>)}
        </div>
      </div>
    </AKCard>
  )
}
