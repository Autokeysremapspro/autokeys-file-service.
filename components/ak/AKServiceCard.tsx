import { Check, Lock } from 'lucide-react'

export type AKService = {
  id: string
  name: string
  description: string
  price: number
  icon: string
  compatible?: boolean
  category?: string
}

export default function AKServiceCard({ service, selected, onToggle }: { service: AKService; selected: boolean; onToggle: () => void }) {
  const locked = service.compatible === false
  return (
    <button
      type="button"
      onClick={() => !locked && onToggle()}
      disabled={locked}
      className={`group relative rounded-[1.7rem] border p-4 text-left transition duration-200 active:scale-[0.98] ${selected ? 'border-[var(--ak-red)] bg-[var(--ak-red)]/12 shadow-[0_0_45px_rgba(217,4,41,.22)]' : locked ? 'border-white/8 bg-white/[0.02] opacity-45' : 'border-white/10 bg-white/[0.035] hover:border-[var(--ak-red)]/35 hover:bg-white/[0.055]'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-2xl transition group-hover:scale-105">{service.icon}</div>
        {selected && <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ak-red)] text-white"><Check size={15} /></div>}
        {locked && <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/45"><Lock size={14} /></div>}
      </div>
      <div className="mt-4 text-base font-black text-white">{service.name}</div>
      <div className="mt-1 min-h-[38px] text-xs leading-5 text-white/38">{service.description}</div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-black text-[var(--ak-glow)]">{service.price} €</span>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${locked ? 'bg-white/5 text-white/25' : 'bg-[var(--ak-green)]/10 text-[var(--ak-green)]'}`}>{locked ? 'Locked' : 'Compatible'}</span>
      </div>
    </button>
  )
}
