'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Bell,
  Car,
  CheckCircle2,
  CircleDollarSign,
  Download,
  FileUp,
  Gauge,
  Headphones,
  Library,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import AKStatCard from '@/components/ak/AKStatCard'
import AKTimeline from '@/components/ak/AKTimeline'
import AKNotificationBell from '@/components/ak/AKNotificationBell'
import { getMisPedidos, type FileServicePedido, formatEstado } from '@/lib/services/pedidos'
import { getMisNotificaciones, type FileServiceNotificacion } from '@/lib/services/notificaciones'
import { getSaldoCreditos } from '@/lib/services/creditos'

const actions = [
  { href: '/nuevo-pedido', label: 'Nuevo trabajo', helper: 'Subir ORI', icon: FileUp, tone: 'red' },
  { href: '/comprar-creditos', label: 'Comprar créditos', helper: 'PayPal automático', icon: Wallet, tone: 'green' },
  { href: '/pedidos', label: 'Mis pedidos', helper: 'Timeline y descargas', icon: Gauge, tone: 'blue' },
  { href: '/soporte', label: 'Soporte', helper: 'Chat técnico', icon: Headphones, tone: 'orange' },
]

const productBlocks = [
  { href: '/garage', title: 'Mi Garaje', description: 'Vehículos, historial, ORI y MOD agrupados por coche.', icon: Car },
  { href: '/biblioteca', title: 'Biblioteca', description: 'Busca archivos por ECU, HW, SW, vehículo o servicio.', icon: Library },
  { href: '/intelligence', title: 'AK Intelligence', description: 'Análisis visual y detección progresiva de archivos ECU.', icon: Sparkles },
]

export default function DashboardPage() {
  const [pedidos, setPedidos] = useState<FileServicePedido[]>([])
  const [notificaciones, setNotificaciones] = useState<FileServiceNotificacion[]>([])
  const [saldo, setSaldo] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMisPedidos(), getMisNotificaciones(), getSaldoCreditos()])
      .then(([pedidosData, notifData, saldoData]) => {
        setPedidos(pedidosData)
        setNotificaciones(notifData)
        setSaldo(Number(saldoData || 0))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    const abiertos = pedidos.filter((p) => p.estado !== 'finalizado' && p.estado !== 'cancelado').length
    const finalizados = pedidos.filter((p) => p.estado === 'finalizado').length
    const proceso = pedidos.filter((p) => p.estado === 'en_proceso').length
    const sinLeer = notificaciones.filter((n) => !n.leida).length
    const descargas = pedidos.filter((p) => p.mod_path).length
    return { abiertos, finalizados, proceso, sinLeer, descargas }
  }, [pedidos, notificaciones])

  const ultimo = pedidos[0]
  const pendientes = pedidos.filter((p) => p.estado === 'pendiente').slice(0, 5)
  const progreso = pedidos.length ? Math.round((stats.finalizados / pedidos.length) * 100) : 0

  return (
    <main className="ak-noise ak-grid flex min-h-screen overflow-hidden">
      <AKSidebar />

      <section className="relative z-10 flex-1 overflow-auto p-4 lg:p-8">
        <header className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.34em] text-[var(--ak-glow)]">AK Cloud Client Portal</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">Workspace</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/42">
              Tu centro de trabajo para File Service: créditos, pedidos, descargas, garaje, biblioteca y soporte en un único panel premium.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AKNotificationBell />
            <AKButton href="/nuevo-pedido"><FileUp size={18} /> New Job</AKButton>
            <AKButton href="/comprar-creditos" variant="ghost"><CircleDollarSign size={18} /> Buy credits</AKButton>
          </div>
        </header>

        <section className="mb-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
          <AKStatCard label="Créditos" value={String(saldo)} helper="Saldo disponible" tone="green" />
          <AKStatCard label="Pedidos abiertos" value={String(stats.abiertos)} helper={`${stats.proceso} en proceso`} tone="orange" />
          <AKStatCard label="MOD listos" value={String(stats.descargas)} helper="Descargas disponibles" tone="blue" />
          <AKStatCard label="Avisos" value={String(stats.sinLeer)} helper="Notificaciones pendientes" tone="red" />
        </section>

        <section className="grid gap-6 2xl:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <AKCard className="relative overflow-hidden p-6 md:p-8">
              <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[var(--ak-red)]/22 blur-3xl" />
              <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[var(--ak-blue)]/12 blur-3xl" />

              <div className="relative grid gap-8 xl:grid-cols-[1fr_320px] xl:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--ak-red)]/25 bg-[var(--ak-red)]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-glow)]">
                    <Sparkles size={15} /> Premium Experience
                  </div>
                  <h2 className="mt-5 text-3xl font-black tracking-tight md:text-5xl">
                    Envia archivos, compra créditos y consulta tu historial sin salir del workspace.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/45">
                    AK Cloud ya conecta pagos PayPal, créditos, pedidos, soporte y biblioteca técnica en una experiencia pensada para distribuidores profesionales.
                  </p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {actions.map((action) => {
                      const Icon = action.icon
                      return (
                        <Link
                          key={action.href}
                          href={action.href}
                          className="group rounded-[1.6rem] border border-white/10 bg-white/[0.035] p-4 transition hover:-translate-y-0.5 hover:border-[var(--ak-red)]/45 hover:bg-white/[0.06]"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/30 text-[var(--ak-glow)] transition group-hover:scale-105">
                            <Icon size={22} />
                          </div>
                          <div className="mt-4 text-sm font-black">{action.label}</div>
                          <div className="mt-1 text-xs text-white/35">{action.helper}</div>
                        </Link>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-black/30 p-5 shadow-2xl shadow-black/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Plan actual</p>
                      <h3 className="mt-1 text-2xl font-black">Distributor PRO</h3>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ak-green)]/12 text-[var(--ak-green)]">
                      <ShieldCheck size={24} />
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <div className="flex items-center justify-between text-sm font-black">
                      <span>Rendimiento pedidos</span>
                      <span className="text-[var(--ak-green)]">{progreso}%</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--ak-red),var(--ak-green))]" style={{ width: `${Math.max(8, progreso)}%` }} />
                    </div>
                    <p className="mt-3 text-xs text-white/35">Pedidos finalizados sobre el historial total de tu cuenta.</p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <MiniStat label="Finalizados" value={stats.finalizados} />
                    <MiniStat label="En cola" value={pendientes.length} />
                  </div>
                </div>
              </div>
            </AKCard>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
              <AKCard className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-glow)]">Últimos pedidos</p>
                    <h2 className="mt-1 text-2xl font-black">Recent jobs</h2>
                  </div>
                  <Link href="/pedidos" className="text-sm font-black text-[var(--ak-glow)]">Ver todos</Link>
                </div>

                {loading ? (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-white/35">Cargando pedidos...</div>
                ) : pedidos.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-white/35">
                    Todavía no hay pedidos. Crea el primero desde New Job.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pedidos.slice(0, 6).map((pedido) => (
                      <Link key={pedido.id} href={`/pedidos/${pedido.id}`} className="group flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-[var(--ak-red)]/40 hover:bg-white/[0.055]">
                        <div>
                          <div className="text-sm font-black">{pedido.numero || 'FS'} · {pedido.ecu || 'ECU pendiente'}</div>
                          <div className="mt-1 text-xs text-white/35">{[pedido.marca, pedido.modelo, pedido.motor].filter(Boolean).join(' · ') || pedido.ori_nombre || 'Sin datos'}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-black text-white/55">{formatEstado(pedido.estado)}</span>
                          <ArrowRight size={17} className="text-white/25 transition group-hover:text-[var(--ak-glow)]" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </AKCard>

              <AKCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Ecosistema</p>
                    <h2 className="mt-1 text-2xl font-black">Accesos premium</h2>
                  </div>
                  <Zap className="text-[var(--ak-glow)]" size={24} />
                </div>

                <div className="mt-5 space-y-3">
                  {productBlocks.map((block) => {
                    const Icon = block.icon
                    return (
                      <Link key={block.href} href={block.href} className="group block rounded-3xl border border-white/10 bg-black/25 p-4 transition hover:border-[var(--ak-red)]/35 hover:bg-white/[0.045]">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ak-red)]/12 text-[var(--ak-glow)] transition group-hover:scale-105">
                            <Icon size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-black">{block.title}</div>
                            <div className="mt-1 text-xs leading-5 text-white/35">{block.description}</div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </AKCard>
            </div>
          </div>

          <aside className="space-y-6">
            <AKCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Pedido activo</p>
                  <h2 className="mt-1 text-2xl font-black">Live order</h2>
                </div>
                <Bell className="text-[var(--ak-glow)]" size={24} />
              </div>

              {ultimo ? (
                <div className="mt-5">
                  <Link href={`/pedidos/${ultimo.id}`} className="block rounded-3xl border border-[var(--ak-red)]/25 bg-[var(--ak-red)]/10 p-4 transition hover:bg-[var(--ak-red)]/14">
                    <div className="text-lg font-black">{ultimo.numero || 'Pedido FS'}</div>
                    <div className="mt-1 text-sm text-white/45">{[ultimo.marca, ultimo.modelo, ultimo.ecu].filter(Boolean).join(' · ') || ultimo.ori_nombre}</div>
                    <div className="mt-4 inline-flex rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-black text-white/55">{formatEstado(ultimo.estado)}</div>
                  </Link>
                  <div className="mt-4"><AKTimeline estado={ultimo.estado} /></div>
                </div>
              ) : (
                <div className="mt-5 rounded-3xl border border-dashed border-white/10 p-8 text-center text-white/35">
                  No hay pedidos activos. Sube un ORI para comenzar.
                </div>
              )}
            </AKCard>

            <AKCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Cola</p>
                  <h2 className="mt-1 text-2xl font-black">Pendientes</h2>
                </div>
                <Timer className="text-orange-400" size={24} />
              </div>
              <div className="mt-5 space-y-3">
                {pendientes.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/35">Sin pedidos pendientes.</div>
                ) : (
                  pendientes.map((pedido) => (
                    <Link key={pedido.id} href={`/pedidos/${pedido.id}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-[var(--ak-red)]/35">
                      <div>
                        <div className="text-sm font-black">{pedido.numero}</div>
                        <div className="mt-1 text-xs text-white/35">{pedido.ecu || pedido.ori_nombre}</div>
                      </div>
                      <ArrowRight size={16} className="text-white/25" />
                    </Link>
                  ))
                )}
              </div>
            </AKCard>

            <AKCard className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ak-green)]/12 text-[var(--ak-green)]">
                  <MessageCircle size={21} />
                </div>
                <div>
                  <h3 className="font-black">Soporte técnico</h3>
                  <p className="text-xs text-white/35">Chat y tickets conectados con Autokeys.</p>
                </div>
              </div>
              <AKButton href="/soporte" variant="ghost" className="mt-5 w-full">Abrir soporte</AKButton>
            </AKCard>
          </aside>
        </section>
      </section>
    </main>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/22 p-4">
      <div className="text-2xl font-black">{value}</div>
      <div className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-white/30">{label}</div>
    </div>
  )
}
