'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Bell, Car, CheckCircle2, Cloud, Download, FileUp, Gauge, History, MessageCircle, Sparkles } from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import AKStatCard from '@/components/ak/AKStatCard'
import AKTimeline from '@/components/ak/AKTimeline'
import AKNotificationBell from '@/components/ak/AKNotificationBell'
import { getMisPedidos, type FileServicePedido, formatEstado } from '@/lib/services/pedidos'
import { getMisNotificaciones, type FileServiceNotificacion, formatNotificationDate } from '@/lib/services/notificaciones'

export default function DashboardPage() {
  const [pedidos, setPedidos] = useState<FileServicePedido[]>([])
  const [notificaciones, setNotificaciones] = useState<FileServiceNotificacion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMisPedidos(), getMisNotificaciones()])
      .then(([pedidosData, notifData]) => {
        setPedidos(pedidosData)
        setNotificaciones(notifData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    const abiertos = pedidos.filter((p) => p.estado !== 'finalizado' && p.estado !== 'cancelado').length
    const finalizados = pedidos.filter((p) => p.estado === 'finalizado').length
    const proceso = pedidos.filter((p) => p.estado === 'en_proceso').length
    const sinLeer = notificaciones.filter((n) => !n.leida).length
    return { abiertos, finalizados, proceso, sinLeer }
  }, [pedidos, notificaciones])

  const ultimo = pedidos[0]

  return (
    <main className="ak-noise flex min-h-screen">
      <AKSidebar />
      <section className="flex-1 p-4 lg:p-8">
        <header className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--ak-glow)]">Live Workspace</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">AK Cloud</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/40">Sube archivos, consulta pedidos, revisa tu garaje y mantén todos tus ORI/MOD organizados en una sola plataforma.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AKNotificationBell />
            <AKButton href="/nuevo-pedido"><FileUp size={18} /> New Job</AKButton>
            <AKButton href="/pedidos" variant="ghost"><History size={18} /> Orders</AKButton>
          </div>
        </header>

        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
          <AKStatCard label="Saldo" value="250 €" helper="Professional plan" tone="green" />
          <AKStatCard label="Pedidos abiertos" value={String(stats.abiertos)} helper="En cola y en proceso" tone="orange" />
          <AKStatCard label="Finalizados" value={String(stats.finalizados)} helper="Archivos listos" tone="blue" />
          <AKStatCard label="Avisos" value={String(stats.sinLeer)} helper="Sin leer" tone="red" />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
          <section className="space-y-6">
            <AKCard className="overflow-hidden p-6 md:p-8">
              <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--ak-red)]/25 bg-[var(--ak-red)]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-glow)]">
                    <Sparkles size={15} /> AK Cloud Intelligence
                  </div>
                  <h2 className="mt-5 text-3xl font-black tracking-tight md:text-5xl">Upload once. AK Cloud organises the rest.</h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/42">Workspace premium para file service: análisis visual, servicios compatibles, timeline vivo, chat técnico y notificaciones automáticas.</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <AKButton href="/nuevo-pedido"><Cloud size={18} /> Drop ORI file</AKButton>
                    <AKButton href="/garage" variant="ghost"><Car size={18} /> Open Garage</AKButton>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-black/30 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Queue Status</p>
                  <div className="mt-4 space-y-3">
                    {['Pedido recibido', 'Análisis automático', 'Notificación activa'].map((item, index) => (
                      <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/[0.035] p-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--ak-green)]/12 text-[var(--ak-green)]"><CheckCircle2 size={17} /></div>
                        <div>
                          <div className="text-sm font-black">{item}</div>
                          <div className="text-xs text-white/30">Step {index + 1}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AKCard>

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
                  {pedidos.slice(0, 5).map((pedido) => (
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
          </section>

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
          </aside>
        </div>
      </section>
    </main>
  )
}
