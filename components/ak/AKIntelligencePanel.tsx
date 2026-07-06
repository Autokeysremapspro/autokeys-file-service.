import { Brain, CheckCircle2, Cpu, Database, Gauge, History, ShieldCheck, Sparkles, Wrench, Zap } from 'lucide-react'
import AKCard from './AKCard'
import type { AkDetectedEcu } from '@/lib/services/intelligence'

export default function AKIntelligencePanel({ visible, info }: { visible: boolean; info: AkDetectedEcu }) {
  if (!visible) {
    return (
      <AKCard className="p-6">
        <div className="flex min-h-[360px] flex-col items-center justify-center text-center text-white/30">
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.8rem] border border-white/10 bg-white/[0.035]">
            <Brain size={42} />
          </div>
          <h3 className="mt-5 text-xl font-black text-white/60">AK Intelligence</h3>
          <p className="mt-2 max-w-xs text-sm leading-6">Sube un ORI y AK Cloud preparará una ficha técnica visual del archivo.</p>
        </div>
      </AKCard>
    )
  }

  const riskClass = info.riesgo === 'Bajo'
    ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
    : info.riesgo === 'Medio'
      ? 'border-amber-500/25 bg-amber-500/10 text-amber-300'
      : 'border-red-500/25 bg-red-500/10 text-red-300'

  return (
    <AKCard className="overflow-hidden">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(217,4,41,.24),transparent_42%),rgba(255,255,255,.025)] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--ak-glow)]">AK Intelligence</p>
            <h3 className="mt-2 text-2xl font-black">ECU identificada</h3>
            <p className="mt-1 text-sm text-white/40">Análisis visual preparado para detección real en futuras versiones.</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--ak-red)]/25 bg-[var(--ak-red)]/10 text-[var(--ak-glow)] shadow-[0_0_50px_rgba(217,4,41,.22)]">
            <Cpu size={27} />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-5 rounded-[1.7rem] border border-white/10 bg-black/30 p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="text-2xl font-black">{info.marca} {info.modelo}</div>
              <div className="mt-1 text-sm font-bold text-white/45">{info.motor} · {info.anio} · {info.cv}</div>
            </div>
            <div className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${riskClass}`}>Riesgo {info.riesgo}</div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Info icon={<Cpu size={16} />} label="ECU" value={info.ecu} />
            <Info icon={<Database size={16} />} label="Familia" value={info.familia} />
            <Info icon={<Wrench size={16} />} label="Hardware" value={info.hw} />
            <Info icon={<Gauge size={16} />} label="Software" value={info.sw} />
            <Info icon={<ShieldCheck size={16} />} label="Checksum" value={info.checksum} />
            <Info icon={<Zap size={16} />} label="Cambio" value={info.cambio || '—'} />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-white/35">Herramientas compatibles</p>
            <div className="flex flex-wrap gap-2">
              {info.herramientas.map((tool) => (
                <span key={tool} className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-black text-emerald-300">
                  <CheckCircle2 size={14} /> {tool}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-white/35">Recomendado por AK</p>
            <div className="space-y-2">
              {info.recomendaciones.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-2xl bg-black/25 px-3 py-2 text-sm font-bold text-white/70">
                  <Sparkles size={15} className="text-[var(--ak-glow)]" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {info.historial.conocido && (
          <div className="mt-4 rounded-[1.5rem] border border-[var(--ak-red)]/25 bg-[var(--ak-red)]/10 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--ak-red)]/15 text-[var(--ak-glow)]"><History size={20} /></div>
              <div>
                <p className="text-sm font-black text-white">Vehículo / ECU con historial Autokeys</p>
                <p className="mt-1 text-sm text-white/45">{info.historial.ultimoTrabajo} · {info.historial.fecha}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(info.historial.servicios || []).map((service) => (
                    <span key={service} className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-black text-white/60">{service}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AKCard>
  )
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-white/30">{icon}{label}</div>
      <div className="mt-1 truncate text-sm font-black text-white/75">{value}</div>
    </div>
  )
}
