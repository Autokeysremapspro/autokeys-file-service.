import { Check } from 'lucide-react'

export type AKService = {
  id: string
  name: string
  description: string
  price: number
  icon: string
  compatible?: boolean
}

export default function AKServiceCard({ service, selected, onToggle }: { service: AKService; selected: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group relative rounded-[1.6rem] border p-4 text-left transition duration-200 active:scale-[0.98] ${selected ? 'border-[var(--ak-red)] bg-[var(--ak-red)]/10 shadow-[0_0_35px_rgba(217,4,41,.22)]' : 'border-white/10 bg-white/[0.035] hover:border-[var(--ak-red)]/35 hover:bg-white/[0.055]'}`}
    >
      {selected && <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--ak-red)] text-white"><Check size={14} /></div>}
      <div className="text-3xl">{service.icon}</div>
      <div className="mt-3 text-base font-black text-white">{service.name}</div>
      <div className="mt-1 text-xs leading-5 text-white/38">{service.description}</div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-black text-[var(--ak-glow)]">{service.price} €</span>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${service.compatible === false ? 'bg-white/5 text-white/25' : 'bg-[var(--ak-green)]/10 text-[var(--ak-green)]'}`}>{service.compatible === false ? 'Locked' : 'Compatible'}</span>
      </div>
    </button>
  )
}
