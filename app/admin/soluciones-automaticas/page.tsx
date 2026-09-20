'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Cpu, FlaskConical, Loader2, PackageCheck, Save, ShieldCheck, UploadCloud, XCircle } from 'lucide-react'
import AKPageShell from '@/components/ak/AKPageShell'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import { supabase } from '@/lib/supabase'
import type { AutomaticSolution } from '@/lib/automatic-solutions/types'

const EMPTY_FORM = { name: '', serviceCode: '', serviceName: '', ecu: '', hw: '', sw: '', vehicleNotes: '' }

export default function AutomaticSolutionsAdminPage() {
  const [solutions, setSolutions] = useState<AutomaticSolution[]>([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [ori, setOri] = useState<File | null>(null)
  const [mod, setMod] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [technicalNotes, setTechnicalNotes] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  async function load() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/automatic-solutions', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error)
      setSolutions(payload.solutions || [])
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo cargar la biblioteca' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const stats = useMemo(() => ({
    total: solutions.length,
    testing: solutions.filter((item) => item.status === 'testing').length,
    verified: solutions.filter((item) => item.status === 'verified').length,
    published: solutions.filter((item) => item.status === 'published').length,
  }), [solutions])

  function update(key: keyof typeof EMPTY_FORM, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function createSolution() {
    if (!ori || !mod) return setMessage({ type: 'error', text: 'Selecciona el ORI exacto y su MOD validado.' })
    setSaving(true)
    setMessage(null)
    try {
      const prepareResponse = await fetch('/api/admin/automatic-solutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oriName: ori.name, oriSize: ori.size, modName: mod.name, modSize: mod.size }),
      })
      const prepared = await prepareResponse.json()
      if (!prepareResponse.ok) throw new Error(prepared.error)
      const [oriUpload, modUpload] = await Promise.all([
        supabase.storage.from(prepared.bucket).uploadToSignedUrl(prepared.uploads.ori.path, prepared.uploads.ori.token, ori),
        supabase.storage.from(prepared.bucket).uploadToSignedUrl(prepared.uploads.mod.path, prepared.uploads.mod.token, mod),
      ])
      if (oriUpload.error) throw oriUpload.error
      if (modUpload.error) throw modUpload.error

      const finalizeResponse = await fetch(`/api/admin/automatic-solutions/${prepared.solutionId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, oriName: ori.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120), modName: mod.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120), oriPath: prepared.uploads.ori.path, modPath: prepared.uploads.mod.path }),
      })
      const finalized = await finalizeResponse.json()
      if (!finalizeResponse.ok) throw new Error(finalized.error)
      setForm(EMPTY_FORM)
      setOri(null)
      setMod(null)
      setMessage({ type: 'ok', text: 'Solución guardada en pruebas. Ejecuta ahora la verificación interna.' })
      await load()
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo crear la solución' })
    } finally {
      setSaving(false)
    }
  }

  async function action(id: string, nextAction: 'run_verification' | 'approve_technical' | 'publish' | 'retire') {
    setBusyId(id)
    setMessage(null)
    try {
      const response = await fetch(`/api/admin/automatic-solutions/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: nextAction, notes: technicalNotes[id] || '', confirmation: nextAction === 'approve_technical' ? 'CONFIRMO_PRUEBA_TECNICA' : undefined }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error)
      setMessage({ type: 'ok', text: nextAction === 'run_verification' ? 'Integridad comprobada. Falta confirmar la prueba técnica real.' : nextAction === 'approve_technical' ? 'Prueba técnica documentada y solución verificada.' : nextAction === 'publish' ? 'Solución preparada como publicada. El acceso cliente continúa bloqueado por el interruptor general.' : 'Solución retirada.' })
      await load()
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo completar la acción' })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AKPageShell title="Soluciones automáticas" subtitle="Laboratorio aislado para validar pares ORI/MOD antes de habilitar la compra automática." eyebrow="Laboratorio · No publicado">
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Biblioteca" value={stats.total} />
        <Metric label="En pruebas" value={stats.testing} />
        <Metric label="Verificadas" value={stats.verified} />
        <Metric label="Publicables" value={stats.published} />
      </div>

      <div className="mb-5 rounded-2xl border border-amber-400/25 bg-amber-400/[.07] p-4 text-sm text-amber-100">
        <strong className="block">Modo laboratorio</strong>
        Ninguna solución aparece al cliente mientras el interruptor AK_AUTO_SOLUTIONS_ENABLED permanezca desactivado.
      </div>

      {message && <div className={`mb-5 rounded-2xl border p-4 text-sm ${message.type === 'ok' ? 'border-emerald-400/25 bg-emerald-400/[.07] text-emerald-100' : 'border-red-400/25 bg-red-400/[.07] text-red-100'}`}>{message.text}</div>}

      <div className="grid gap-5 2xl:grid-cols-[390px_1fr]">
        <AKCard className="p-5">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-red-500/10 text-red-300"><UploadCloud size={20}/></span><div><h2 className="font-black">Nuevo par ORI/MOD</h2><p className="text-xs text-white/40">Precio bloqueado: 44,90 €</p></div></div>
          <div className="mt-5 space-y-4">
            <Field label="Nombre interno" value={form.name} onChange={(value) => update('name', value)} placeholder="EDC17C64 Golf 7 Stage 1" />
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Código servicio" value={form.serviceCode} onChange={(value) => update('serviceCode', value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} placeholder="stage1" /><Field label="Nombre cliente" value={form.serviceName} onChange={(value) => update('serviceName', value)} placeholder="Stage 1" /></div>
            <Field label="ECU" value={form.ecu} onChange={(value) => update('ecu', value)} placeholder="EDC17C64" />
            <div className="grid gap-3 sm:grid-cols-2"><Field label="HW" value={form.hw} onChange={(value) => update('hw', value)} placeholder="Opcional" /><Field label="SW" value={form.sw} onChange={(value) => update('sw', value)} placeholder="Opcional" /></div>
            <Field label="Vehículo / notas" value={form.vehicleNotes} onChange={(value) => update('vehicleNotes', value)} placeholder="Motor, año, herramienta..." />
            <FileField label="Archivo ORI exacto" file={ori} onChange={setOri} />
            <FileField label="Archivo MOD validado" file={mod} onChange={setMod} />
          </div>
          <AKButton className="mt-5 w-full" onClick={createSolution} disabled={saving}><Save size={17}/>{saving ? 'Subiendo y calculando hashes...' : 'Guardar en laboratorio'}</AKButton>
        </AKCard>

        <div className="space-y-4">
          {loading ? <AKCard className="p-8 text-white/40">Cargando biblioteca...</AKCard> : solutions.length === 0 ? <AKCard className="p-8 text-white/40">Todavía no hay soluciones automáticas.</AKCard> : solutions.map((solution) => (
            <AKCard key={solution.id} className="p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Status status={solution.status}/><span className="text-xs font-bold text-white/35">{solution.service_name} · 44,90 €</span></div><h3 className="mt-2 text-xl font-black">{solution.name}</h3><p className="mt-1 text-sm text-white/45">{solution.ecu} · HW {solution.hw || '—'} · SW {solution.sw || '—'}</p></div>
                <div className="flex flex-wrap gap-2">
                  {!['published', 'retired'].includes(solution.status) && <button disabled={busyId === solution.id} onClick={() => action(solution.id, 'run_verification')} className="ak5-secondary !px-3 !py-2 text-xs"><FlaskConical size={15}/> Verificar</button>}
                  {solution.status === 'verified' && <button disabled={busyId === solution.id} onClick={() => action(solution.id, 'publish')} className="ak5-secondary !border-emerald-400/30 !px-3 !py-2 text-xs text-emerald-200"><PackageCheck size={15}/> Preparar publicación</button>}
                  {solution.status === 'published' && <button disabled={busyId === solution.id} onClick={() => action(solution.id, 'retire')} className="ak5-secondary !px-3 !py-2 text-xs"><XCircle size={15}/> Retirar</button>}
                </div>
              </div>
              <div className="mt-4 grid gap-3 text-xs md:grid-cols-3"><Info label="ORI SHA-256" value={solution.ori_sha256} /><Info label="MOD SHA-256" value={solution.mod_sha256} /><Info label="Verificación" value={solution.verification_suite?.technicalApproved === true ? 'Integridad + prueba técnica' : solution.verification_suite?.integrityPassed === true ? 'Integridad 3/3 · falta prueba técnica' : 'Pendiente'} /></div>
              {solution.status === 'testing' && solution.verification_suite?.integrityPassed === true && <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/[.05] p-4"><label className="block"><span className="text-[10px] font-black uppercase tracking-wider text-amber-200">Prueba técnica real obligatoria</span><textarea value={technicalNotes[solution.id] || ''} onChange={(event) => setTechnicalNotes((current) => ({ ...current, [solution.id]: event.target.value }))} placeholder="Vehículo/banco, herramienta, escritura correcta, diagnosis posterior y resultado comprobado..." className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-black/25 p-3 text-sm outline-none focus:border-amber-400/50" /></label><button disabled={busyId === solution.id || (technicalNotes[solution.id] || '').trim().length < 10} onClick={() => action(solution.id, 'approve_technical')} className="ak5-secondary mt-3 !border-amber-400/30 !px-3 !py-2 text-xs text-amber-100 disabled:opacity-40"><ShieldCheck size={15}/> Confirmar prueba técnica</button></div>}
            </AKCard>
          ))}
        </div>
      </div>
    </AKPageShell>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) { return <label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-[.18em] text-white/35">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-white/10 bg-black/25 px-3.5 py-3 text-sm outline-none focus:border-red-500/50" /></label> }
function FileField({ label, file, onChange }: { label: string; file: File | null; onChange: (file: File | null) => void }) { return <label className="block rounded-xl border border-dashed border-white/15 bg-white/[.025] p-3"><span className="block text-[10px] font-black uppercase tracking-[.18em] text-white/35">{label}</span><input type="file" accept=".bin,.ori,.hex,.mod" onChange={(event) => onChange(event.target.files?.[0] || null)} className="mt-2 block w-full text-xs text-white/55 file:mr-3 file:rounded-lg file:border-0 file:bg-red-500/15 file:px-3 file:py-2 file:font-bold file:text-red-200" />{file && <span className="mt-2 block truncate text-xs text-emerald-300">{file.name} · {(file.size / 1024).toFixed(1)} KB</span>}</label> }
function Status({ status }: { status: AutomaticSolution['status'] }) { const ok = status === 'verified' || status === 'published'; return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${ok ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200' : status === 'retired' ? 'border-white/10 bg-white/[.04] text-white/40' : 'border-amber-400/25 bg-amber-400/10 text-amber-200'}`}>{ok ? <CheckCircle2 size={12}/> : status === 'testing' ? <Loader2 size={12}/> : <ShieldCheck size={12}/>} {status}</span> }
function Metric({ label, value }: { label: string; value: number }) { return <AKCard className="flex items-center gap-3 p-4"><Cpu size={18} className="text-red-300"/><div><div className="text-[10px] font-black uppercase tracking-wider text-white/30">{label}</div><div className="text-2xl font-black">{value}</div></div></AKCard> }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/10 bg-black/20 p-3"><div className="text-[9px] font-black uppercase tracking-wider text-white/30">{label}</div><div className="mt-1 truncate font-mono text-[11px] text-white/60" title={value}>{value}</div></div> }
