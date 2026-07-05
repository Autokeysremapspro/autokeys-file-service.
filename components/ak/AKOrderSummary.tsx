import AKCard from './AKCard'
import AKButton from './AKButton'
import type { AKService } from './AKServiceCard'
import { Clock3, Send, ShieldCheck } from 'lucide-react'

export default function AKOrderSummary({ services, total, fileName, loading, onSubmit }: { services: AKService[]; total: number; fileName?: string | null; loading?: boolean; onSubmit: () => void }) {
  return (
    <AKCard className="sticky top-6 p-6">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--ak-glow)]">Order Summary</p>
      <h3 className="mt-2 text-2xl font-black">Build request</h3>
      <div className="mt-5 rounded-2xl border border-white/10 bg-black/24 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-white/30">ORI file</p>
        <p className="mt-1 truncate text-sm font-black">{fileName || 'No file selected'}</p>
      </div>
      <div className="mt-4 space-y-3">
        {services.length === 0 ? <p className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-white/30">Select compatible services to continue.</p> : services.map((service) => (
          <div key={service.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-sm">
            <span>{service.icon} {service.name}</span><strong>{service.price} €</strong>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-5">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-white/30">Estimated total</p>
          <p className="mt-1 flex items-center gap-2 text-xs text-[var(--ak-green)]"><ShieldCheck size={14} /> VAT/tariff ready</p>
        </div>
        <strong className="text-4xl text-[var(--ak-glow)]">{total} €</strong>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/24 p-3 text-xs font-bold text-white/40">
        <Clock3 size={15} className="text-[var(--ak-blue)]" /> Estimated processing: 18-25 min
      </div>
      <AKButton className="mt-5 w-full" disabled={!fileName || services.length === 0 || loading} onClick={onSubmit}>
        <Send size={17} /> {loading ? 'Sending request...' : 'Send request'}
      </AKButton>
    </AKCard>
  )
}
