'use client'

import { useEffect, useState } from 'react'
import { Clock3, Radio } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type PublicStatus = {
  status: 'online' | 'busy' | 'closed'
  manual_override?: boolean
  message?: string | null
  estimated_minutes?: number | null
  today_hours?: [string, string] | null
  timezone?: string
  updated_at?: string
}

export default function LaboratoryStatusBanner() {
  const [state, setState] = useState<PublicStatus | null>(null)

  async function load() {
    const { data, error } = await supabase.rpc('get_ak_laboratory_public_status')
    if (!error && data) setState(data as PublicStatus)
  }

  useEffect(() => {
    load()
    const channel = supabase
      .channel('ak-laboratory-status-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ak_laboratory_status' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  if (!state) return null

  const meta = state.status === 'online'
    ? { label: 'Laboratorio online', cls: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200', dot: 'bg-emerald-400' }
    : state.status === 'busy'
      ? { label: 'Laboratorio · alta carga', cls: 'border-amber-400/20 bg-amber-400/10 text-amber-200', dot: 'bg-amber-400' }
      : { label: 'Laboratorio cerrado', cls: 'border-white/10 bg-white/[.04] text-white/55', dot: 'bg-white/35' }

  const hours = Array.isArray(state.today_hours) && state.today_hours.length === 2
    ? `${state.today_hours[0]}–${state.today_hours[1]}`
    : null

  return (
    <div className="mb-5 rounded-2xl border border-white/[.08] bg-[#0b0c0e]/90 px-4 py-3 shadow-xl backdrop-blur sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`mt-0.5 inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[.12em] ${meta.cls}`}>
            <i className={`h-2 w-2 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
          <div className="min-w-0 text-xs leading-5 text-white/45">
            {state.message || (state.status === 'closed' ? 'Puedes enviar tu archivo igualmente. Quedará en cola para el laboratorio.' : 'Recepción de archivos activa.')}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-white/30">
          {hours && <span className="inline-flex items-center gap-1.5"><Clock3 size={13}/>{hours}</span>}
          {state.estimated_minutes != null && state.status !== 'closed' && <span className="inline-flex items-center gap-1.5"><Radio size={13}/>≈ {state.estimated_minutes} min</span>}
        </div>
      </div>
    </div>
  )
}
