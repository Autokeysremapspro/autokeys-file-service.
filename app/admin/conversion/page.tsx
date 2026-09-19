'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, RefreshCw, Target, TrendingUp, Users } from 'lucide-react'
import AKPageShell from '@/components/ak/AKPageShell'

type Stage = { eventName: string; count: number }
type Campaign = { source: string; medium: string; campaign: string; visits: number; registrations: number; checkouts: number; payments: number }
type Report = { days: number; events: number; stages: Stage[]; campaigns: Campaign[] }

const FUNNEL = [
  ['landing_view', 'Visitas'],
  ['register_view', 'Ven el registro'],
  ['registration_completed', 'Crean la cuenta'],
  ['email_confirmed', 'Confirman el email'],
  ['first_order_started', 'Empiezan el pedido'],
  ['checkout_started', 'Llegan al pago'],
  ['payment_completed', 'Compran'],
] as const

function percent(value: number, base: number) {
  if (!base) return '—'
  return `${Math.round((value / base) * 100)}%`
}

export default function ConversionPage() {
  const [days, setDays] = useState(30)
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/conversion?days=${days}`, { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error)
      setReport(payload)
    } catch (err: any) {
      setError(err?.message || 'No se pudo cargar el embudo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [days])

  const counts = useMemo(() => new Map((report?.stages || []).map((stage) => [stage.eventName, stage.count])), [report])
  const visits = counts.get('landing_view') || 0
  const registrations = counts.get('registration_completed') || 0
  const payments = counts.get('payment_completed') || 0

  return (
    <AKPageShell title="Embudo de conversión" subtitle="Descubre dónde abandonan los usuarios y qué campañas generan pedidos reales." eyebrow="Control comercial">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">{[7, 30, 90].map((value) => <button key={value} onClick={() => setDays(value)} className={`rounded-xl border px-4 py-2 text-xs font-bold ${days === value ? 'border-red-500/50 bg-red-500/15 text-white' : 'border-white/10 text-white/45'}`}>{value} días</button>)}</div>
        <button onClick={load} disabled={loading} className="ak5-secondary !px-4 !py-2"><RefreshCw size={15} className={loading ? 'animate-spin' : ''}/> Actualizar</button>
      </div>

      {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
      {!error && (
        <>
          <section className="grid gap-3 md:grid-cols-3">
            <Metric icon={Users} label="Visitas" value={visits} detail={`${days} días`} />
            <Metric icon={Target} label="Registro / visita" value={percent(registrations, visits)} detail={`${registrations} cuentas`} />
            <Metric icon={TrendingUp} label="Compra / visita" value={percent(payments, visits)} detail={`${payments} pagos`} />
          </section>

          <section className="ak10-panel mt-5 overflow-hidden">
            <div className="border-b border-white/[.08] px-5 py-4"><h2 className="text-sm font-black">Recorrido completo</h2><p className="mt-1 text-xs text-white/40">Cada persona se cuenta una sola vez por etapa.</p></div>
            <div className="grid gap-3 p-4 lg:grid-cols-7">
              {FUNNEL.map(([eventName, label], index) => {
                const value = counts.get(eventName) || 0
                const previous = index === 0 ? value : counts.get(FUNNEL[index - 1][0]) || 0
                return <div key={eventName} className="relative rounded-2xl border border-white/[.08] bg-black/20 p-4"><div className="text-[10px] font-black uppercase tracking-wider text-white/35">{label}</div><div className="mt-2 text-3xl font-black">{value}</div><div className="mt-1 text-xs text-red-300">{index === 0 ? 'Base' : percent(value, previous)}</div>{index < FUNNEL.length - 1 && <ArrowRight size={14} className="absolute -right-[15px] top-1/2 hidden text-white/20 lg:block"/>}</div>
              })}
            </div>
          </section>

          <section className="ak10-panel mt-5 overflow-hidden">
            <div className="border-b border-white/[.08] px-5 py-4"><h2 className="text-sm font-black">Campañas y procedencia</h2><p className="mt-1 text-xs text-white/40">Usa enlaces con utm_source, utm_medium y utm_campaign en Meta, Instagram o TikTok.</p></div>
            <div className="overflow-x-auto"><table className="ak10-table"><thead><tr><th>Fuente</th><th>Medio</th><th>Campaña</th><th>Visitas</th><th>Registros</th><th>Pagos iniciados</th><th>Compras</th></tr></thead><tbody>{report?.campaigns?.length ? report.campaigns.map((item) => <tr key={`${item.source}-${item.medium}-${item.campaign}`}><td className="font-bold">{item.source}</td><td>{item.medium}</td><td>{item.campaign}</td><td>{item.visits}</td><td>{item.registrations}</td><td>{item.checkouts}</td><td className="font-black text-emerald-400">{item.payments}</td></tr>) : <tr><td colSpan={7} className="py-10 text-center text-white/35">Todavía no hay datos en este periodo.</td></tr>}</tbody></table></div>
          </section>
        </>
      )}
    </AKPageShell>
  )
}

function Metric({ icon: Icon, label, value, detail }: { icon: any; label: string; value: string | number; detail: string }) {
  return <div className="ak10-panel flex items-center gap-4 p-5"><span className="grid h-11 w-11 place-items-center rounded-xl border border-red-500/25 bg-red-500/10 text-red-300"><Icon size={20}/></span><div><div className="text-xs text-white/40">{label}</div><div className="text-3xl font-black">{value}</div><div className="text-[11px] text-white/30">{detail}</div></div></div>
}
