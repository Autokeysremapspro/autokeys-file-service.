'use client'

import { useEffect, useMemo, useState } from 'react'
import { Cpu, Plus, Search, Trash2, Save, ShieldCheck } from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import { DEFAULT_SERVICES, DEFAULT_TOOLS, SERVICE_LABELS, createEcuRule, csvToArray, csvToNumberArray, deleteEcuRule, getAllEcuRules, type EcuDbRule } from '@/lib/services/ecuDatabase'

type FormState = { fabricante: string; ecu: string; familia: string; marcas: string; vehiculo: string; modelo: string; motor: string; potencia: string; par_nm: string; potencia_stage1: string; anios: string; herramientas: string; servicios: string; patrones: string; tamanos: string; notas: string }
const emptyForm: FormState = { fabricante: 'Bosch', ecu: '', familia: '', marcas: '', vehiculo: '', modelo: '', motor: '', potencia: '', par_nm: '', potencia_stage1: '', anios: '', herramientas: DEFAULT_TOOLS.join(', '), servicios: DEFAULT_SERVICES.join(', '), patrones: '', tamanos: '', notas: '' }

export default function EcuDatabasePage() {
  const [rules, setRules] = useState<EcuDbRule[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  async function load() { setLoading(true); setError(null); try { setRules(await getAllEcuRules()) } catch (err: any) { setError(err?.message || 'No se pudieron cargar las reglas ECU') } finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rules
    return rules.filter((rule) => [rule.fabricante, rule.ecu, rule.familia, rule.vehiculo, rule.motor, rule.marcas?.join(' '), rule.herramientas?.join(' '), rule.servicios?.join(' '), rule.patrones?.join(' ')].some((value) => (value || '').toLowerCase().includes(q)))
  }, [rules, query])

  function setField(key: keyof FormState, value: string) { setForm((current) => ({ ...current, [key]: value })) }

  async function submit() {
    if (!form.ecu.trim() || !form.familia.trim()) { setError('Añade al menos ECU y familia.'); return }
    setSaving(true); setError(null)
    try {
      await createEcuRule({ fabricante: form.fabricante.trim() || null, ecu: form.ecu.trim(), familia: form.familia.trim(), marcas: csvToArray(form.marcas), vehiculo: form.vehiculo.trim() || null, modelo: form.modelo.trim() || null, motor: form.motor.trim() || null, potencia: form.potencia.trim() || null, par_nm: form.par_nm.trim() || null, potencia_stage1: form.potencia_stage1.trim() || null, anios: form.anios.trim() || null, herramientas: csvToArray(form.herramientas), servicios: csvToArray(form.servicios), patrones: csvToArray(form.patrones), tamanos: csvToNumberArray(form.tamanos), notas: form.notas.trim() || null, activo: true })
      setForm(emptyForm); await load()
    } catch (err: any) { setError(err?.message || 'No se pudo guardar la regla') } finally { setSaving(false) }
  }

  async function remove(rule: EcuDbRule) {
    if (!rule.id) return
    if (!confirm(`¿Eliminar regla ${rule.ecu}?`)) return
    try { await deleteEcuRule(rule.id); await load() } catch (err: any) { setError(err?.message || 'No se pudo eliminar la regla') }
  }

  return (
    <main className="ak-noise flex min-h-screen">
      <AKSidebar />
      <section className="flex-1 p-4 lg:p-8">
        <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--ak-glow)]">AK Detection Engine</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">ECU Database</h1>
            <p className="mt-2 max-w-3xl text-sm text-white/40">Reglas de detección para reconocer ECUs, HW/SW, herramientas y servicios compatibles.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--ak-green)]/25 bg-[var(--ak-green)]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--ak-green)]"><ShieldCheck size={15} /> {rules.length} reglas</div>
        </div>
        {error && <div className="mb-5 rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
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
    </main>
  )
}
function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) { return <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/35">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[var(--ak-red)]/60" /></label> }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-black/25 p-3"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">{label}</p><p className="mt-1 truncate font-bold text-white/70">{value}</p></div> }
