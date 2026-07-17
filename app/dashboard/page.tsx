'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  ArrowRight,
  Bell,
  BookOpen,
  Car,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Headphones,
  Library,
  Megaphone,
  PackageCheck,
  RefreshCw,
  Sparkles,
  UploadCloud,
  Wrench,
  Zap,
} from 'lucide-react'
import AppShell from '@/components/AppShell'
import { supabase } from '@/lib/supabase'
import { getMisPedidos, type FileServicePedido, formatEstado } from '@/lib/services/pedidos'
import {
  getMisNotificaciones,
  type FileServiceNotificacion,
  formatNotificationDate,
} from '@/lib/services/notificaciones'
import {
  getPlanesActivos,
  getServiciosActivos,
  getNovedadesActivas,
  type AkCloudPlan,
  type AkCloudServicio,
  type AkCloudNovedad,
} from '@/lib/services/akCloudConfig'

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-ES').format(value || 0)
}

function prettyDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function vehicleTitle(pedido: FileServicePedido) {
  return [pedido.marca, pedido.modelo, pedido.motor].filter(Boolean).join(' ') || pedido.ori_nombre || 'Vehículo pendiente'
}

function statusTone(estado?: string | null) {
  switch (estado) {
    case 'finalizado':
      return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
    case 'en_proceso':
      return 'border-amber-400/25 bg-amber-400/10 text-amber-300'
    case 'cancelado':
      return 'border-red-400/25 bg-red-400/10 text-red-300'
    default:
      return 'border-sky-400/25 bg-sky-400/10 text-sky-300'
  }
}

function orderProgress(estado?: string | null) {
  if (estado === 'finalizado') return 100
  if (estado === 'en_proceso') return 65
  if (estado === 'cancelado') return 0
  return 25
}

function QuotaGauge({ value, max }: { value: number; max: number | null }) {
  const pct = max && max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 100
  const angle = -90 + (pct / 100) * 180 // -90deg (vacío) a +90deg (lleno)
  const radius = 78
  const circumference = Math.PI * radius // longitud de la media circunferencia
  const dash = (pct / 100) * circumference

  return (
    <svg viewBox="0 0 200 118" className="w-full max-w-[220px]" aria-hidden="true">
      <defs>
        <linearGradient id="gaugeFill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7a0517" />
          <stop offset="100%" stopColor="#ff2448" />
        </linearGradient>
      </defs>
      {/* pista de fondo */}
      <path d="M 22 100 A 78 78 0 0 1 178 100" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="14" strokeLinecap="round" />
      {/* marcas tipo cuentakilómetros */}
      {Array.from({ length: 9 }).map((_, i) => {
        const tickAngle = -90 + (i / 8) * 180
        const rad = (tickAngle * Math.PI) / 180
        const x1 = 100 + Math.sin(rad) * 68
        const y1 = 100 - Math.cos(rad) * 68
        const x2 = 100 + Math.sin(rad) * 78
        const y2 = 100 - Math.cos(rad) * 78
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,.18)" strokeWidth="1.5" />
      })}
      {/* arco de saldo real */}
      <path
        d="M 22 100 A 78 78 0 0 1 178 100"
        fill="none"
        stroke="url(#gaugeFill)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        style={{ transition: 'stroke-dasharray .6s ease' }}
      />
      {/* aguja */}
      <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '100px 100px', transition: 'transform .6s ease' }}>
        <line x1="100" y1="100" x2="100" y2="34" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="100" cy="100" r="6" fill="#fff" />
      </g>
    </svg>
  )
}

export default function DashboardPage() {
  const [pedidos, setPedidos] = useState<FileServicePedido[]>([])
  const [notificaciones, setNotificaciones] = useState<FileServiceNotificacion[]>([])
  const [planes, setPlanes] = useState<AkCloudPlan[]>([])
  const [servicios, setServicios] = useState<AkCloudServicio[]>([])
  const [novedades, setNovedades] = useState<AkCloudNovedad[]>([])
  const [userName, setUserName] = useState('Distribuidor')
  const [planSlug, setPlanSlug] = useState<string | null>(null)
  const [planExpiraAt, setPlanExpiraAt] = useState<string | null>(null)
  const [pedidosHoy, setPedidosHoy] = useState(0)
  const [renovando, setRenovando] = useState(false)
  const [cambiando, setCambiando] = useState(false)
  const [renovacionSolicitada, setRenovacionSolicitada] = useState(false)
  const [mostrarOnboarding, setMostrarOnboarding] = useState(false)
  const [eligiendoPlan, setEligiendoPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadDashboard() {
    setLoading(true)
    setError(null)

    try {
      const [pedidosData, notifData, planesData, serviciosData, novedadesData, auth] = await Promise.all([
        getMisPedidos(),
        getMisNotificaciones(),
        getPlanesActivos(),
        getServiciosActivos(),
        getNovedadesActivas(),
        supabase.auth.getUser(),
      ])

      setPedidos(pedidosData)
      setNotificaciones(notifData)
      setPlanes(planesData)
      setServicios(serviciosData)
      setNovedades(novedadesData)

      const user = auth.data.user
      const metadata = user?.user_metadata || {}
      const resolvedName = metadata.name || metadata.nombre || metadata.empresa || user?.email?.split('@')[0] || 'Distribuidor'
      setUserName(String(resolvedName))
      setPlanSlug(metadata.plan_slug || metadata.plan || null)

      if (user?.id) {
        const inicioHoy = new Date()
        inicioHoy.setHours(0, 0, 0, 0)
        const [{ data: dist }, { count }] = await Promise.all([
          supabase.from('akcloud_distribuidores').select('plan_expira_at, solicito_renovacion, onboarding_completado').eq('auth_user_id', user.id).maybeSingle(),
          supabase.from('file_service_pedidos').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', inicioHoy.toISOString()),
        ])
        setPlanExpiraAt(dist?.plan_expira_at || null)
        setRenovacionSolicitada(Boolean(dist?.solicito_renovacion))
        setMostrarOnboarding(dist ? !dist.onboarding_completado : false)
        setPedidosHoy(count || 0)
      }
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'No se pudo cargar el dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  async function solicitarRenovacion() {
    setRenovando(true)
    try {
      const res = await fetch('/api/planes/solicitar-renovacion', { method: 'POST' })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      setRenovacionSolicitada(true)
    } catch (err: any) {
      setError(err?.message || 'No se pudo enviar la solicitud')
    } finally {
      setRenovando(false)
    }
  }

  async function elegirPlan(planId: string) {
    setEligiendoPlan(planId)
    try {
      const res = await fetch('/api/planes/elegir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      setMostrarOnboarding(false)
      toast.success(result.esFree ? 'Plan Free activado' : 'Elección guardada — te avisaremos cuando se confirme el pago.')
      await loadDashboard()
    } catch (err: any) {
      setError(err?.message || 'No se pudo guardar tu elección de plan')
    } finally {
      setEligiendoPlan(null)
    }
  }

  async function cambiarAFree() {
    if (!confirm('¿Pasar al plan Free? Dejarás de tener cuota mensual y cada solución se pagará por separado.')) return
    setCambiando(true)
    try {
      const res = await fetch('/api/planes/cambiar-a-free', { method: 'POST' })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      await loadDashboard()
    } catch (err: any) {
      setError(err?.message || 'No se pudo cambiar de plan')
    } finally {
      setCambiando(false)
    }
  }

  // El dashboard ya decía "En tiempo real" en las tarjetas de estadísticas,
  // pero no tenía ninguna suscripción — se cargaba una vez y ya está. Ahora
  // sí se actualiza solo cuando cambia un pedido o llega una notificación.
  useEffect(() => {
    let userId: string | null = null
    let channel: ReturnType<typeof supabase.channel> | null = null

    supabase.auth.getUser().then(({ data }) => {
      userId = data.user?.id || null
      if (!userId) return
      channel = supabase
        .channel(`dashboard-${userId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'file_service_pedidos', filter: `user_id=eq.${userId}` },
          () => loadDashboard()
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'file_service_notificaciones', filter: `user_id=eq.${userId}` },
          () => loadDashboard()
        )
        .subscribe()
    })

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  const stats = useMemo(() => {
    const pendientes = pedidos.filter((pedido) => pedido.estado === 'pendiente').length
    const enProceso = pedidos.filter((pedido) => pedido.estado === 'en_proceso').length
    const finalizados = pedidos.filter((pedido) => pedido.estado === 'finalizado').length
    const descargas = pedidos.filter((pedido) => Boolean(pedido.mod_path)).length
    const sinLeer = notificaciones.filter((item) => !item.leida).length
    const vehiculos = new Set(
      pedidos
        .map((pedido) => [pedido.marca, pedido.modelo, pedido.motor].filter(Boolean).join('|'))
        .filter(Boolean),
    ).size

    return { pendientes, enProceso, finalizados, descargas, sinLeer, vehiculos }
  }, [pedidos, notificaciones])

  const activePlan = useMemo(() => {
    if (!planes.length) return null
    if (planSlug) {
      const matched = planes.find((plan) => plan.slug === planSlug)
      if (matched) return matched
    }
    return planes.find((plan) => plan.destacado) || planes[0]
  }, [planes, planSlug])

  const latestOrders = pedidos.slice(0, 5)
  const readyDownloads = pedidos.filter((pedido) => pedido.mod_path).slice(0, 4)
  const latestNotices = notificaciones.slice(0, 4)
  const activeOrders = stats.pendientes + stats.enProceso

  const quickActions = [
    { href: '/nuevo-pedido', label: 'Nuevo pedido', description: 'Envía un archivo en menos de un minuto', icon: UploadCloud, featured: true },
    { href: '/pedidos', label: 'Mis pedidos', description: 'Consulta estados y archivos', icon: FileText },
    { href: '/biblioteca', label: 'Biblioteca', description: 'Accede a tus ORI y MOD', icon: Library },
    { href: '/garage', label: 'Mi garaje', description: 'Historial por vehículo', icon: Car },
    { href: '/soporte', label: 'Soporte', description: 'Habla con nuestro equipo', icon: Headphones },
  ]

  return (
    <AppShell>
      {mostrarOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/12 bg-[#0a0a0c] shadow-[0_50px_150px_rgba(0,0,0,.7)]">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-red-600/20 blur-[100px]" />
            <div
              className="h-1.5 w-full opacity-70"
              style={{ backgroundImage: 'repeating-conic-gradient(#0a0a0a 0% 25%, #e5e5e5 0% 50%)', backgroundSize: '10px 10px' }}
              aria-hidden="true"
            />
            <div className="relative p-7 sm:p-10">
              <div className="mb-8 text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[.22em] text-red-300">
                  <Sparkles size={14} /> Bienvenido a AK Cloud
                </span>
                <h2 className="mt-4 text-3xl font-black uppercase italic tracking-tight sm:text-4xl">Elige tu plan para empezar</h2>
                <p className="mx-auto mt-3 max-w-xl text-sm text-white/45">
                  Puedes cambiarlo cuando quieras desde tu panel. El plan Free se activa al instante; los planes de pago quedan activos en cuanto confirmemos tu pago.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {planes.map((plan) => (
                  <div
                    key={plan.id}
                    className={`flex flex-col rounded-[1.6rem] border p-6 ${plan.destacado ? 'border-red-400/40 bg-gradient-to-b from-red-600/[.12] to-transparent shadow-[0_0_50px_rgba(217,4,41,.15)]' : 'border-white/10 bg-white/[.02]'}`}
                  >
                    {plan.destacado && (
                      <span className="mb-3 inline-flex w-fit items-center rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider">Recomendado</span>
                    )}
                    <h3 className="text-xl font-black uppercase">{plan.nombre}</h3>
                    <p className="mt-1 min-h-[40px] text-xs leading-5 text-white/40">{plan.descripcion}</p>
                    <p className="mt-4 text-3xl font-black tabular-nums">
                      {plan.precio_mensual > 0 ? `${plan.precio_mensual.toFixed(0)} €` : 'Gratis'}
                      {plan.precio_mensual > 0 && <span className="text-sm font-medium text-white/35">/mes</span>}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wide text-red-300">{plan.limite_diario_pedidos ? `${plan.limite_diario_pedidos} pedidos al día` : 'Sin límite diario'}</p>
                    <ul className="mt-4 flex-1 space-y-2 text-xs text-white/50">
                      {(plan.ventajas || []).slice(0, 4).map((v) => (
                        <li key={v} className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />{v}</li>
                      ))}
                    </ul>
                    <button
                      disabled={eligiendoPlan !== null}
                      onClick={() => elegirPlan(plan.id!)}
                      className={`mt-6 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition disabled:opacity-50 ${plan.destacado ? 'bg-gradient-to-r from-red-700 to-red-500 text-white' : 'border border-white/15 bg-white/[.04] text-white hover:bg-white/[.08]'}`}
                    >
                      {eligiendoPlan === plan.id ? 'Guardando...' : `Empezar con ${plan.nombre}`}
                    </button>
                  </div>
                ))}
              </div>

              {planes.length === 0 && (
                <p className="text-center text-sm text-white/40">Todavía no hay planes configurados — pídele a Autokeys que te asigne uno.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/55 shadow-[0_35px_120px_rgba(0,0,0,.58)]">
          <div className="absolute inset-0 bg-[url('/images/ak-dashboard-hero-racing.webp')] bg-cover bg-center opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-red-600/20 blur-[110px]" />

          <div className="relative grid min-h-[360px] gap-8 p-7 md:p-10 xl:grid-cols-[1fr_360px] xl:p-12">
            <div className="flex flex-col justify-center">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[.22em] text-emerald-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" /> Laboratorio operativo
                </span>
                {activePlan && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[.22em] text-red-300">
                    <Sparkles size={14} /> Plan {activePlan.nombre}
                  </span>
                )}
              </div>

              <p className="text-sm font-black uppercase tracking-[.28em] text-white/55">Bienvenido de nuevo</p>
              <h1 className="mt-3 max-w-4xl text-4xl font-black uppercase italic leading-[.95] tracking-tight md:text-6xl xl:text-7xl">
                Hola, <span className="text-red-400 drop-shadow-[0_0_28px_rgba(248,113,113,.35)]">{userName}</span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60 md:text-xl">
                Gestiona tus archivos, créditos, pedidos y soporte desde un único workspace profesional.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/nuevo-pedido" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-700 to-red-500 px-6 py-4 text-sm font-black uppercase shadow-[0_20px_55px_rgba(217,4,41,.38)] transition hover:-translate-y-0.5">
                  <UploadCloud size={20} /> Crear nuevo pedido
                </Link>
                <Link href="/pedidos" className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-black/35 px-6 py-4 text-sm font-black uppercase backdrop-blur-xl transition hover:border-red-400/45 hover:bg-white/[.06]">
                  Ver mis pedidos <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            <div className="self-center rounded-[1.7rem] border border-white/10 bg-black/45 p-6 backdrop-blur-2xl">
              <div className="flex flex-col items-center text-center">
                <p className="text-[11px] font-black uppercase tracking-[.24em] text-white/40">Pedidos disponibles hoy</p>
                {activePlan?.limite_diario_pedidos ? (
                  <>
                    <QuotaGauge value={Math.max(0, activePlan.limite_diario_pedidos - pedidosHoy)} max={activePlan.limite_diario_pedidos} />
                    <p className="-mt-6 text-4xl font-black tabular-nums">{Math.max(0, activePlan.limite_diario_pedidos - pedidosHoy)}</p>
                    <p className="text-sm text-white/45">de {formatNumber(activePlan.limite_diario_pedidos)} al día · {activePlan.nombre}</p>
                  </>
                ) : (
                  <>
                    <p className="mt-4 text-4xl font-black uppercase text-emerald-300">Sin límite</p>
                    <p className="text-sm text-white/45">{activePlan?.nombre || 'Tu plan'} · pide los que necesites</p>
                  </>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[.2em] text-white/35">Trabajos activos</p>
                  <p className="mt-2 text-3xl font-black tabular-nums">{activeOrders}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[.2em] text-white/35">Archivos listos</p>
                  <p className="mt-2 text-3xl font-black tabular-nums">{stats.descargas}</p>
                </div>
              </div>

              <Link href="/nuevo-pedido" className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-black uppercase text-red-300 transition hover:bg-red-500/15">
                Crear nuevo pedido <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        <div
          className="h-2 w-full rounded-full opacity-70"
          style={{
            backgroundImage:
              'repeating-conic-gradient(#0a0a0a 0% 25%, #e5e5e5 0% 50%)',
            backgroundSize: '10px 10px',
          }}
          aria-hidden="true"
        />

        {novedades.length > 0 && (
          <section className="rounded-[1.8rem] border border-red-400/20 bg-gradient-to-br from-red-950/40 via-black/45 to-black/45 p-5 shadow-2xl shadow-black/30">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
                <Megaphone size={22} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[.22em] text-red-400">Novedades AK Cloud</p>
                <h2 className="text-lg font-black uppercase text-white/90">Lo último del laboratorio</h2>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {novedades.slice(0, 6).map((novedad) => (
                <div
                  key={novedad.id}
                  className={`rounded-2xl border p-4 ${
                    novedad.destacado
                      ? 'border-red-400/35 bg-red-500/[.08]'
                      : 'border-white/10 bg-white/[.03]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg leading-none">{novedad.icono || '📣'}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black uppercase text-white/90">{novedad.titulo}</p>
                      {novedad.contenido && (
                        <p className="mt-1 line-clamp-3 text-xs leading-5 text-white/45">{novedad.contenido}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {error && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-200">
            <span>{error}</span>
            <button onClick={loadDashboard} className="inline-flex items-center gap-2 rounded-xl border border-red-300/20 px-3 py-2 font-black uppercase">
              <RefreshCw size={15} /> Reintentar
            </button>
          </div>
        )}

        {planExpiraAt && new Date(planExpiraAt).getTime() < Date.now() && (
          <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-5">
            <p className="font-black uppercase text-amber-200">Tu plan {activePlan?.nombre || ''} ha caducado</p>
            <p className="mt-1 text-sm text-amber-100/70">
              Elige si quieres renovarlo (el staff confirma el pago y lo reactiva) o pasar al plan Free, donde pagas cada solución por separado sin cuota mensual.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={solicitarRenovacion}
                disabled={renovando || renovacionSolicitada}
                className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-black uppercase text-black disabled:opacity-50"
              >
                {renovacionSolicitada ? 'Renovación solicitada — a la espera' : renovando ? 'Enviando...' : `Renovar ${activePlan?.nombre || 'mi plan'}`}
              </button>
              <button
                onClick={cambiarAFree}
                disabled={cambiando}
                className="rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm font-black uppercase text-white/80 disabled:opacity-50"
              >
                {cambiando ? 'Cambiando...' : 'Pasar a plan Free (pago por solución)'}
              </button>
            </div>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Pedidos activos', value: activeOrders, detail: `${stats.pendientes} pendientes · ${stats.enProceso} en proceso`, icon: Clock3, tone: 'text-amber-300 bg-amber-400/10' },
            { label: 'Trabajos finalizados', value: stats.finalizados, detail: `${pedidos.length} pedidos totales`, icon: CheckCircle2, tone: 'text-emerald-300 bg-emerald-400/10' },
            { label: 'Descargas disponibles', value: stats.descargas, detail: 'Archivos MOD listos', icon: Download, tone: 'text-sky-300 bg-sky-400/10' },
            { label: 'Vehículos en Garage', value: stats.vehiculos, detail: 'Historial técnico privado', icon: Car, tone: 'text-red-300 bg-red-500/10' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="ak-card-hover rounded-[1.6rem] border border-white/10 bg-white/[.035] p-5 shadow-2xl shadow-black/25">
                <div className="flex items-center justify-between gap-4">
                  <div className={`flex h-13 w-13 items-center justify-center rounded-2xl p-3 ${item.tone}`}>
                    <Icon size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[.22em] text-white/25">En tiempo real</span>
                </div>
                <p className="mt-5 text-4xl font-black">{loading ? '—' : item.value}</p>
                <p className="mt-2 text-xs font-black uppercase tracking-[.16em] text-white/65">{item.label}</p>
                <p className="mt-2 text-sm text-white/35">{item.detail}</p>
              </div>
            )
          })}
        </section>

        <section className="grid gap-5 2xl:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-[1.8rem] border border-white/10 bg-black/45 shadow-2xl shadow-black/30">
            <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[.22em] text-red-400">Actividad reciente</p>
                <h2 className="mt-1 text-xl font-black uppercase">Últimos pedidos</h2>
              </div>
              <Link href="/pedidos" className="inline-flex items-center gap-2 text-xs font-black uppercase text-red-300">
                Ver todos <ArrowRight size={15} />
              </Link>
            </div>

            <div className="divide-y divide-white/10">
              {loading ? (
                <div className="p-8 text-white/40">Cargando pedidos...</div>
              ) : latestOrders.length === 0 ? (
                <div className="p-10 text-center">
                  <PackageCheck className="mx-auto text-white/20" size={42} />
                  <p className="mt-4 font-black uppercase">Todavía no hay pedidos</p>
                  <p className="mt-2 text-sm text-white/40">Crea el primero para empezar tu historial.</p>
                  <Link href="/nuevo-pedido" className="mt-5 inline-flex rounded-xl bg-red-600 px-4 py-3 text-sm font-black uppercase">Nuevo pedido</Link>
                </div>
              ) : latestOrders.map((pedido) => (
                <Link key={pedido.id} href={`/pedidos/${pedido.id}`} className="grid items-center gap-4 p-5 transition hover:bg-white/[.03] md:grid-cols-[105px_1fr_150px_120px]">
                  <div>
                    <p className="text-sm font-black text-red-400">#{pedido.numero || 'AKFS'}</p>
                    <p className="mt-1 text-xs text-white/30">{prettyDate(pedido.created_at)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-black uppercase">{vehicleTitle(pedido)}</p>
                    <p className="mt-1 truncate text-sm text-white/40">{pedido.ecu || 'ECU pendiente'} · {pedido.hw || 'HW pendiente'}</p>
                  </div>
                  <div className="hidden md:block">
                    <p className="truncate text-xs font-black uppercase text-white/65">{pedido.servicios?.join(' · ') || 'Servicio pendiente'}</p>
                  </div>
                  <div>
                    <span className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-black uppercase ${statusTone(pedido.estado)}`}>
                      {formatEstado(pedido.estado)}
                    </span>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-red-700 to-red-400" style={{ width: `${orderProgress(pedido.estado)}%` }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[1.8rem] border border-white/10 bg-black/45 p-5 shadow-2xl shadow-black/30">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black uppercase text-white/90">Trabaja más rápido</h2>
                </div>
                <Zap className="text-red-400" size={24} />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className={`group rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
                        action.featured
                          ? 'border-red-400/25 bg-gradient-to-br from-red-700/35 to-red-500/10 shadow-[0_18px_50px_rgba(217,4,41,.18)]'
                          : 'border-white/10 bg-white/[.035] hover:border-red-400/35 hover:bg-white/[.055]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/25 text-red-300">
                          <Icon size={21} />
                        </div>
                        <ArrowRight className="text-white/20 transition group-hover:translate-x-1 group-hover:text-red-300" size={18} />
                      </div>
                      <p className="mt-4 text-sm font-black uppercase">{action.label}</p>
                      <p className="mt-1 text-xs leading-5 text-white/35">{action.description}</p>
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-black/45 p-5 shadow-2xl shadow-black/30">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[.22em] text-red-400">Tu plan</p>
                  <h2 className="mt-1 text-xl font-black uppercase">{activePlan?.nombre || 'Cuenta activa'}</h2>
                </div>
                <Sparkles className="text-red-400" size={23} />
              </div>
              <p className="mt-3 text-sm leading-6 text-white/45">{activePlan?.descripcion || 'Tu cuenta está conectada al ecosistema Autokeys.'}</p>
              {activePlan && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[.18em] text-white/30">Precio</p>
                    <p className="mt-2 text-2xl font-black">{activePlan.precio_mensual.toFixed(2)} €</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[.18em] text-white/30">Límite diario</p>
                    <p className="mt-2 text-2xl font-black">{activePlan.limite_diario_pedidos ? `${activePlan.limite_diario_pedidos}/día` : 'Sin límite'}</p>
                  </div>
                  {planExpiraAt && (
                    <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
                      <p className="text-[10px] font-black uppercase tracking-[.18em] text-white/30">Plan activo hasta</p>
                      <p className="mt-2 text-lg font-black">{new Date(planExpiraAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</p>
                      <p className="mt-1 text-xs text-white/35">
                        {Math.max(0, Math.ceil((new Date(planExpiraAt).getTime() - Date.now()) / 86400000))} días restantes
                      </p>
                    </div>
                  )}
                  {typeof activePlan.limite_diario_pedidos === 'number' && (
                    <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
                      <p className="text-[10px] font-black uppercase tracking-[.18em] text-white/30">Pedidos hoy</p>
                      <p className="mt-2 text-2xl font-black">{pedidosHoy} / {activePlan.limite_diario_pedidos}</p>
                    </div>
                  )}
                </div>
              )}
              <Link href="/pedidos" className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase text-red-300">
                Ver mis pedidos <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_.9fr_.9fr]">
          <div className="rounded-[1.8rem] border border-white/10 bg-black/45 p-5 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black uppercase text-white/90">Archivos listos</h2>
              </div>
              <Download className="text-red-400" size={22} />
            </div>
            <div className="mt-4 divide-y divide-white/10">
              {readyDownloads.length === 0 ? (
                <p className="py-5 text-sm text-white/40">Los archivos finalizados aparecerán aquí.</p>
              ) : readyDownloads.map((pedido) => (
                <Link key={pedido.id} href={`/pedidos/${pedido.id}`} className="flex items-center justify-between gap-3 py-4 transition hover:text-red-300">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">{pedido.mod_nombre || `${pedido.numero || 'AKFS'}_MOD`}</p>
                    <p className="mt-1 text-xs text-white/35">{vehicleTitle(pedido)}</p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                    <Download size={18} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-black/45 p-5 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black uppercase text-white/90">Notificaciones</h2>
              </div>
              <div className="relative">
                <Bell className="text-red-400" size={22} />
                {stats.sinLeer > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 text-[10px] font-black">{stats.sinLeer}</span>}
              </div>
            </div>
            <div className="mt-4 divide-y divide-white/10">
              {latestNotices.length === 0 ? (
                <p className="py-5 text-sm text-white/40">No hay novedades pendientes.</p>
              ) : latestNotices.map((notice) => (
                <Link key={notice.id} href={notice.pedido_id ? `/pedidos/${notice.pedido_id}` : '/notificaciones'} className="block py-4">
                  <p className="truncate text-sm font-black">{notice.titulo}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/35">{notice.mensaje || formatNotificationDate(notice.created_at)}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/45 p-5 shadow-2xl shadow-black/30">
            <div className="absolute inset-0 bg-[url('/images/ak-dashboard-hero-racing.webp')] bg-cover bg-center opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-red-950/55" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black uppercase text-white/90">Soluciones Autokeys</h2>
                </div>
                <Wrench className="text-red-400" size={22} />
              </div>
              <p className="mt-4 text-5xl font-black">{servicios.length}</p>
              <p className="mt-2 text-sm leading-6 text-white/45">Servicios y soluciones configurados desde Autokeys Core.</p>
              <Link href="/nuevo-pedido" className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-xs font-black uppercase text-red-300">
                Ver servicios <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-[1.8rem] border border-white/10 bg-white/[.025] p-5 md:grid-cols-3">
          {[
            { icon: Zap, title: 'Entrega rápida', text: 'Flujo directo entre AK Cloud y Autokeys Core.' },
            { icon: BookOpen, title: 'Historial completo', text: 'Todos tus vehículos, pedidos y archivos organizados.' },
            { icon: Headphones, title: 'Soporte especializado', text: 'Asistencia real de técnicos de electrónica de vehículos.' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="flex items-start gap-4 rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                  <Icon size={23} />
                </div>
                <div>
                  <p className="font-black uppercase">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-white/35">{item.text}</p>
                </div>
              </div>
            )
          })}
        </section>
      </div>
    </AppShell>
  )
}
