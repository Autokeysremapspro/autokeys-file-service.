'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Bell,
  Car,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Download,
  FileArchive,
  FileUp,
  Gauge,
  LifeBuoy,
  ShieldCheck,
  Sparkles,
  Trophy,
  Wallet,
  Zap,
} from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'
import AKButton from '@/components/ak/AKButton'
import AKNotificationBell from '@/components/ak/AKNotificationBell'
import { getMisPedidos, type FileServicePedido, formatEstado } from '@/lib/services/pedidos'
import { getMisNotificaciones, type FileServiceNotificacion, formatNotificationDate } from '@/lib/services/notificaciones'
import { getSaldoCreditos } from '@/lib/services/creditos'

const quickActions = [
  { href: '/nuevo-pedido', label: 'Nuevo trabajo', helper: 'Sube un ORI y crea una solicitud', icon: FileUp, accent: 'red' },
  { href: '/comprar-creditos', label: 'Comprar créditos', helper: 'PayPal automático', icon: Wallet, accent: 'green' },
  { href: '/garage', label: 'Mi garaje', helper: 'Historial por vehículo', icon: Car, accent: 'blue' },
  { href: '/soporte', label: 'Soporte técnico', helper: 'Habla con Autokeys', icon: LifeBuoy, accent: 'orange' },
]

function money(value: number) {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(value)
}

function estadoTone(estado?: string | null) {
  if (estado === 'finalizado') return 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300'
  if (estado === 'en_proceso') return 'border-blue-400/25 bg-blue-500/10 text-blue-300'
  if (estado === 'cancelado') return 'border-red-400/25 bg-red-500/10 text-red-300'
  return 'border-amber-400/25 bg-amber-500/10 text-amber-300'
}

function serviceLabel(servicios?: string[] | null) {
  if (!servicios?.length) return 'Servicio pendiente'
  return servicios.slice(0, 3).join(' + ')
}

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
    const proceso = pedidos.filter((p) => p.estado === 'en_proceso').length
    const finalizados = pedidos.filter((p) => p.estado === 'finalizado').length
    const descargas = pedidos.filter((p) => Boolean(p.mod_path)).length
    const sinLeer = notificaciones.filter((n) => !n.leida).length
    const gasto = pedidos.reduce((acc, p) => acc + Number(p.precio || 0), 0)
    return { abiertos, proceso, finalizados, descargas, sinLeer, gasto }
  }, [pedidos, notificaciones])

  const activeJobs = pedidos.filter((pedido) => pedido.estado !== 'finalizado' && pedido.estado !== 'cancelado').slice(0, 5)
  const latestJobs = pedidos.slice(0, 6)
  const latestNotifications = notificaciones.slice(0, 4)
  const latestReady = pedidos.filter((p) => p.mod_path).slice(0, 3)

  return (
    <main className="ak-noise flex min-h-screen overflow-hidden bg-[#030303] text-white">
      <AKSidebar />

      <section className="relative z-10 flex-1 overflow-y-auto">
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(217,4,41,.28),transparent_34%),radial-gradient(circle_at_78%_8%,rgba(255,255,255,.08),transparent_22%),linear-gradient(120deg,#030303,#07080b_55%,#100406)]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:58px_58px]" />
        </div>

        <div className="relative z-10 p-4 lg:p-8">
          <header className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.32em] text-red-300 shadow-[0_0_35px_rgba(217,4,41,.16)]">
                <Sparkles size={14} /> AK Cloud Command Center
              </div>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
                Bienvenido, <span className="text-red-500">Carlos</span>
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/45">
                Tu workspace de soluciones electrónicas: pedidos, créditos, descargas, garaje y soporte conectados con Autokeys Core.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <AKNotificationBell />
              <AKButton href="/nuevo-pedido"><FileUp size={18} /> Nuevo trabajo</AKButton>
              <AKButton href="/soporte" variant="ghost"><LifeBuoy size={18} /> Soporte técnico</AKButton>
            </div>
          </header>

          <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-5">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-300 ring-1 ring-red-400/20"><Wallet size={26} /></div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">Saldo disponible</p>
                  <div className="mt-1 text-3xl font-black text-emerald-300">{money(saldo)}</div>
                </div>
              </div>
              <Link href="/comprar-creditos" className="mt-4 inline-flex text-sm font-black text-red-300">+ Recargar saldo</Link>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20"><CheckCircle2 size={26} /></div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">Trabajos realizados</p>
                  <div className="mt-1 text-3xl font-black">{stats.finalizados}</div>
                </div>
              </div>
              <Link href="/pedidos" className="mt-4 inline-flex text-sm font-black text-emerald-300">Ver historial</Link>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-300 ring-1 ring-purple-400/20"><Download size={26} /></div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">Archivos descargables</p>
                  <div className="mt-1 text-3xl font-black">{stats.descargas}</div>
                </div>
              </div>
              <Link href="/biblioteca" className="mt-4 inline-flex text-sm font-black text-purple-300">Ver archivos</Link>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/20"><Clock3 size={26} /></div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">En proceso</p>
                  <div className="mt-1 text-3xl font-black">{stats.proceso}</div>
                </div>
              </div>
              <Link href="/pedidos" className="mt-4 inline-flex text-sm font-black text-amber-300">Ver trabajos</Link>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/20"><Bell size={26} /></div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">Notificaciones</p>
                  <div className="mt-1 text-3xl font-black">{stats.sinLeer}</div>
                </div>
              </div>
              <Link href="/notificaciones" className="mt-4 inline-flex text-sm font-black text-sky-300">Abrir avisos</Link>
            </div>
          </section>

          <section className="mt-6 grid gap-6 2xl:grid-cols-[1fr_420px]">
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
                <div className="absolute inset-0 bg-[url('/images/ak-login-racing.png')] bg-cover bg-center opacity-[0.22]" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/88 to-black/42" />
                <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-red-600/25 blur-3xl" />

                <div className="relative grid gap-8 xl:grid-cols-[1fr_360px] xl:items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-red-200">
                      <Trophy size={15} /> Professional File Service
                    </div>
                    <h2 className="mt-5 max-w-3xl text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
                      No vendemos archivos. <span className="text-red-500">Entregamos soluciones.</span>
                    </h2>
                    <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55">
                      Sube tu ORI, selecciona servicios y deja que Autokeys gestione el trabajo desde producción hasta descarga final.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <AKButton href="/nuevo-pedido"><Zap size={18} /> Crear nuevo trabajo</AKButton>
                      <AKButton href="/intelligence" variant="ghost"><Gauge size={18} /> Analizar ECU</AKButton>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-white/10 bg-black/55 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/35">Live order</p>
                        <h3 className="mt-1 text-2xl font-black">Cola de producción</h3>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-300 ring-1 ring-emerald-400/20"><ShieldCheck size={24} /></div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {activeJobs.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-white/35">No hay trabajos activos ahora mismo.</div>
                      ) : activeJobs.map((pedido) => (
                        <Link key={pedido.id} href={`/pedidos/${pedido.id}`} className="block rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-red-400/35 hover:bg-white/[0.07]">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-black">{pedido.numero || 'FS'} · {pedido.ecu || 'ECU pendiente'}</div>
                              <div className="mt-1 truncate text-xs text-white/35">{serviceLabel(pedido.servicios)}</div>
                            </div>
                            <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${estadoTone(pedido.estado)}`}>
                              {formatEstado(pedido.estado)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-red-300">Últimos trabajos</p>
                      <h2 className="mt-1 text-2xl font-black">Recent jobs</h2>
                    </div>
                    <Link href="/pedidos" className="text-sm font-black text-red-300">Ver todos</Link>
                  </div>

                  {loading ? (
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-white/35">Cargando pedidos...</div>
                  ) : latestJobs.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-white/35">Todavía no hay pedidos. Crea el primero desde Nuevo trabajo.</div>
                  ) : (
                    <div className="space-y-3">
                      {latestJobs.map((pedido) => (
                        <Link key={pedido.id} href={`/pedidos/${pedido.id}`} className="group flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-red-400/40 hover:bg-white/[0.06]">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-black">{pedido.numero || 'FS'} · {pedido.ecu || 'ECU pendiente'}</div>
                            <div className="mt-1 truncate text-xs text-white/35">{[pedido.marca, pedido.modelo, pedido.motor].filter(Boolean).join(' · ') || pedido.ori_nombre || 'Archivo pendiente'}</div>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${estadoTone(pedido.estado)}`}>{formatEstado(pedido.estado)}</span>
                            <ArrowRight size={17} className="text-white/25 transition group-hover:translate-x-1 group-hover:text-red-300" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-red-300">Acciones rápidas</p>
                      <h2 className="mt-1 text-2xl font-black">Launchpad</h2>
                    </div>
                    <Sparkles className="text-red-300" size={22} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    {quickActions.map((action) => {
                      const Icon = action.icon
                      return (
                        <Link key={action.href} href={action.href} className="group rounded-[1.6rem] border border-white/10 bg-black/25 p-4 transition hover:-translate-y-0.5 hover:border-red-400/40 hover:bg-white/[0.06]">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/12 text-red-300 ring-1 ring-red-400/20 transition group-hover:scale-105">
                              <Icon size={21} />
                            </div>
                            <div>
                              <div className="text-sm font-black">{action.label}</div>
                              <div className="mt-1 text-xs text-white/35">{action.helper}</div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-red-300">Mi plan</p>
                    <h2 className="mt-2 text-3xl font-black">AK PRO</h2>
                  </div>
                  <span className="rounded-xl bg-red-500 px-3 py-1 text-xs font-black">PRO</span>
                </div>
                <div className="mt-5 space-y-3 text-sm text-white/70">
                  <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-300" /> PayPal automático</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-300" /> Soporte prioritario</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-300" /> Core Sync activo</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-300" /> Historial de vehículos</div>
                </div>
                <AKButton href="/perfil" variant="ghost" className="mt-6 w-full">Gestionar plan</AKButton>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-red-300">Descargas</p>
                    <h2 className="mt-1 text-2xl font-black">Archivos listos</h2>
                  </div>
                  <Link href="/biblioteca" className="text-xs font-black text-red-300">Ver biblioteca</Link>
                </div>

                <div className="space-y-3">
                  {latestReady.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-white/35">Aún no hay MOD disponibles.</div>
                  ) : latestReady.map((pedido) => (
                    <Link key={pedido.id} href={`/pedidos/${pedido.id}`} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 transition hover:border-red-400/35">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-300"><FileArchive size={19} /></div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black">{pedido.mod_nombre || pedido.numero || 'Archivo MOD'}</div>
                        <div className="truncate text-xs text-white/35">{pedido.ecu || 'ECU'} · {serviceLabel(pedido.servicios)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-red-300">Centro de avisos</p>
                    <h2 className="mt-1 text-2xl font-black">Notificaciones</h2>
                  </div>
                  <Link href="/notificaciones" className="text-xs font-black text-red-300">Ver todas</Link>
                </div>

                <div className="space-y-3">
                  {latestNotifications.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-white/35">Sin avisos nuevos.</div>
                  ) : latestNotifications.map((notification) => (
                    <Link key={notification.id} href="/notificaciones" className="block rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-red-400/35">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/12 text-red-300"><Bell size={16} /></div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-black">{notification.titulo}</div>
                          <div className="mt-1 line-clamp-2 text-xs leading-5 text-white/35">{notification.mensaje}</div>
                          <div className="mt-2 text-[10px] font-black uppercase tracking-wider text-white/25">{formatNotificationDate(notification.created_at)}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        </div>
      </section>
    </main>
  )
}
