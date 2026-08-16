'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Cpu, Plus, RefreshCw, Save, Search, ShieldCheck, Trash2 } from 'lucide-react'
import AppShell from '@/components/AppShell'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import { DEFAULT_SERVICES, DEFAULT_TOOLS, SERVICE_LABELS, createEcuRule, csvToArray, csvToNumberArray, deleteEcuRule, getAllEcuRules, type EcuDbRule } from '@/lib/services/ecuDatabase'

type FormState = { fabricante: string; ecu: string; familia: string; marcas: string; vehiculo: string; modelo: string; motor: string; potencia: string; par_nm: string; potencia_stage1: string; anios: string; herramientas: string; servicios: string; patrones: string; tamanos: string; notas: string }
type AuditData = {
  ok: boolean
  read_only: boolean
  generated_at: string
  totals: { fingerprints: number; signatures: number; fingerprint_issues: number; signature_issues: number }
  issues: { fingerprints: Array<{ type: string; id?: string }>; signatures: Array<{ type: string; id?: string }> }
}

const emptyForm: FormState = { fabricante: 'Bosch', ecu: '', familia: '', marcas: '', vehiculo: '', modelo: '', motor: '', potencia: '', par_nm: '', potencia_stage1: '', anios: '', herramientas: DEFAULT_TOOLS.join(', '), servicios: DEFAULT_SERVICES.join(', '), patrones: '', tamanos: '', notas: '' }

const ISSUE_LABELS: Record<string, string> = {
  fingerprint_without_rule: 'Huella sin regla enlazada',
  fingerprint_not_human_confirmed: 'Huella sin confirmación humana',
  fingerprint_invalid_ecu: 'Huella con ECU inválida',
  fingerprint_hw_not_canonical: 'HW de huella no canónico',
  fingerprint_sw_not_canonical: 'SW de huella no canónico',
  fingerprint_ecu_not_canonical: 'ECU de huella no canónica',
  fingerprint_brand_not_canonical: 'Marca de huella no canónica',
  fingerprint_model_not_canonical: 'Modelo de huella no canónico',
  signature_without_human_confirmation: 'Firma sin confirmación humana',
  signature_invalid_identity: 'Firma con identidad incompleta o inválida',
  signature_key_not_canonical: 'Clave de firma no canónica',
  signature_hw_not_canonical: 'HW de firma no canónico',
  signature_sw_not_canonical: 'SW de firma no canónico',
  signature_invalid_confirmation_count: 'Contador de confirmaciones inválido',
}

export default function EcuDatabasePage() {
  const [rules, setRules] = useState<EcuDbRule[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [audit, setAudit] = useState<AuditData | null>(null)
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditError, setAuditError] = useState<string | null>(null)

  async function load() { setLoading(true); setError(null); try { setRules(await getAllEcuRules()) } catch (err: any) { setError(err?.message || 'No se pudieron cargar las reglas ECU') } finally { setLoading(false) } }
  async function loadAudit() {
    setAuditLoading(true); setAuditError(null)
    try {
      const response = await fetch('/api/ecu/audit', { method: 'GET', cache: 'no-store', credentials: 'include' })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'No se pudo ejecutar la auditoría ECU')
      setAudit(data as AuditData)
    } catch (err: any) {
      setAuditError(err?.message || 'No se pudo ejecutar la auditoría ECU')
    } finally { setAuditLoading(false) }
  }

  useEffect(() => { load(); loadAudit() }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rules
    return rules.filter((rule) => [rule.fabricante, rule.ecu, rule.familia, rule.vehiculo, rule.motor, rule.marcas?.join(' '), rule.herramientas?.join(' '), rule.servicios?.join(' '), rule.patrones?.join(' ')].some((value) => (value || '').toLowerCase().includes(q)))
  }, [rules, query])

  const auditIssueCount = audit ? audit.totals.fingerprint_issues + audit.totals.signature_issues : 0
  const auditGroups = useMemo(() => {
    if (!audit) return [] as Array<[string, number]>
    const counts = new Map<string, number>()
    for (const issue of [...audit.issues.fingerprints, ...audit.issues.signatures]) counts.set(issue.type, (counts.get(issue.type) || 0) + 1)
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  }, [audit])

  function setField(key: keyof FormState, value: string) { setForm((current) => ({ ...current, [key]: value })) }

  async function submit() {
    if (!form.ecu.trim() || !form.familia.trim()) { setError('Añade al menos ECU y familia.'); return }
    setSaving(true); setError(null)
    try {
      await createEcuRule({ fabricante: form.fabricante.trim() || null, ecu: form.ecu.trim(), familia: form.familia.trim(), marcas: csvToArray(form.marcas), vehiculo: form.vehiculo.trim() || null, modelo: form.modelo.trim() || null, motor: form.motor.trim() || null, potencia: form.potencia.trim() || null, par_nm: form.par_nm.trim() || null, potencia_stage1: form.potencia_stage1.trim() || null, anios: form.anios.trim() || null, herramientas: csvToArray(form.herramientas), servicios: csvToArray(form.servicios), patrones: csvToArray(form.patrones), tamanos: csvToNumberArray(form.tamanos), notas: form.notas.trim() || null, activo: true })
      setForm(emptyForm); await load(); await loadAudit()
    } catch (err: any) { setError(err?.message || 'No se pudo guardar la regla') } finally { setSaving(false) }
  }

  async function remove(rule: EcuDbRule) {
    if (!rule.id) return
    if (!confirm(`¿Eliminar regla ${rule.ecu}?`)) return
    try { await deleteEcuRule(rule.id); await load(); await loadAudit() } catch (err: any) { setError(err?.message || 'No se pudo eliminar la regla') }
  }

  return (
    <AppShell>
      <section className="flex-1">
        <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--ak-glow)]">AK Detection Engine</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">ECU Database</h1>
            <p className="mt-2 max-w-3xl text-sm text-white/40">Reglas de detección y control de calidad del conocimiento ECU. La auditoría es solo lectura y nunca modifica archivos ni identificaciones.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--ak-green)]/25 bg-[var(--ak-green)]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--ak-green)]"><ShieldCheck size={15} /> {rules.length} reglas</div>
        </div>

        {error && <div className="mb-5 rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

        <AKCard className="mb-6 p-5 md:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${auditIssueCount > 0 ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
                  {auditIssueCount > 0 ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                </div>
                <div>
                  <h2 className="text-xl font-black">Auditoría de conocimiento ECU</h2>
                  <p className="text-sm text-white/35">Diagnóstico seguro y solo lectura de huellas y firmas verificadas.</p>
                </div>
              </div>
              {audit?.generated_at && <p className="mt-3 text-xs text-white/25">Última revisión: {new Date(audit.generated_at).toLocaleString('es-ES')}</p>}
            </div>
            <AKButton onClick={loadAudit} disabled={auditLoading}><RefreshCw size={17} className={auditLoading ? 'animate-spin' : ''} /> {auditLoading ? 'Auditando…' : 'Revisar ahora'}</AKButton>
          </div>

          {auditError ? <div className="mt-4 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200">{auditError}</div> : null}
          {audit ? (
            <div className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AuditMetric label="Huellas" value={audit.totals.fingerprints} />
                <AuditMetric label="Firmas" value={audit.totals.signatures} />
                <AuditMetric label="Avisos en huellas" value={audit.totals.fingerprint_issues} warning={audit.totals.fingerprint_issues > 0} />
                <AuditMetric label="Avisos en firmas" value={audit.totals.signature_issues} warning={audit.totals.signature_issues > 0} />
              </div>
              {auditGroups.length ? (
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {auditGroups.map(([type, count]) => <div key={type} className="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] px-4 py-3 text-sm"><span className="text-white/55">{ISSUE_LABELS[type] || type}</span><span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-black text-amber-300">{count}</span></div>)}
                </div>
              ) : <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4 text-sm text-emerald-200">No se han detectado inconsistencias en huellas o firmas.</div>}
            </div>
          ) : !auditLoading && !auditError ? <p className="mt-4 text-sm text-white/30">Auditoría pendiente.</p> : null}
        </AKCard>

        <div className="grid gap-6 2xl:grid-cols-[480px_1fr]">
          <AKCard className="p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ak-red)]/15 text-[var(--ak-glow)]"><Plus size={22} /></div><div><h2 className="text-2xl font-black">Nueva regla</h2><p className="text-sm text-white/35">Añade patrones propios para mejorar la detección.</p></div></div>
            <div className="grid gap-3">
              <Field label="Fabricante ECU" value={form.fabricante} onChange={(v) => setField('fabricante', v)} placeholder="Bosch, Delphi, Continental..." />
              <Field label="ECU" value={form.ecu} onChange={(v) => setField('ecu', v)} placeholder="Bosch EDC17C64" />
              <Field label="Familia" value={form.familia} onChange={(v) => setField('familia', v)} placeholder="EDC17C64" />
              <Field label="Marcas" value={form.marcas} onChange={(v) => setField('marcas', v)} placeholder="Audi, Volkswagen, SEAT" />
              <Field label="Vehículo / plataforma" value={form.vehiculo} onChange={(v) => setField('vehiculo', v)} placeholder="VAG 2.0 TDI" />
              <div className="grid gap-3 md:grid-cols-2"><Field label="Motor" value={form.motor} onChange={(v) => setField('motor', v)} placeholder="2.0 TDI" /><Field label="Potencia origen" value={form.potencia} onChange={(v) => setField('potencia', v)} placeholder="150 CV" /></div>
              <div className="grid gap-3 md:grid-cols-2"><Field label="Par motor origen" value={form.par_nm} onChange={(v) => setField('par_nm', v)} placeholder="320 Nm" /><Field label="Potencia tras Stage 1" value={form.potencia_stage1} onChange={(v) => setField('potencia_stage1', v)} placeholder="190 CV" /></div>
              <Field label="Herramientas" value={form.herramientas} onChange={(v) => setField('herramientas', v)} placeholder="Magic FLEX, KESS3" />
              <Field label="Servicios compatibles" value={form.servicios} onChange={(v) => setField('servicios', v)} placeholder="stage1, dpf, egr" />
              <Field label="Patrones de detección" value={form.patrones} onChange={(v) => setField('patrones', v)} placeholder="edc17c64, 04l\\s*906, 1037\\d{6,}" />
              <Field label="Tamaños en bytes" value={form.tamanos} onChange={(v) => setField('tamanos', v)} placeholder="2097152, 4194304" />
              <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/35">Notas</span><textarea value={form.notas} onChange={(e) => setField('notas', e.target.value)} className="h-24 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[var(--ak-red)]/60" /></label>
            </div>
            <AKButton className="mt-5 w-full" onClick={submit} disabled={saving}><Save size={18} /> {saving ? 'Guardando...' : 'Guardar regla'}</AKButton>
          </AKCard>

          <div className="space-y-5">
            <AKCard className="p-4"><div className="flex items-center gap-3"><Search size={20} className="text-white/35" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar ECU, HW, SW, marca, herramienta o servicio..." className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-white/25" /></div></AKCard>
            {loading ? <AKCard className="p-8 text-white/35">Cargando reglas...</AKCard> : filtered.length === 0 ? <AKCard className="p-8 text-white/35">No hay reglas que coincidan.</AKCard> : <div className="grid gap-4 xl:grid-cols-2">{filtered.map((rule) => <AKCard key={rule.id || rule.ecu} className="p-5"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-glow)]"><Cpu size={15} /> {rule.fabricante || 'ECU'}</div><h3 className="mt-2 text-2xl font-black">{rule.ecu}</h3><p className="mt-1 text-sm text-white/40">{rule.vehiculo || 'Vehículo no definido'} · {rule.motor || 'Motor —'} · {rule.potencia || 'CV —'}</p></div><button onClick={() => remove(rule)} className="rounded-2xl border border-red-500/25 bg-red-500/10 p-3 text-red-200 transition hover:bg-red-500/20"><Trash2 size={18} /></button></div><div className="mt-5 grid gap-3 text-xs md:grid-cols-2"><Info label="Familia" value={rule.familia} /><Info label="Años" value={rule.anios || '—'} /><Info label="Marcas" value={rule.marcas?.join(', ') || '—'} /><Info label="Tamaños" value={(rule.tamanos || []).map((size) => `${(size / 1024 / 1024).toFixed(1)} MB`).join(', ') || '—'} /><Info label="Par motor origen" value={rule.par_nm || '—'} /><Info label="Potencia Stage 1" value={rule.potencia_stage1 || '—'} /></div><div className="mt-4 flex flex-wrap gap-2">{(rule.servicios || []).map((service) => <span key={service} className="rounded-full border border-[var(--ak-red)]/20 bg-[var(--ak-red)]/10 px-3 py-1 text-xs font-bold text-[var(--ak-glow)]">{SERVICE_LABELS[service] || service}</span>)}</div><div className="mt-4 flex flex-wrap gap-2">{(rule.herramientas || []).map((tool) => <span key={tool} className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-bold text-white/50">{tool}</span>)}</div></AKCard>)}</div>}
          </div>
        </div>
      </section>
    </AppShell>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) { return <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/35">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[var(--ak-red)]/60" /></label> }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-black/25 p-3"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">{label}</p><p className="mt-1 truncate font-bold text-white/70">{value}</p></div> }
function AuditMetric({ label, value, warning = false }: { label: string; value: number; warning?: boolean }) { return <div className={`rounded-2xl border p-4 ${warning ? 'border-amber-500/15 bg-amber-500/[0.04]' : 'border-white/10 bg-black/20'}`}><p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">{label}</p><p className={`mt-1 text-2xl font-black ${warning ? 'text-amber-300' : 'text-white/80'}`}>{value}</p></div> }
