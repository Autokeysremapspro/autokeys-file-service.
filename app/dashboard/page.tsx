'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, CheckCircle2, Clock3, CloudUpload, Cpu, CreditCard, FileText, Gauge, MoreHorizontal, Rocket, ShieldOff, SlidersHorizontal, Sparkles, Timer, Upload, Waves } from 'lucide-react'
import AppShell from '@/components/AppShell'
import { getMisPedidos, type FileServicePedido, formatEstado } from '@/lib/services/pedidos'
import ConversionTracker from '@/components/analytics/ConversionTracker'

const quickServices = [
  ['Stage 1', 'Potencia', Rocket],
  ['Stage 2', 'Rendimiento máximo', Sparkles],
  ['DPF Off', 'Sin restricciones', ShieldOff],
  ['EGR Off', 'Admisión limpia', SlidersHorizontal],
  ['AdBlue Off', 'Sin limitaciones', Waves],
  ['Immo Off', 'Soluciones IMMO', Cpu],
  ['Hardcut', 'Corte a medida', Gauge],
  ['Pops & Bangs', 'Sonido deportivo', Waves],
] as const

function vehicleTitle(p?: FileServicePedido) {
  if (!p) return 'Sin servicios todavía'
  return [p.marca, p.modelo].filter(Boolean).join(' ') || p.ecu || p.ori_nombre || 'Vehículo pendiente'
}

function statusClass(status?: string | null) {
  if (status === 'finalizado') return 'border-emerald-500/35 bg-emerald-500/10 text-emerald-400'
  if (status === 'en_proceso') return 'border-blue-500/35 bg-blue-500/10 text-blue-400'
  if (status === 'cancelado') return 'border-white/15 bg-white/5 text-white/45'
  return 'border-amber-500/35 bg-amber-500/10 text-amber-400'
}

export default function DashboardPage() {
  const [pedidos, setPedidos] = useState<FileServicePedido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMisPedidos().then(setPedidos).catch(console.error).finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    const completed = pedidos.filter((p) => p.estado === 'finalizado').length
    const process = pedidos.filter((p) => p.estado === 'en_proceso').length
    const pending = pedidos.filter((p) => p.estado === 'pendiente').length
    const withTimes = pedidos.filter((p) => p.created_at && p.updated_at)
    const average = withTimes.length
      ? withTimes.reduce((total, p) => total + Math.max(0, new Date(p.updated_at as string).getTime() - new Date(p.created_at as string).getTime()), 0) / withTimes.length
      : 0
    const hours = Math.floor(average / 3600000)
    const minutes = Math.round((average % 3600000) / 60000)
    return { total: pedidos.length, completed, process, pending, average: average ? `${hours}h ${minutes}m` : '—' }
  }, [pedidos])

  const latest = pedidos.slice(0, 6)
  const current = pedidos.find((p) => p.estado === 'en_proceso') || pedidos[0]

  return (
    <AppShell>
      <ConversionTracker eventName="dashboard_view" />
      <div className="-mx-[22px] sm:-mx-[22px]">
        <section className="ak10-hero">
          <div className="ak10-hero-copy">
            <div className="ak10-hero-kicker">Autokeys Remaps Pro</div>
            <h1 className="ak10-hero-title">Rendimiento<br />sin <span>límites</span></h1>
            <div className="ak10-hero-sub">ECU solutions for a stronger tomorrow</div>
            <div className="mt-6 flex flex-wrap gap-8 text-[9px] font-bold uppercase tracking-[.16em] text-white/50">
              <span>Más potencia<br /><b className="text-white/80">Más posibilidades</b></span>
              <span>Experiencia<br /><b className="text-white/80">Real en el sector</b></span>
              <span>Soporte profesional<br /><b className="text-white/80">De talleres para talleres</b></span>
            </div>
          </div>
        </section>
      </div>

      {!loading && pedidos.length === 0 && (
        <section className="ak10-panel mt-4 overflow-hidden border-red-500/20">
          <div className="grid gap-6 p-5 md:p-7 xl:grid-cols-[1fr_auto] xl:items-center">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[.22em] text-red-400">Tu cuenta está lista</div>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">Crea tu primer pedido en pocos minutos</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Solo necesitas el archivo original. Si no conoces algún dato de la ECU, puedes escribir «revisar» y el laboratorio lo comprobará.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <OnboardingStep icon={CheckCircle2} number="1" title="Cuenta activa" text="Correo confirmado y acceso preparado." done />
                <OnboardingStep icon={CloudUpload} number="2" title="Sube el ORI" text="Formatos BIN, ORI, HEX o ZIP." />
                <OnboardingStep icon={CreditCard} number="3" title="Selecciona y paga" text="Precio visible antes de confirmar." />
              </div>
            </div>
            <Link href="/nuevo-pedido" className="ak5-primary min-h-[58px] justify-center !px-6 !py-4 text-base">
              <Upload size={19} /> Crear mi primer pedido <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}

      <section className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(250px,1.15fr)]">
        <DashboardStat label="Servicios totales" value={stats.total} detail="Histórico real" icon={FileText} />
        <DashboardStat label="Entregados" value={stats.completed} detail="Finalizados" icon={CheckCircle2} />
        <DashboardStat label="Pendientes" value={stats.pending} detail="En cola" icon={Clock3} />
        <DashboardStat label="Tiempo medio" value={stats.average} detail="Según tus pedidos" icon={Timer} />
        <Link href="/nuevo-pedido" className="ak5-primary flex min-h-[82px] items-center gap-4 !px-5 !py-3 !normal-case !tracking-normal">
          <span className="grid h-12 w-12 place-items-center rounded-full border border-white/25 bg-white/10"><Upload size={21} /></span>
          <span className="text-left"><span className="block text-lg font-black">Subir archivo</span><span className="block text-xs font-medium text-white/65">Inicia un nuevo servicio</span></span>
          <ArrowRight className="ml-auto" />
        </Link>
      </section>

      <section className="mt-4 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="ak10-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[.09] px-5 py-4">
            <h2 className="ak10-section-title">Últimos servicios</h2>
            <Link href="/pedidos" className="flex items-center gap-2 text-xs text-white/55 hover:text-white">Ver todos <ArrowRight size={14} /></Link>
          </div>
          {loading ? <div className="p-10 text-center text-sm text-white/35">Cargando servicios...</div> : latest.length === 0 ? <div className="p-10 text-center text-sm text-white/35">Aún no hay servicios. Sube tu primer archivo.</div> : (
            <div className="overflow-x-auto">
              <table className="ak10-table">
                <thead><tr><th>#</th><th>Vehículo</th><th>ECU</th><th>Servicio</th><th>Estado</th><th>Entrega</th><th /></tr></thead>
                <tbody>{latest.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono text-white/40">#{p.numero || p.id.slice(0, 4)}</td>
                    <td><div className="font-bold text-white/90">{vehicleTitle(p)}</div><div className="text-[10px] text-white/35">{[p.motor, p.cv].filter(Boolean).join(' · ') || p.ori_nombre}</div></td>
                    <td><div>{p.ecu || 'Revisar'}</div><div className="text-[10px] text-white/35">{p.hw || p.sw || '—'}</div></td>
                    <td className="font-semibold">{(p.servicios || []).slice(0, 2).join(' + ') || '—'}</td>
                    <td><span className={`ak10-status ${statusClass(p.estado)}`}>{formatEstado(p.estado)}</span></td>
                    <td className="text-white/55">{p.updated_at ? new Date(p.updated_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td><Link href={`/pedidos/${p.id}`} aria-label="Abrir servicio"><MoreHorizontal size={17} className="text-white/45" /></Link></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="ak10-panel p-4">
            <div className="flex items-center justify-between"><h3 className="text-sm font-bold">Estado del servicio</h3><span className="font-mono text-xs text-white/40">#{current?.numero || '—'}</span></div>
            <div className="mt-5 grid grid-cols-4 gap-1 text-center text-[9px] text-white/45">
              {['Recibido', 'En proceso', 'Validación', 'Completado'].map((label, index) => <div key={label}><span className={`mx-auto grid h-9 w-9 place-items-center rounded-full border ${index <= (current?.estado === 'finalizado' ? 3 : current?.estado === 'en_proceso' ? 1 : 0) ? 'border-red-500 bg-red-500/15 text-red-400 shadow-[0_0_18px_rgba(255,0,27,.25)]' : 'border-white/15 text-white/30'}`}>{index < 2 ? <Check size={15} /> : <FileText size={14} />}</span><span className="mt-2 block">{label}</span></div>)}
            </div>
          </div>
          <InfoCard title="Información del archivo" icon={FileText} lines={[current?.ori_nombre || 'Sin archivo seleccionado', current?.ori_size ? `${Math.round(current.ori_size / 1024 / 1024 * 10) / 10} MB` : 'Archivo ORI']} />
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
            <InfoCard title="Información del vehículo" icon={Gauge} lines={[vehicleTitle(current), [current?.motor, current?.cv].filter(Boolean).join(' · ') || 'Datos pendientes']} />
            <InfoCard title="Información de la ECU" icon={Cpu} lines={[current?.ecu || 'ECU pendiente', current?.hw || current?.sw || 'Identificación manual']} />
          </div>
        </div>
      </section>

      <section className="ak10-panel mt-4 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold"><CloudUpload size={19} className="text-red-400" /> Servicios rápidos</div>
        <div className="ak10-service-strip">{quickServices.map(([title, subtitle, Icon]) => <Link href="/nuevo-pedido" key={title} className="ak10-service-chip"><div className="flex items-center gap-2"><Icon size={17} className="text-red-400" /><strong className="text-xs">{title}</strong></div><div className="mt-1 text-[9px] text-white/35">{subtitle}</div></Link>)}</div>
      </section>
    </AppShell>
  )
}

function DashboardStat({ label, value, detail, icon: Icon }: { label: string; value: string | number; detail: string; icon: any }) {
  return <div className="ak10-panel ak10-stat"><span className="ak10-stat-icon"><Icon size={20} /></span><div><div className="ak10-stat-label">{label}</div><div className="ak10-stat-value">{value}</div></div><span className="ak10-trend text-white/30">{detail}</span></div>
}

function OnboardingStep({ icon: Icon, number, title, text, done = false }: { icon: any; number: string; title: string; text: string; done?: boolean }) {
  return <div className="flex gap-3 rounded-2xl border border-white/[.08] bg-black/20 p-4"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${done ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/25 bg-red-500/10 text-red-300'}`}>{done ? <Icon size={17}/> : number}</span><div><div className="text-sm font-black">{title}</div><div className="mt-1 text-xs leading-5 text-white/40">{text}</div></div></div>
}

function InfoCard({ title, icon: Icon, lines }: { title: string; icon: any; lines: string[] }) {
  return <div className="ak10-panel p-4"><h3 className="text-xs font-bold">{title}</h3><div className="mt-3 flex items-center gap-3 rounded-md border border-white/[.08] bg-black/20 p-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[.04] text-red-400"><Icon size={18} /></span><div className="min-w-0"><div className="truncate text-xs font-bold text-white/85">{lines[0]}</div><div className="mt-1 truncate text-[10px] text-white/35">{lines[1]}</div></div></div></div>
}
