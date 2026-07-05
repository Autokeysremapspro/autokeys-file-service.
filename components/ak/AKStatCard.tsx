import AKCard from './AKCard'

export default function AKStatCard({ label, value, helper, tone = 'red' }: { label: string; value: string; helper?: string; tone?: 'red' | 'green' | 'blue' | 'orange' }) {
  const tones = {
    red: 'text-[var(--ak-glow)]',
    green: 'text-[var(--ak-green)]',
    blue: 'text-[var(--ak-blue)]',
    orange: 'text-orange-400',
  }
  return (
    <AKCard className="p-5">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">{label}</p>
      <div className={`mt-3 text-3xl font-black ${tones[tone]}`}>{value}</div>
      {helper && <p className="mt-1 text-sm text-white/35">{helper}</p>}
    </AKCard>
  )
}
