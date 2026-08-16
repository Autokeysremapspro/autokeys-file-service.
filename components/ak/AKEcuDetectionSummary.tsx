'use client'

import { AlertTriangle, CheckCircle2, Info, ScanLine, ShieldCheck } from 'lucide-react'
import { canUseVerifiedEcuPrefill } from '@/lib/ecu/safePrefill'

export type AKEcuDetection = {
  identified: boolean
  status?: string
  method: string
  confidence: number
  review_required?: boolean
  lab_decision_required?: boolean
  ecu_file_modification_automated?: boolean
  final_decision_owner?: string
  vehiculo?: string | null
  marca?: string | null
  modelo?: string | null
  motor?: string | null
  ecu?: string | null
  hw?: string | null
  sw?: string | null
  evidence?: string[]
  missing_information?: string[]
  suggested_services?: string[]
  guidance?: {
    level?: 'verified' | 'warning' | 'info' | string
    label?: string
    safe_to_prefill?: boolean
    client_action?: string
  }
  quality?: {
    usable?: boolean
    verdict?: string
    quality_score?: number
    completeness?: string
    warnings?: string[]
  }
}

function tone(level?: string) {
  if (level === 'verified') return {
    shell: 'border-emerald-500/25 bg-emerald-500/[.06]',
    icon: 'text-emerald-300',
    badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
    Icon: CheckCircle2,
  }
  if (level === 'warning') return {
    shell: 'border-amber-500/25 bg-amber-500/[.06]',
    icon: 'text-amber-300',
    badge: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
    Icon: AlertTriangle,
  }
  return {
    shell: 'border-cyan-500/20 bg-cyan-500/[.05]',
    icon: 'text-cyan-300',
    badge: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200',
    Icon: Info,
  }
}

function methodLabel(method: string) {
  if (method === 'huella_exacta_confirmada') return 'Huella exacta confirmada'
  if (method === 'firma_verificada') return 'Firma verificada'
  if (method.includes('ambigua')) return 'Revisión manual obligatoria'
  if (method === 'calidad_archivo_dudosa') return 'Lectura dudosa'
  return 'Sin identificación confirmada'
}

export default function AKEcuDetectionSummary({ detection, onApply }: { detection: AKEcuDetection; onApply?: () => void }) {
  const guidance = detection.guidance || {}
  const visual = tone(guidance.level)
  const Icon = visual.Icon
  const verifiedDetection = canUseVerifiedEcuPrefill(detection)
  const safeToPrefill = verifiedDetection
  const vehicle = [detection.marca, detection.modelo, detection.motor].filter(Boolean).join(' ')
  const confidence = Number.isFinite(detection.confidence) ? Math.max(0, Math.min(100, detection.confidence)) : 0
  const suggestedServices = verifiedDetection ? Array.from(new Set((detection.suggested_services || []).filter(Boolean))) : []

  return (
    <div className={`mt-4 rounded-2xl border p-4 ${visual.shell}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Icon size={18} className={`mt-0.5 shrink-0 ${visual.icon}`} />
          <div className="min-w-0">
            <div className="font-bold text-white">{guidance.label || (detection.identified ? 'Identificación verificada' : 'Revisión necesaria')}</div>
            <p className="mt-1 text-sm leading-6 text-white/55">{guidance.client_action || 'Completa los datos técnicos y deja la decisión final al laboratorio.'}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className={`ak-mono rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${visual.badge}`}>{methodLabel(detection.method)}</span>
          <span className="ak-mono rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/55">Confianza {confidence}%</span>
        </div>
      </div>

      {(vehicle || detection.ecu || detection.hw || detection.sw) && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <Data label="Vehículo" value={vehicle || detection.vehiculo || 'Pendiente'} />
          <Data label="ECU" value={detection.ecu || 'Pendiente'} />
          <Data label="HW" value={detection.hw || 'No extraído'} />
          <Data label="SW" value={detection.sw || 'No extraído'} />
        </div>
      )}

      {detection.quality && (
        <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-white/55">Calidad {typeof detection.quality.quality_score === 'number' ? `${detection.quality.quality_score}%` : '—'}</span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-white/55">{detection.quality.usable ? 'Lectura utilizable' : 'Lectura a revisar'}</span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-white/55">Datos {detection.quality.completeness || 'sin valorar'}</span>
        </div>
      )}

      {detection.quality?.warnings?.length ? (
        <div className="mt-4 space-y-2">
          {detection.quality.warnings.map((warning) => <div key={warning} className="flex items-start gap-2 rounded-xl border border-amber-400/15 bg-black/15 px-3 py-2 text-xs leading-5 text-white/55"><AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-300" />{warning}</div>)}
        </div>
      ) : null}

      {detection.evidence?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {detection.evidence.map((item) => <span key={item} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-200">{item}</span>)}
        </div>
      ) : null}

      {suggestedServices.length ? (
        <div className="mt-4 rounded-xl border border-cyan-400/15 bg-black/15 p-3">
          <div className="text-[10px] font-black uppercase tracking-[.18em] text-cyan-300/80">Servicios compatibles de referencia</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestedServices.map((service) => <span key={service} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold text-cyan-200">{service}</span>)}
          </div>
          <p className="mt-2 text-[11px] leading-5 text-white/35">No se selecciona ningún servicio automáticamente. El cliente elige qué solicita y el laboratorio valida la compatibilidad final.</p>
        </div>
      ) : null}

      {detection.missing_information?.length ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {detection.missing_information.map((item) => <div key={item} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/55"><ScanLine size={14} className="shrink-0 text-cyan-300" />{item}</div>)}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-xs text-white/45">
          <div className="flex items-center gap-2"><ShieldCheck size={15} className="text-cyan-300" />La decisión técnica final pertenece siempre al laboratorio.</div>
          {verifiedDetection && <div className="pl-[23px] text-white/35">Datos verificados disponibles. Solo se completan los campos vacíos; cualquier dato escrito por el cliente se conserva.</div>}
          {!verifiedDetection && <div className="pl-[23px] text-white/35">Autorrelleno bloqueado: completa o confirma los datos manualmente.</div>}
        </div>
        {safeToPrefill && onApply ? (
          <button type="button" onClick={onApply} className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/20">Usar datos verificados</button>
        ) : null}
      </div>
    </div>
  )
}

function Data({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-xl border border-white/10 bg-black/20 px-3 py-2"><div className="text-[9px] font-black uppercase tracking-[.18em] text-white/30">{label}</div><div className="mt-1 break-words text-xs font-bold text-white/70">{value}</div></div>
}
