'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Bell,
  Car,
  CheckCircle2,
  CircleDollarSign,
  Cloud,
  Download,
  FileUp,
  Gauge,
  History,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Timer,
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
import { getMisNotificaciones, type FileServiceNotificacion, formatNotificationDate } from '@/lib/services/notificaciones'
import { getSaldoCreditos } from '@/lib/services/creditos'

const quickActions = [
  { href: '/nuevo-pedido', label: 'Crear trabajo', helper: 'Subir ORI', icon: FileUp },
  { href: '/garage', label: 'Mi Garaje', helper: 'Historial vehículos', icon: Car },
  { href: '/biblioteca', label: 'Biblioteca', helper: 'ORI / MOD', icon: Download },
  { href: '/comprar-creditos', label: 'Comprar créditos', helper: 'PayPal automático', icon: Wallet },
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
  const cola = pedidos.filter((pedido) => pedido.estado === 'pendiente').slice(0, 4)

  return (
    <main className="ak-noise ak-grid flex min-h-screen overflow-hidden">
      <AKSidebar />

      <section className="relative z-10 flex-1 overflow-hidden p-4 lg:p-8">
        <header className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.34em] text-[var(--ak-glow)]">AK Cloud Workspace</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">Centro de control</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/42">
              Gestiona pedidos, créditos, descargas, garaje y soporte desde una experiencia premium conectada con Autokeys Core.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AKNotificationBell />
            <AKButton href="/nuevo-pedido"><FileUp size={18} /> New Job</AKButton>
            <AKButton href="/comprar-creditos" variant="ghost"><CircleDollarSign size={18} /> Buy credits</AKButton>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
          <AKStatCard label="Créditos disponibles" value={String(saldo)} helper="Saldo actual" tone="green" />
          <AKStatCard label="Pedidos abiertos" value={String(stats.abiertos)} helper={`${stats.proceso} en proceso`} tone="orange" />
          <AKStatCard label="Descargas listas" value={String(stats.descargas)} helper="MOD disponibles" tone="blue" />
          <AKStatCard label="Avisos" value={String(stats.sinLeer)} helper="Sin leer" tone="red" />
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[1fr_430px]">
          <div className="space-y-6">
            <AKCard className="relative overflow-hidden p-6 md:p-8">
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--ak-red)]/20 blur-3xl" />
              <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[var(--ak-blue)]/10 blur-3xl" />

              <div className="relative grid gap-8 xl:grid-cols-[1fr_340px] xl:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--ak-red)]/25 bg-[var(--ak-red)]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-glow)]">
                    <Sparkles size={15} /> Premium File Service
                  </div>

                  <h2 className="mt-5 text-3xl font-black tracking-tight md:text-5xl">
                    Sube un ORI. AK Cloud prepara el resto.
                  </h2>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/45">
                    Diseño premium, pedidos rápidos, pagos automáticos con PayPal, créditos en tiempo real y producción conectada con el ERP interno.
                  </p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:max-w-3xl xl:grid-cols-4">
                    {quickActions.map((action) => {
                      const Icon = action.icon
                      return (
                        <Link
                          key={action.href}
                          href={action.href}
                          className="group rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-4 transition hover:-translate-y-0.5 hover:border-[var(--ak-red)]/45 hover:bg-white/[0.06]"
                        >
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/30 text-[var(--ak-glow)] transition group-hover:scale-105">
                            <Icon size={21} />
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
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Live Status</p>
                      <h3 className="mt-1 text-2xl font-black">Cola activa</h3>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ak-green)]/12 text-[var(--ak-green)]">
                      <Zap size={24} />
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      { title: 'Pagos PayPal', helper: 'Automático', Icon: ShieldCheck },
                      { title: 'Créditos', helper: `${saldo} disponibles`, Icon: Wallet },
                      { title: 'Producción', helper: `${stats.abiertos} abiertos`, Icon: Timer },
                    ].map(({ title, helper, Icon }) => {
                      return (
                        <div key={String(title)} className="flex items-center gap-3 rounded-2xl bg-white/[0.035] p-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ak-red)]/12 text-[var(--ak-glow)]"><Icon size={18} /></div>
                          <div>
                            <div className="text-sm font-black">{title}</div>
                            <div className="text-xs text-white/35">{helper}</div>
                          </div>
                        </div>
                      )
                    })}
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
                  <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-white/35">Todavía no hay pedidos. Crea el primero desde New Job.</div>
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
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Garage Preview</p>
                    <h2 className="mt-1 text-2xl font-black">Mi Garaje</h2>
                  </div>
                  <Car className="text-[var(--ak-glow)]" size={24} />
                </div>

                <div className="mt-5 space-y-3">
                  {(pedidos.length ? pedidos.slice(0, 4) : [null, null, null]).map((pedido, index) => (
                    <Link
                      key={pedido?.id || index}
                      href={pedido ? `/pedidos/${pedido.id}` : '/nuevo-pedido'}
                      className="block rounded-3xl border border-white/10 bg-black/25 p-4 transition hover:border-[var(--ak-red)]/35 hover:bg-white/[0.045]"
                    >
                      <div className="text-sm font-black">{pedido ? [pedido.marca, pedido.modelo].filter(Boolean).join(' ') || 'Vehículo pendiente' : ['Audi A4', 'BMW 320d', 'Golf GTI'][index]}</div>
                      <div className="mt-1 text-xs text-white/35">{pedido ? pedido.ecu || 'ECU pendiente' : ['EDC17C64', 'EDC17C50', 'MED17.5'][index]}</div>
                    </Link>
                  ))}
                </div>

                <AKButton href="/garage" variant="ghost" className="mt-5 w-full">Abrir garaje</AKButton>
              </AKCard>
            </div>
          </div>

          <aside className="space-y-6">
            <AKCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Now Playing</p>
                  <h3 className="mt-1 text-2xl font-black">Live Order</h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ak-red)]/15 text-[var(--ak-glow)]"><Gauge size={23} /></div>
              </div>
              <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-4">
                <div className="text-sm font-black">{ultimo?.numero || 'Sin pedido activo'}</div>
                <div className="mt-1 text-xs text-white/35">{ultimo ? `${ultimo.ecu || 'ECU'} · ${formatEstado(ultimo.estado)}` : 'Cuando entre un pedido aparecerá aquí.'}</div>
              </div>
              <div className="mt-5"><AKTimeline estado={ultimo?.estado || 'pendiente'} /></div>
            </AKCard>

            <AKCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Producción</p>
                  <h3 className="mt-1 text-xl font-black">Cola pendiente</h3>
                </div>
                <History className="text-[var(--ak-glow)]" size={22} />
              </div>
              <div className="mt-4 space-y-3">
                {cola.length === 0 ? (
                  <div className="rounded-2xl bg-white/[0.035] p-3 text-sm text-white/35">Sin trabajos en cola.</div>
                ) : cola.map((pedido) => (
                  <Link key={pedido.id} href={`/pedidos/${pedido.id}`} className="block rounded-2xl bg-white/[0.035] p-3 transition hover:bg-white/[0.055]">
                    <div className="text-sm font-black">{pedido.numero || 'FS'} · {pedido.ecu || 'ECU'}</div>
                    <div className="mt-1 text-xs text-white/35">{pedido.servicios?.join(', ') || 'Servicios pendientes'}</div>
                  </Link>
                ))}
              </div>
            </AKCard>

            <AKCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Notifications</p>
                  <h3 className="mt-1 text-xl font-black">Centro vivo</h3>
                </div>
                <Bell className="text-[var(--ak-glow)]" size={22} />
              </div>
              <div className="mt-4 space-y-3">
                {notificaciones.slice(0, 3).map((item) => (
                  <Link key={item.id} href={item.pedido_id ? `/pedidos/${item.pedido_id}` : '/notificaciones'} className="block rounded-2xl bg-white/[0.035] p-3 transition hover:bg-white/[0.055]">
                    <div className="text-sm font-black">{item.titulo}</div>
                    <div className="mt-1 text-xs text-white/35">{item.mensaje || formatNotificationDate(item.created_at)}</div>
                  </Link>
                ))}
                {notificaciones.length === 0 && <div className="rounded-2xl bg-white/[0.035] p-3 text-sm text-white/35">Sin avisos por ahora.</div>}
              </div>
              <Link href="/notificaciones" className="mt-4 inline-flex text-sm font-black text-[var(--ak-glow)]">Ver todo</Link>
            </AKCard>

            <AKCard className="p-6">
              <div className="flex items-center gap-3">
                <MessageCircle className="text-[var(--ak-glow)]" size={22} />
                <div>
                  <h3 className="font-black">Soporte técnico</h3>
                  <p className="text-sm text-white/35">Chat por pedido y trazabilidad completa.</p>
                </div>
              </div>
            </AKCard>
          </aside>
        </section>
      </section>
    </main>
  )
}
