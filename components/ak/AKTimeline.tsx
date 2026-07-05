'use client'

import { CheckCircle2, Clock, Download, Gauge, Wrench } from 'lucide-react'

const flow = [
  { key: 'recibido', label: 'Pedido recibido', icon: CheckCircle2 },
  { key: 'cola', label: 'En cola', icon: Clock },
  { key: 'proceso', label: 'Técnico trabajando', icon: Wrench },
  { key: 'calidad', label: 'Control de calidad', icon: Gauge },
  { key: 'descarga', label: 'Disponible para descargar', icon: Download },
]

export default function AKTimeline({ estado = 'pendiente' }: { estado?: string }) {
  const activeIndex = estado === 'finalizado' ? 4 : estado === 'en_proceso' ? 2 : estado === 'cancelado' ? 1 : 1

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Live Timeline</p>
      <div className="mt-5 space-y-4">
        {flow.map((item, index) => {
          const Icon = item.icon
          const active = index <= activeIndex
          return (
            <div key={item.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${active ? 'border-[var(--ak-green)]/30 bg-[var(--ak-green)]/12 text-[var(--ak-green)]' : 'border-white/10 bg-black/25 text-white/25'}`}>
                  <Icon size={18} />
                </div>
                {index !== flow.length - 1 && <div className={`mt-2 h-6 w-px ${active ? 'bg-[var(--ak-green)]/40' : 'bg-white/10'}`} />}
              </div>
              <div className="pt-2">
                <div className={`text-sm font-black ${active ? 'text-white' : 'text-white/30'}`}>{item.label}</div>
                <div className="text-xs text-white/30">{active ? 'Actualizado automáticamente' : 'Pendiente'}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
