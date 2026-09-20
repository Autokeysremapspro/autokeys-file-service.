'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Archive,
  Beaker,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Cpu,
  FileSearch,
  FlaskConical,
  History,
  Layers3,
  Loader2,
  LockKeyhole,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  TestTube2,
  Wrench,
  XCircle,
} from 'lucide-react'
import AKCard from '@/components/ak/AKCard'
import AKPageShell from '@/components/ak/AKPageShell'

type SolutionStatus = 'draft' | 'testing' | 'verified' | 'published' | 'retired'

type Solution = {
  id: string
  name: string
  service_code: string
  service_name: string
  ecu: string
  hw: string | null
  sw: string | null
  vehicle_notes: string | null
  ori_size: number
  mod_size: number
  status: SolutionStatus
  verification_suite: Record<string, boolean | string | number | null>
  verified_at: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

type Test = {
  id: string
  solution_id: string
  test_type: string
  status: 'passed' | 'failed'
  notes: string | null
  created_at: string
}

type Scan = {
  id: string
  ori_name: string
  status: string
  match_count: number
  created_at: string
  analyzed_at: string | null
}

type Audit = {
  id: number
  solution_id: string | null
  action: string
  metadata: Record<string, unknown>
  created_at: string
}

type Overview = {
  schemaReady: boolean
  mode: 'laboratory' | 'customer'
  customerAccess: boolean
  paymentsEnabled: boolean
  pricePerFile: number
  solutions: Solution[]
  tests: Test[]
  scans: Scan[]
  audit: Audit[]
}

const EMPTY: Overview = {
  schemaReady: false,
  mode: 'laboratory',
  customerAccess: false,
  paymentsEnabled: false,
  pricePerFile: 44.9,
  solutions: [],
  tests: [],
  scans: [],
  audit: [],
}

const tabs = [
  ['resumen', 'Resumen', Activity],
  ['compatibilidades', 'Compatibilidades', Cpu],
  ['soluciones', 'Soluciones', Layers3],
  ['procesos', 'Procesos', Wrench],
  ['pruebas', 'Pruebas', TestTube2],
  ['pendientes', 'Pendientes', AlertTriangle],
  ['historial', 'Historial', History],
  ['configuracion', 'Configuración', Settings2],
] as const

type TabId = (typeof tabs)[number][0]

export default function MotorAutomaticoClient() {
  const [data, setData] = useState<Overview>(EMPTY)
  const [activeTab, setActiveTab] = useState<TabId>('resumen')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/automatic-solutions/overview', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'No se pudo cargar el motor')
      setData(payload)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar el motor')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const stats = useMemo(() => {
    const pendingScans = data.scans.filter((scan) => ['no_match', 'awaiting_upload'].includes(scan.status)).length
    return {
      total: data.solutions.length,
      testing: data.solutions.filter((solution) => solution.status === 'testing').length,
      verified: data.solutions.filter((solution) => ['verified', 'published'].includes(solution.status)).length,
      pending: data.solutions.filter((solution) => ['draft', 'testing'].includes(solution.status)).length + pendingScans,
    }
  }, [data])

  return (
    <AKPageShell
      eyebrow="AK Cloud · Administración interna"
      title="Motor automático"
      subtitle="Control de compatibilidades, soluciones, pruebas y publicaciones. El cliente no ve esta información."
      actions={
        <div className="flex gap-2">
          <button type="button" onClick={() => void load()} className="ak5-secondary !px-3 !py-2.5" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar
          </button>
          <Link href="/admin/soluciones-automaticas" className="ak5-primary !px-3 !py-2.5"><Plus size={16} /> Nueva compatibilidad</Link>
        </div>
      }
    >
      <section className="mb-5 grid gap-3 md:grid-cols-3">
        <ModeCard icon={FlaskConical} label="Estado del motor" value="Laboratorio" tone="amber" detail="Sin acceso de clientes" />
        <ModeCard icon={CircleDollarSign} label="Precio fijo" value={`${data.pricePerFile.toFixed(2).replace('.', ',')} €`} tone="neutral" detail="Pago único por archivo" />
        <ModeCard icon={LockKeyhole} label="Pagos" value="Bloqueados" tone="red" detail="Se activarán después de validar" />
      </section>

      {!data.schemaReady && !loading && !error && (
        <div className="mb-5 rounded-2xl border border-amber-400/25 bg-amber-400/[.07] p-4 text-sm text-amber-100">
          <strong className="block">Entorno preparado, base de laboratorio pendiente</strong>
          La consola está instalada, pero las tablas privadas todavía no se han aplicado. No se ha modificado la base de producción.
        </div>
      )}

      {error && <div className="mb-5 rounded-2xl border border-red-400/25 bg-red-400/[.07] p-4 text-sm text-red-100">{error}</div>}

      <div className="mb-5 overflow-x-auto rounded-2xl border border-white/[.08] bg-black/20 p-1.5">
        <nav className="flex min-w-max gap-1" aria-label="Secciones del motor">
          {tabs.map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition ${activeTab === id ? 'bg-red-500 text-white shadow-[0_8px_30px_rgba(239,35,45,.22)]' : 'text-white/45 hover:bg-white/[.05] hover:text-white'}`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <AKCard className="grid min-h-[360px] place-items-center p-8 text-white/45"><div className="flex items-center gap-3"><Loader2 className="animate-spin" /> Cargando motor...</div></AKCard>
      ) : (
        <>
          {activeTab === 'resumen' && <Summary data={data} stats={stats} setTab={setActiveTab} />}
          {activeTab === 'compatibilidades' && <Compatibilities solutions={data.solutions} />}
          {activeTab === 'soluciones' && <Services solutions={data.solutions} />}
          {activeTab === 'procesos' && <Processes solutions={data.solutions} />}
          {activeTab === 'pruebas' && <Tests tests={data.tests} solutions={data.solutions} />}
          {activeTab === 'pendientes' && <Pending solutions={data.solutions} scans={data.scans} />}
          {activeTab === 'historial' && <AuditLog audit={data.audit} solutions={data.solutions} />}
          {activeTab === 'configuracion' && <Configuration data={data} />}
        </>
      )}
    </AKPageShell>
  )
}

function Summary({ data, stats, setTab }: { data: Overview; stats: { total: number; testing: number; verified: number; pending: number }; setTab: (tab: TabId) => void }) {
  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={Archive} label="Compatibilidades" value={stats.total} />
      <Metric icon={Beaker} label="En pruebas" value={stats.testing} />
      <Metric icon={ShieldCheck} label="Verificadas" value={stats.verified} />
      <Metric icon={Clock3} label="Pendientes" value={stats.pending} alert={stats.pending > 0} />
    </div>
    <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
      <AKCard className="p-5">
        <SectionTitle title="Flujo de publicación" subtitle="Ningún proceso llega al cliente sin completar todas las fases." />
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <FlowStep number="01" title="Cargar" detail="ORI y archivo validado" />
          <FlowStep number="02" title="Probar" detail="Integridad y coincidencia" />
          <FlowStep number="03" title="Verificar" detail="Prueba real documentada" />
          <FlowStep number="04" title="Publicar" detail="Acceso aún bloqueado" />
        </div>
      </AKCard>
      <AKCard className="p-5">
        <SectionTitle title="Control de seguridad" subtitle="Bloqueos activos en esta fase." />
        <div className="mt-4 space-y-2">
          <Guard label="Acceso de clientes" locked={!data.customerAccess} />
          <Guard label="Cobros automáticos" locked={!data.paymentsEnabled} />
          <Guard label="Precio por archivo" locked detail="44,90 €" />
          <Guard label="Publicación sin verificar" locked />
        </div>
      </AKCard>
    </div>
    <AKCard className="p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <SectionTitle title="Siguiente acción" subtitle="Empieza cargando una compatibilidad real y ejecutando sus pruebas internas." />
        <button type="button" onClick={() => setTab('pendientes')} className="ak5-secondary !px-3 !py-2.5">Revisar pendientes <ChevronRight size={16} /></button>
      </div>
    </AKCard>
  </div>
}

function Compatibilities({ solutions }: { solutions: Solution[] }) {
  return <AKCard className="p-5">
    <SectionTitle title="Compatibilidades" subtitle="Archivos base conocidos por el motor y su estado de validación." action={<Link href="/admin/soluciones-automaticas" className="ak5-primary !px-3 !py-2"><Plus size={15}/> Añadir</Link>} />
    <DataState empty={solutions.length === 0} text="Todavía no hay compatibilidades cargadas.">
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/30"><th className="pb-3">Compatibilidad</th><th className="pb-3">ECU</th><th className="pb-3">HW / SW</th><th className="pb-3">Solución</th><th className="pb-3">Estado</th><th className="pb-3">Actualizada</th></tr></thead><tbody>{solutions.map((item) => <tr key={item.id} className="border-b border-white/[.06] last:border-0"><td className="py-4"><div className="font-bold">{item.name}</div><div className="mt-1 max-w-[260px] truncate text-xs text-white/35">{item.vehicle_notes || 'Sin notas de vehículo'}</div></td><td className="py-4 font-mono text-xs text-red-200">{item.ecu}</td><td className="py-4 text-xs text-white/50">{item.hw || '—'} / {item.sw || '—'}</td><td className="py-4">{item.service_name}</td><td className="py-4"><Status status={item.status}/></td><td className="py-4 text-xs text-white/35">{date(item.updated_at)}</td></tr>)}</tbody></table></div>
    </DataState>
  </AKCard>
}

function Services({ solutions }: { solutions: Solution[] }) {
  const groups = useMemo(() => Object.values(solutions.reduce<Record<string, { code: string; name: string; total: number; verified: number }>>((result, item) => {
    const current = result[item.service_code] || { code: item.service_code, name: item.service_name, total: 0, verified: 0 }
    current.total += 1
    if (['verified', 'published'].includes(item.status)) current.verified += 1
    result[item.service_code] = current
    return result
  }, {})), [solutions])
  return <AKCard className="p-5"><SectionTitle title="Catálogo de soluciones" subtitle="Servicios detectables. El cliente podrá marcar varios sin aumentar el precio por archivo."/><DataState empty={groups.length === 0} text="El catálogo se formará al cargar las primeras compatibilidades."><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{groups.map((group) => <div key={group.code} className="rounded-2xl border border-white/[.08] bg-black/20 p-4"><div className="flex items-start justify-between gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/10 text-red-300"><SlidersHorizontal size={18}/></span><span className="rounded-full bg-white/[.05] px-2.5 py-1 text-[10px] font-bold uppercase text-white/40">{group.code}</span></div><h3 className="mt-4 font-black">{group.name}</h3><p className="mt-1 text-xs text-white/40">{group.total} compatibilidades · {group.verified} verificadas</p></div>)}</div></DataState></AKCard>
}

function Processes({ solutions }: { solutions: Solution[] }) {
  return <AKCard className="p-5"><SectionTitle title="Procesos del motor" subtitle="Cada proceso permanece bloqueado hasta superar integridad y prueba técnica."/><DataState empty={solutions.length === 0} text="No hay procesos configurados."><div className="mt-5 space-y-3">{solutions.map((item) => { const integrity = item.verification_suite?.integrityPassed === true; const technical = item.verification_suite?.technicalApproved === true; return <div key={item.id} className="rounded-2xl border border-white/[.08] bg-black/20 p-4"><div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center"><div><div className="font-bold">{item.name}</div><div className="mt-1 text-xs text-white/35">{item.ecu} · {item.service_name}</div></div><div className="flex flex-wrap gap-2"><MiniCheck label="Archivo" ok/><MiniCheck label="Integridad" ok={integrity}/><MiniCheck label="Prueba real" ok={technical}/><MiniCheck label="Publicable" ok={item.status === 'published'}/></div></div></div>})}</div></DataState></AKCard>
}

function Tests({ tests, solutions }: { tests: Test[]; solutions: Solution[] }) {
  const byId = Object.fromEntries(solutions.map((solution) => [solution.id, solution.name]))
  return <AKCard className="p-5"><SectionTitle title="Resultados de pruebas" subtitle="Comprobaciones automáticas registradas por el laboratorio."/><DataState empty={tests.length === 0} text="Todavía no se ha ejecutado ninguna prueba."><div className="mt-5 space-y-2">{tests.map((test) => <div key={test.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-white/[.08] bg-black/20 p-4 sm:flex-row sm:items-center"><div><div className="font-bold">{labelTest(test.test_type)}</div><div className="mt-1 text-xs text-white/35">{byId[test.solution_id] || 'Compatibilidad'} · {date(test.created_at)}</div></div><span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${test.status === 'passed' ? 'bg-emerald-400/10 text-emerald-200' : 'bg-red-400/10 text-red-200'}`}>{test.status === 'passed' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>} {test.status === 'passed' ? 'Superada' : 'Fallida'}</span></div>)}</div></DataState></AKCard>
}

function Pending({ solutions, scans }: { solutions: Solution[]; scans: Scan[] }) {
  const pendingSolutions = solutions.filter((solution) => ['draft', 'testing'].includes(solution.status))
  const pendingScans = scans.filter((scan) => ['no_match', 'awaiting_upload'].includes(scan.status))
  return <div className="grid gap-5 xl:grid-cols-2"><AKCard className="p-5"><SectionTitle title="Validación pendiente" subtitle="Procesos que todavía no pueden publicarse."/><DataState empty={pendingSolutions.length === 0} text="No hay validaciones pendientes."><div className="mt-5 space-y-2">{pendingSolutions.map((item) => <Link key={item.id} href="/admin/soluciones-automaticas" className="flex items-center justify-between gap-3 rounded-2xl border border-white/[.08] bg-black/20 p-4 hover:border-red-400/30"><div><div className="font-bold">{item.name}</div><div className="mt-1 text-xs text-white/35">{item.ecu} · {item.service_name}</div></div><ChevronRight size={17} className="text-white/30"/></Link>)}</div></DataState></AKCard><AKCard className="p-5"><SectionTitle title="Archivos sin coincidencia" subtitle="Casos reales que podrán ampliar la biblioteca."/><DataState empty={pendingScans.length === 0} text="No hay archivos pendientes de revisar."><div className="mt-5 space-y-2">{pendingScans.map((scan) => <div key={scan.id} className="rounded-2xl border border-white/[.08] bg-black/20 p-4"><div className="truncate font-bold">{scan.ori_name}</div><div className="mt-1 text-xs text-white/35">{scan.status === 'no_match' ? 'Sin coincidencia' : 'Carga incompleta'} · {date(scan.created_at)}</div></div>)}</div></DataState></AKCard></div>
}

function AuditLog({ audit, solutions }: { audit: Audit[]; solutions: Solution[] }) {
  const byId = Object.fromEntries(solutions.map((solution) => [solution.id, solution.name]))
  return <AKCard className="p-5"><SectionTitle title="Historial del motor" subtitle="Registro de creación, pruebas, verificaciones y publicaciones."/><DataState empty={audit.length === 0} text="El historial aparecerá con la primera operación."><div className="mt-5 space-y-1">{audit.map((item) => <div key={item.id} className="grid grid-cols-[34px_1fr] gap-3 border-b border-white/[.06] py-3 last:border-0"><span className="grid h-8 w-8 place-items-center rounded-full bg-white/[.05] text-white/45"><History size={14}/></span><div><div className="text-sm font-bold">{labelAction(item.action)}</div><div className="mt-1 text-xs text-white/35">{item.solution_id ? byId[item.solution_id] || 'Compatibilidad eliminada' : 'Motor automático'} · {dateTime(item.created_at)}</div></div></div>)}</div></DataState></AKCard>
}

function Configuration({ data }: { data: Overview }) {
  return <div className="grid gap-5 xl:grid-cols-2"><AKCard className="p-5"><SectionTitle title="Activación" subtitle="Los cambios de producción requieren verificación final."/><div className="mt-5 space-y-3"><Setting label="Modo laboratorio" value="Activo" checked/><Setting label="Acceso de clientes" value="Bloqueado"/><Setting label="Procesamiento automático" value="Bloqueado"/><Setting label="Cobros" value="Bloqueados"/></div></AKCard><AKCard className="p-5"><SectionTitle title="Reglas comerciales" subtitle="Condiciones que no dependen del número de soluciones."/><div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/[.06] p-5"><div className="text-[10px] font-black uppercase tracking-[.18em] text-red-200">Precio fijo por archivo</div><div className="mt-2 text-4xl font-black">{data.pricePerFile.toFixed(2).replace('.', ',')} €</div><p className="mt-2 text-sm text-white/45">Un único pago incluye todas las soluciones compatibles seleccionadas para ese archivo.</p></div><div className="mt-3 rounded-2xl border border-white/[.08] bg-black/20 p-4 text-sm text-white/55"><strong className="block text-white">Integración con Autokeys Core</strong><span className="mt-1 block">Pendiente. Core recibirá solo pedido, importe y estado cuando el motor esté validado.</span></div></AKCard></div>
}

function ModeCard({ icon: Icon, label, value, detail, tone }: { icon: typeof FlaskConical; label: string; value: string; detail: string; tone: 'amber' | 'red' | 'neutral' }) { const styles = tone === 'amber' ? 'border-amber-400/20 bg-amber-400/[.06] text-amber-200' : tone === 'red' ? 'border-red-400/20 bg-red-400/[.06] text-red-200' : 'border-white/[.08] bg-white/[.025] text-white'; return <div className={`flex items-center gap-3 rounded-2xl border p-4 ${styles}`}><span className="grid h-10 w-10 place-items-center rounded-xl bg-black/25"><Icon size={18}/></span><div><div className="text-[9px] font-black uppercase tracking-[.18em] opacity-60">{label}</div><div className="font-black">{value}</div><div className="text-[11px] opacity-55">{detail}</div></div></div> }
function Metric({ icon: Icon, label, value, alert }: { icon: typeof Archive; label: string; value: number; alert?: boolean }) { return <AKCard className="flex items-center gap-4 p-5"><span className={`grid h-11 w-11 place-items-center rounded-xl ${alert ? 'bg-amber-400/10 text-amber-200' : 'bg-red-500/10 text-red-300'}`}><Icon size={19}/></span><div><div className="text-[9px] font-black uppercase tracking-[.18em] text-white/30">{label}</div><div className="text-2xl font-black">{value}</div></div></AKCard> }
function SectionTitle({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) { return <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h2 className="text-lg font-black">{title}</h2><p className="mt-1 text-sm text-white/40">{subtitle}</p></div>{action}</div> }
function FlowStep({ number, title, detail }: { number: string; title: string; detail: string }) { return <div className="rounded-2xl border border-white/[.08] bg-black/20 p-4"><span className="text-xs font-black text-red-300">{number}</span><div className="mt-4 font-black">{title}</div><div className="mt-1 text-xs text-white/35">{detail}</div></div> }
function Guard({ label, locked, detail }: { label: string; locked: boolean; detail?: string }) { return <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[.07] bg-black/20 px-3 py-2.5"><span className="text-sm text-white/60">{label}</span><span className={`flex items-center gap-1.5 text-xs font-bold ${locked ? 'text-emerald-200' : 'text-amber-200'}`}>{locked ? <LockKeyhole size={13}/> : <AlertTriangle size={13}/>} {detail || (locked ? 'Bloqueado' : 'Activo')}</span></div> }
function MiniCheck({ label, ok }: { label: string; ok: boolean }) { return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${ok ? 'border-emerald-400/20 bg-emerald-400/[.07] text-emerald-200' : 'border-white/10 bg-white/[.03] text-white/35'}`}>{ok ? <CheckCircle2 size={11}/> : <Clock3 size={11}/>} {label}</span> }
function Status({ status }: { status: SolutionStatus }) { const map: Record<SolutionStatus, string> = { draft: 'Borrador', testing: 'En pruebas', verified: 'Verificada', published: 'Publicada', retired: 'Retirada' }; const good = ['verified', 'published'].includes(status); return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${good ? 'border-emerald-400/20 bg-emerald-400/[.07] text-emerald-200' : status === 'retired' ? 'border-white/10 text-white/35' : 'border-amber-400/20 bg-amber-400/[.07] text-amber-200'}`}>{map[status]}</span> }
function Setting({ label, value, checked = false }: { label: string; value: string; checked?: boolean }) { return <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/[.08] bg-black/20 p-4"><div><div className="font-bold">{label}</div><div className="mt-1 text-xs text-white/35">{value}</div></div><span className={`relative h-6 w-11 rounded-full ${checked ? 'bg-red-500' : 'bg-white/10'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? 'left-6' : 'left-1'}`}/></span></div> }
function DataState({ empty, text, children }: { empty: boolean; text: string; children: React.ReactNode }) { if (!empty) return <>{children}</>; return <div className="mt-5 grid min-h-[240px] place-items-center rounded-2xl border border-dashed border-white/10 bg-black/15 p-8 text-center"><div><FileSearch className="mx-auto text-white/20" size={32}/><p className="mt-3 text-sm text-white/40">{text}</p></div></div> }
function labelTest(value: string) { return ({ ori_integrity: 'Integridad del archivo original', mod_integrity: 'Integridad del archivo procesado', exact_matching: 'Coincidencia exacta' } as Record<string, string>)[value] || value }
function labelAction(value: string) { return ({ solution_created: 'Compatibilidad creada', integrity_suite_passed: 'Pruebas de integridad superadas', integrity_suite_failed: 'Prueba de integridad fallida', technical_verification_approved: 'Prueba técnica aprobada', solution_published: 'Compatibilidad publicada', solution_retired: 'Compatibilidad retirada' } as Record<string, string>)[value] || value.replaceAll('_', ' ') }
function date(value: string) { return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) }
function dateTime(value: string) { return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) }
