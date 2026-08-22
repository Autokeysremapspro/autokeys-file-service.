'use client'

import { AlertTriangle, CheckCircle2, Clock, Download, Gauge, Wrench } from 'lucide-react'

const flow = [
  { key: 'recibido', label: 'Pedido recibido', icon: CheckCircle2 },
  { key: 'cola', label: 'En cola', icon: Clock },
  { key: 'proceso', label: 'Técnico trabajando', icon: Wrench },
  { key: 'respuesta', label: 'Prueba / respuesta', icon: Gauge },
  { key: 'descarga', label: 'Disponible para descargar', icon: Download },
]

function getTimelineState(estado?: string) {
  switch (estado) {
    case 'finalizado':
      return { activeIndex: 4, label: 'Trabajo finalizado', actionRequired: false }
    case 'esperando_prueba':
      return { activeIndex: 3, label: 'Esperando prueba del cliente', actionRequired: false }
    case 'revision_solicitada':
      return { activeIndex: 2, label: 'Acción requerida del cliente', actionRequired: true }
    case 'en_proceso':
      return { activeIndex: 2, label: 'Laboratorio trabajando', actionRequired: false }
    case 'cancelado':
      return { activeIndex: 1, label: 'Pedido cancelado', actionRequired: false }
    default:
      return { activeIndex: 1, label: 'Pedido recibido / en cola', actionRequired: false }
  }
}

export default function AKTimeline({ estado = 'pendiente', orientation = 'vertical' }: { estado?: string; orientation?: 'vertical' | 'horizontal' }) {
  const timelineState = getTimelineState(estado)

  if (orientation === 'horizontal') {
    return (
      <div className="ak5-card rounded-[22px] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          {flow.map((item, index) => {
            const Icon = item.icon
            const active = index <= timelineState.activeIndex
            const current = index === timelineState.activeIndex
            return (
              <div key={item.key} className="flex flex-1 items-center last:flex-none">
                <div className="flex shrink-0 flex-col items-center gap-2 text-center">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      current
                        ? 'border-[var(--ak-red)] bg-[var(--ak-red)]/15 text-white shadow-[0_0_22px_rgba(239,16,24,.35)]'
                        : active
                          ? 'border-[var(--ak-red)] bg-[var(--ak-red)] text-white'
                          : 'border-white/12 bg-black/25 text-white/25'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className={`hidden text-[10px] font-bold uppercase tracking-wider sm:block ${active ? 'text-white/80' : 'text-white/30'}`}>{item.label}</div>
                </div>
                {index !== flow.length - 1 && <div className={`mx-2 h-[2px] flex-1 rounded-full sm:mx-4 ${index < timelineState.activeIndex ? 'bg-[var(--ak-red)]' : 'bg-white/10'}`} />}
              </div>
            )
          })}
        </div>
        <p className={`mt-4 text-xs font-bold ${timelineState.actionRequired ? 'text-amber-300' : 'text-white/40'}`}>{timelineState.label}</p>
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Live Timeline</p>
          <p className={`mt-2 text-xs font-bold ${timelineState.actionRequired ? 'text-amber-300' : 'text-white/40'}`}>{timelineState.label}</p>
        </div>
        {timelineState.actionRequired && (
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
            <AlertTriangle size={17} />
          </div>
        )}
      </div>
      <div className="mt-5 space-y-4">
        {flow.map((item, index) => {
          const Icon = item.icon
          const active = index <= timelineState.activeIndex
          return (
            <div key={item.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${active ? 'border-[var(--ak-red)]/30 bg-[var(--ak-red)]/12 text-[var(--ak-glow)]' : 'border-white/10 bg-black/25 text-white/25'}`}>
                  <Icon size={18} />
                </div>
                {index !== flow.length - 1 && <div className={`mt-2 h-6 w-px ${active ? 'bg-[var(--ak-red)]/40' : 'bg-white/10'}`} />}
              </div>
              <div className="pt-2">
                <div className={`text-sm font-black ${active ? 'text-white' : 'text-white/30'}`}>{item.label}</div>
                <div className="text-xs text-white/30">{active ? 'Sincronizado con AK Core' : 'Pendiente'}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
