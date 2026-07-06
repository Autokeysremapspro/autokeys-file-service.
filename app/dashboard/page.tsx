'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  Bell,
  BookOpen,
  Car,
  CheckCircle2,
  ClipboardList,
  Coins,
  Download,
  Eye,
  FileDown,
  FileUp,
  Headphones,
  Home,
  Library,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Wallet,
  Zap,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getMisPedidos, type FileServicePedido, formatEstado } from '@/lib/services/pedidos'
import { getMisNotificaciones, type FileServiceNotificacion, formatNotificationDate } from '@/lib/services/notificaciones'
import { getSaldoCreditos } from '@/lib/services/creditos'

const menu = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, active: true },
  { href: '/nuevo-pedido', label: 'Nuevo pedido', icon: UploadCloud },
  { href: '/pedidos', label: 'Mis pedidos', icon: ClipboardList },
  { href: '/descargas', label: 'Descargas', icon: Download },
  { href: '/creditos', label: 'Créditos', icon: Coins },
  { href: '/biblioteca', label: 'Biblioteca', icon: Library },
  { href: '/garage', label: 'Garage', icon: Car },
  { href: '/soporte', label: 'Soporte', icon: Headphones },
  { href: '/perfil', label: 'Ajustes', icon: Settings },
]

const quick = [
  { href: '/nuevo-pedido', label: 'Nuevo pedido', icon: FileUp },
  { href: '/comprar-creditos', label: 'Comprar créditos', icon: Coins },
  { href: '/nuevo-pedido', label: 'Datos manuales ECU', icon: FileUp },
  { href: '/biblioteca', label: 'Biblioteca', icon: BookOpen },
  { href: '/soporte', label: 'Soporte', icon: Headphones },
  { href: '/garage', label: 'Garage', icon: Car },
]

function estadoClass(estado?: string | null) {
  switch (estado) {
    case 'finalizado':
      return 'text-emerald-400'
    case 'en_proceso':
      return 'text-yellow-300'
    case 'cancelado':
      return 'text-red-400'
    default:
      return 'text-sky-300'
  }
}

function statusIcon(estado?: string | null) {
  if (estado === 'finalizado') return CheckCircle2
  if (estado === 'en_proceso') return Zap
  if (estado === 'cancelado') return AlertCircle
  return Eye
}

function vehicleTitle(pedido: FileServicePedido) {
  return [pedido.marca, pedido.modelo, pedido.motor].filter(Boolean).join(' ') || pedido.ori_nombre || 'Vehículo pendiente'
}

function prettyDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

function formatCredits(value: number) {
  return new Intl.NumberFormat('es-ES').format(value || 0)
}

export default function DashboardPage() {
  const [pedidos, setPedidos] = useState<FileServicePedido[]>([])
  const [notificaciones, setNotificaciones] = useState<FileServiceNotificacion[]>([])
  const [saldo, setSaldo] = useState(0)
  const [userName, setUserName] = useState('Autokeys Pro')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMisPedidos(), getMisNotificaciones(), getSaldoCreditos(), supabase.auth.getUser()])
      .then(([pedidosData, notifData, saldoData, auth]) => {
        setPedidos(pedidosData)
        setNotificaciones(notifData)
        setSaldo(Number(saldoData || 0))
        const user = auth.data.user
        const name = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Autokeys Pro'
        setUserName(String(name))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    const finalizados = pedidos.filter((p) => p.estado === 'finalizado').length
    const proceso = pedidos.filter((p) => p.estado === 'en_proceso').length
    const descargas = pedidos.filter((p) => p.mod_path).length
    const vehiculos = new Set(pedidos.map((p) => [p.marca, p.modelo, p.motor].filter(Boolean).join('|')).filter(Boolean)).size
    const sinLeer = notificaciones.filter((n) => !n.leida).length
    return { finalizados, proceso, descargas, vehiculos, sinLeer }
  }, [pedidos, notificaciones])

  const recientes = pedidos.slice(0, 5)
  const descargas = pedidos.filter((p) => p.mod_path).slice(0, 3)
  const avisos = notificaciones.slice(0, 4)

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <main className="min-h-screen bg-[#030303] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(217,4,41,.22),transparent_28%),radial-gradient(circle_at_70%_5%,rgba(255,255,255,.08),transparent_22%),linear-gradient(180deg,rgba(255,255,255,.035),transparent_38%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[.065] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(circle_at_55%_15%,black,transparent_74%)]" />

      <div className="relative flex min-h-screen overflow-hidden rounded-none border-white/10 xl:rounded-[2rem] xl:border">
        <aside className="hidden w-[265px] shrink-0 border-r border-white/10 bg-black/55 p-6 backdrop-blur-2xl lg:block">
          <Link href="/dashboard" className="mb-8 flex justify-center">
            <div className="text-center">
              <div className="text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_0_22px_rgba(255,255,255,.18)]">
                AUTOKEYS<span className="text-[#ef233c]">.</span>
              </div>
              <div className="-mt-1 text-sm font-black italic tracking-wide text-[#ff263f]">REMAPS PRO</div>
              <div className="mt-2 text-[10px] font-black uppercase tracking-[.36em] text-white/35">AK Cloud</div>
            </div>
          </Link>

          <nav className="space-y-2">
            {menu.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-wide transition ${
                    item.active
                      ? 'bg-gradient-to-r from-[#e50914] to-[#9d0208] text-white shadow-[0_18px_45px_rgba(229,9,20,.35)]'
                      : 'text-white/65 hover:bg-white/[.06] hover:text-white'
                  }`}
                >
                  <Icon size={18} className={item.active ? 'text-white' : 'text-white/55 group-hover:text-[#ff334d]'} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[.035] p-5 shadow-2xl shadow-black/30">
            <p className="text-xs font-black uppercase tracking-[.22em] text-white/55">Créditos disponibles</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div className="text-4xl font-black">{formatCredits(saldo)}</div>
              <Coins className="text-[#ff263f]" size={36} />
            </div>
            <Link href="/comprar-creditos" className="mt-5 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#e50914] to-[#ff2d3d] px-4 py-3 text-xs font-black uppercase shadow-[0_16px_45px_rgba(229,9,20,.32)] transition hover:scale-[1.01]">
              Comprar créditos
            </Link>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4">
            <div className="h-12 w-12 rounded-full border border-white/10 bg-[url('/images/ak-dashboard-hero-racing.webp')] bg-cover bg-center" />
            <div className="min-w-0">
              <div className="truncate text-sm font-black">{userName}</div>
              <div className="mt-1 inline-flex rounded-md bg-[#e50914] px-2 py-0.5 text-[10px] font-black uppercase">Distribuidor Pro</div>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col p-4 md:p-6 xl:p-8">
          <header className="mb-6 flex items-center justify-between gap-4">
            <div className="lg:hidden">
              <div className="text-xl font-black italic">AK <span className="text-[#ff263f]">CLOUD</span></div>
              <div className="text-[10px] uppercase tracking-[.24em] text-white/35">Autokeys Remaps Pro</div>
            </div>
            <div className="hidden lg:block" />
            <div className="ml-auto flex items-center gap-3">
              <Link href="/comprar-creditos" className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm font-black backdrop-blur-xl transition hover:border-[#ff263f]/50 md:flex">
                <Coins size={18} /> {formatCredits(saldo)} créditos
              </Link>
              <Link href="/notificaciones" className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[.06] backdrop-blur-xl transition hover:border-[#ff263f]/50">
                <Bell size={21} />
                {stats.sinLeer > 0 && <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#e50914] px-1 text-xs font-black">{stats.sinLeer}</span>}
              </Link>
              <button onClick={logout} className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[.06] backdrop-blur-xl transition hover:border-[#ff263f]/50" aria-label="Cerrar sesión">
                <LogOut size={21} />
              </button>
            </div>
          </header>

          <section className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-black/40 shadow-[0_32px_110px_rgba(0,0,0,.52)]">
            <div className="absolute inset-0 bg-[url('/images/ak-dashboard-hero-racing.webp')] bg-cover bg-center opacity-75" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/72 to-black/5" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/10" />
            <div className="relative grid min-h-[310px] gap-6 p-7 md:p-10 xl:grid-cols-[1fr_430px] xl:p-12">
              <div className="max-w-3xl">
                <p className="text-lg font-black uppercase italic tracking-wide text-white/90">Bienvenido de nuevo,</p>
                <h1 className="mt-2 text-5xl font-black uppercase italic tracking-tight md:text-7xl">
                  AUTOKEYS <span className="text-[#f21f34] drop-shadow-[0_0_28px_rgba(242,31,52,.45)]">PRO</span>
                </h1>
                <p className="mt-3 text-xl font-black uppercase italic tracking-wide text-white">
                  Tu plataforma <span className="text-[#ff263f]">profesional</span> de file <span className="text-[#ff263f]">service</span>
                </p>
                <p className="mt-5 max-w-2xl text-lg italic text-white/65">“No vendemos archivos. Entregamos <span className="font-black text-[#ff263f]">soluciones</span>.”</p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link href="/nuevo-pedido" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#e50914] to-[#ff334d] px-6 py-4 text-sm font-black uppercase shadow-[0_22px_65px_rgba(229,9,20,.36)] transition hover:scale-[1.01]">
                    <FileUp size={20} /> Nuevo pedido
                  </Link>
                  <Link href="/biblioteca" className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-black/35 px-6 py-4 text-sm font-black uppercase backdrop-blur-xl transition hover:border-[#ff263f]/50">
                    <Library size={20} /> Biblioteca
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_290px] 2xl:grid-cols-[1fr_310px]">
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Pedidos realizados', value: pedidos.length, helper: 'Este mes', icon: FileUp },
                  { label: 'Descargas completadas', value: stats.descargas, helper: 'MOD disponibles', icon: FileDown },
                  { label: 'Vehículos trabajados', value: stats.vehiculos, helper: 'Garage activo', icon: Car },
                  { label: 'Créditos disponibles', value: formatCredits(saldo), helper: 'Saldo actual', icon: Coins },
                ].map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[.035] p-5 shadow-2xl shadow-black/25 transition hover:-translate-y-0.5 hover:border-[#ff263f]/45 hover:bg-white/[.055]">
                      <div className="absolute -left-6 -top-8 h-24 w-24 rounded-full bg-[#e50914]/20 blur-2xl transition group-hover:bg-[#e50914]/35" />
                      <div className="relative flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e50914]/12 text-[#ff263f] shadow-[0_0_34px_rgba(229,9,20,.16)]">
                          <Icon size={27} />
                        </div>
                        <div>
                          <div className="text-3xl font-black">{stat.value}</div>
                          <div className="mt-1 text-xs font-black uppercase tracking-wide text-white/55">{stat.label}</div>
                          <div className="mt-1 text-xs text-white/35">{stat.helper}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="grid gap-5 2xl:grid-cols-[1.1fr_.9fr]">
                <div className="rounded-2xl border border-white/10 bg-black/45 shadow-2xl shadow-black/30">
                  <div className="flex items-center justify-between border-b border-white/10 p-5">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="text-[#ff263f]" size={24} />
                      <h2 className="text-lg font-black uppercase">Últimos pedidos</h2>
                    </div>
                    <Link href="/pedidos" className="text-xs font-black uppercase text-[#ff263f]">Ver todos los pedidos</Link>
                  </div>
                  <div className="divide-y divide-white/10">
                    {loading ? (
                      <div className="p-6 text-white/45">Cargando pedidos...</div>
                    ) : recientes.length === 0 ? (
                      <div className="p-8 text-center text-white/45">Todavía no hay pedidos. Crea el primero con Nuevo pedido.</div>
                    ) : recientes.map((pedido) => {
                      const Icon = statusIcon(pedido.estado)
                      return (
                        <Link key={pedido.id} href={`/pedidos/${pedido.id}`} className="grid items-center gap-3 p-4 transition hover:bg-white/[.035] md:grid-cols-[86px_1fr_110px_88px_44px]">
                          <div className="text-sm font-black text-[#ff263f]">#{pedido.numero || 'AKFS'}</div>
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[.04] text-white/70">
                              <Car size={23} />
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-black uppercase">{vehicleTitle(pedido)}</div>
                              <div className="truncate text-xs text-white/45">{pedido.ecu || 'ECU pendiente'} · {pedido.hw || 'HW pendiente'}</div>
                            </div>
                          </div>
                          <div className="hidden rounded-lg bg-white/[.06] px-3 py-2 text-center text-[11px] font-black uppercase text-white/75 md:block">{pedido.servicios?.[0] || 'Servicio'}</div>
                          <div className="text-xs font-black uppercase">
                            <span className={estadoClass(pedido.estado)}>{formatEstado(pedido.estado)}</span>
                            <div className="mt-1 text-[11px] font-normal normal-case text-white/35">{prettyDate(pedido.created_at)}</div>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[.06] text-white/75"><Icon size={18} /></div>
                        </Link>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-2xl border border-white/10 bg-black/45 shadow-2xl shadow-black/30">
                    <div className="flex items-center gap-3 border-b border-white/10 p-5">
                      <Download className="text-[#ff263f]" size={23} />
                      <h2 className="text-lg font-black uppercase">Descargas listas</h2>
                    </div>
                    <div className="divide-y divide-white/10">
                      {descargas.length === 0 ? (
                        <div className="p-6 text-sm text-white/45">Cuando un MOD esté listo aparecerá aquí.</div>
                      ) : descargas.map((pedido) => (
                        <Link key={pedido.id} href={`/pedidos/${pedido.id}`} className="flex items-center justify-between gap-3 p-4 transition hover:bg-white/[.035]">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-black">{pedido.mod_nombre || `${pedido.numero}_MOD.zip`}</div>
                            <div className="mt-1 text-xs text-white/45">Listo para descargar</div>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[.06] text-white"><Download size={18} /></div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/45 p-6 shadow-2xl shadow-black/30">
                    <div className="absolute inset-0 bg-[url('/images/ak-dashboard-hero-racing.webp')] bg-cover bg-center opacity-25" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />
                    <div className="relative">
                      <div className="text-3xl font-black uppercase italic leading-tight">Nuevo <span className="text-[#ff263f]">Hard Cut</span><br />1.9 TDI EDC16</div>
                      <p className="mt-2 text-sm font-bold uppercase text-white/70">Disponible ahora</p>
                      <Link href="/nuevo-pedido" className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-[#e50914] to-[#ff334d] px-5 py-3 text-sm font-black uppercase">Ver más</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-black/45 p-5 shadow-2xl shadow-black/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="text-[#ff263f]" size={22} />
                    <h2 className="font-black uppercase">Notificaciones</h2>
                  </div>
                  <Link href="/notificaciones" className="text-xs font-black uppercase text-[#ff263f]">Ver todas</Link>
                </div>
                <div className="mt-4 divide-y divide-white/10">
                  {avisos.length === 0 ? (
                    <div className="py-4 text-sm text-white/45">No hay avisos nuevos.</div>
                  ) : avisos.map((item) => (
                    <Link key={item.id} href={item.pedido_id ? `/pedidos/${item.pedido_id}` : '/notificaciones'} className="flex gap-3 py-4 transition hover:text-white">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ff263f]/25 bg-[#ff263f]/10 text-[#ff263f]">
                        <Bell size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black">{item.titulo}</div>
                        <div className="mt-1 line-clamp-2 text-xs text-white/45">{item.mensaje || formatNotificationDate(item.created_at)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/45 p-5 shadow-2xl shadow-black/30">
                <div className="mb-4 flex items-center gap-3">
                  <Zap className="text-[#ff263f]" size={22} />
                  <h2 className="font-black uppercase">Accesos rápidos</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {quick.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link key={item.href} href={item.href} className="flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.035] p-3 text-center text-[11px] font-black uppercase transition hover:-translate-y-0.5 hover:border-[#ff263f]/50 hover:bg-[#ff263f]/10">
                        <Icon className="text-[#ff263f]" size={23} />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </aside>
          </section>

          <section className="mt-5 grid gap-4 rounded-2xl border border-white/10 bg-black/45 p-5 md:grid-cols-4">
            {[
              { icon: ShieldCheck, title: 'Seguridad total', text: 'Tus datos y archivos siempre protegidos' },
              { icon: Zap, title: 'Entrega rápida', text: 'Archivos listos en minutos, no en horas' },
              { icon: Settings, title: 'Experiencia real', text: 'Especialistas en electrónica de vehículos' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="flex items-center gap-4 border-white/10 md:border-r md:last:border-r-0">
                  <Icon className="text-[#ff263f]" size={34} />
                  <div>
                    <div className="font-black uppercase">{item.title}</div>
                    <div className="text-sm text-white/45">{item.text}</div>
                  </div>
                </div>
              )
            })}
            <div className="flex items-center justify-center text-2xl font-black uppercase italic tracking-wide">
              No vendemos archivos.<br /><span className="text-[#ff263f]">Entregamos soluciones.</span>
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}
