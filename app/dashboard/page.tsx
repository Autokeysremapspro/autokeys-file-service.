'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowDownToLine,
  Bell,
  CheckCircle2,
  Clock3,
  CloudUpload,
  Cpu,
  Database,
  FileArchive,
  Gauge,
  Headphones,
  Leaf,
  LockOpen,
  ShieldOff,
  Sparkles,
  Wallet,
  Wrench,
  Zap,
} from 'lucide-react'
import AppShell from '@/components/AppShell'
import { supabase } from '@/lib/supabase'

type Pedido = {
  id: string
  numero: string | null
  estado: string | null
  servicios: string[] | null
  marca: string | null
  modelo: string | null
  ecu: string | null
  created_at: string | null
}

const servicios = [
  { id: 'stage_1', label: 'Stage 1', price: 'Desde 35,00 €', icon: Gauge },
  { id: 'dpf_off', label: 'DPF OFF', price: 'Desde 30,00 €', icon: ShieldOff },
  { id: 'egr_off', label: 'EGR OFF', price: 'Desde 30,00 €', icon: Leaf },
  { id: 'adblue_off', label: 'AdBlue OFF', price: 'Desde 40,00 €', icon: Sparkles },
  { id: 'dtc_off', label: 'DTC OFF', price: 'Desde 20,00 €', icon: Wrench },
  { id: 'immo_off', label: 'IMMO OFF', price: 'Desde 50,00 €', icon: LockOpen },
]

const herramientas = [
  ['MAGIC FLEX', 'Compatible'],
  ['KESS3', 'Compatible'],
  ['KTAG', 'Compatible'],
  ['AUTOTUNER', 'Parcial'],
  ['CMDFlash', 'Consultar'],
]

function statusLabel(estado?: string | null) {
  const map: Record<string, string> = {
    pendiente: 'Pendiente',
    en_proceso: 'En proceso',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado',
  }
  return map[estado || ''] || estado || 'Pendiente'
}

export default function DashboardPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [email, setEmail] = useState<string>('')

  useEffect(() => {
    async function load() {
      const { data: auth } = await supabase.auth.getUser()
      setEmail(auth.user?.email || '')

      const { data } = await supabase
        .from('file_service_pedidos')
        .select('id,numero,estado,servicios,marca,modelo,ecu,created_at')
        .order('created_at', { ascending: false })
        .limit(8)

      setPedidos((data || []) as Pedido[])
    }
    load().catch(console.error)
  }, [])

  const total = pedidos.length
  const enProceso = useMemo(() => pedidos.filter((p) => p.estado === 'en_proceso').length, [pedidos])
  const terminados = useMemo(() => pedidos.filter((p) => p.estado === 'finalizado').length, [pedidos])
  const pendientes = useMemo(() => pedidos.filter((p) => !p.estado || p.estado === 'pendiente').length, [pedidos])

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-red-400">AK Cloud</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Hola, Carlos 👋</h1>
          <p className="mt-1 text-zinc-400">Bienvenido a tu plataforma profesional de soluciones electrónicas.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/nuevo-pedido" className="btn btn-red">+ Nuevo Trabajo</Link>
          <Link href="/soporte" className="btn btn-dark">Soporte Técnico</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Stat icon={Wallet} label="Saldo disponible" value="450,00 €" action="Recargar saldo" />
        <Stat icon={CheckCircle2} label="Trabajos realizados" value={String(total || 0)} action="Ver historial" green />
        <Stat icon={ArrowDownToLine} label="Archivos descargados" value={String(terminados || 0)} action="Ver archivos" purple />
        <Stat icon={Clock3} label="En proceso" value={String(enProceso || 0)} action="Ver trabajos" orange />
        <Stat icon={Headphones} label="Tickets soporte" value="2" action="Abrir ticket" blue />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_.9fr_.72fr]">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black uppercase">Nuevo trabajo</h2>
            <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-black text-red-300">Modo rápido</span>
          </div>
          <Link href="/nuevo-pedido" className="ak-grid flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/25 bg-black/20 p-7 text-center transition hover:border-red-500/60 hover:bg-red-950/10">
            <CloudUpload size={64} className="mb-5 text-red-500" />
            <h3 className="text-xl font-black">Arrastra y suelta tu archivo aquí</h3>
            <p className="mt-2 text-sm text-zinc-400">o haz clic para crear un nuevo pedido</p>
            <p className="mt-5 text-xs text-zinc-500">Formatos soportados: .bin .hex .damos .ecu .rom .zip</p>
            <span className="btn btn-red mt-6 inline-flex">Seleccionar archivo</span>
          </Link>
        </section>

        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black uppercase">ECU reconocida</h2>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-300">Identificación OK</span>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
            <div className="flex gap-4">
              <div className="flex h-20 w-24 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-950">
                <Cpu size={38} className="text-zinc-300" />
              </div>
              <div>
                <h3 className="text-xl font-black text-zinc-100">Bosch EDC17C64</h3>
                <p className="text-sm text-zinc-400">Audi A4 · 2.0 TDI</p>
                <p className="text-sm text-zinc-500">2014 - 2018 · 150 cv</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 border-t border-white/10 pt-4 text-sm">
              <Row label="Hardware" value="1037511537" />
              <Row label="Software" value="03L 906 022 AB" />
              <Row label="Checksum" value="OK" success />
              <Row label="Tamaño" value="2.048 KB" />
              <Row label="Método" value="OBD · KESS3 · FLEX" pill />
            </div>
            <Link href="/nuevo-pedido" className="btn btn-dark mt-5 block text-center text-sm">Ver ficha completa</Link>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-black uppercase">Mi plan</h2>
              <span className="rounded-lg bg-red-600 px-2 py-1 text-xs font-black">PRO</span>
            </div>
            <h3 className="mt-4 text-2xl font-black">AK PRO</h3>
            <p className="mt-1 text-sm text-zinc-400">Válido hasta: 15/06/2026</p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              <li>✓ Acceso a AutoPatch</li>
              <li>✓ Soporte prioritario</li>
              <li>✓ Descuentos PRO</li>
              <li>✓ Trabajos simultáneos: 5</li>
            </ul>
            <button className="btn btn-dark mt-5 w-full">Gestionar plan</button>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-black uppercase">Mi saldo</h2>
              <Link href="/perfil" className="text-sm font-bold text-red-400">Ver movimientos</Link>
            </div>
            <div className="mt-4 text-3xl font-black">450,00 €</div>
            <button className="btn btn-red mt-5 w-full">+ Recargar saldo</button>
          </div>
        </aside>
      </div>

      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-black uppercase">Servicios disponibles</h2>
          <Link href="/nuevo-pedido" className="text-sm font-bold text-red-400">Ver todos</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {servicios.map((service) => {
            const Icon = service.icon
            return (
              <Link key={service.id} href="/nuevo-pedido" className="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-center transition hover:-translate-y-1 hover:border-red-500/45 hover:bg-red-950/10">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-black/30 text-zinc-300 transition group-hover:text-red-400">
                  <Icon size={34} />
                </div>
                <div className="font-black uppercase">{service.label}</div>
                <div className="mt-1 text-sm text-zinc-500">{service.price}</div>
              </Link>
            )
          })}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="card p-5">
          <h2 className="mb-4 font-black uppercase">Información ECU</h2>
          <div className="rounded-3xl bg-black/20 p-4">
            <Row label="Marca" value="Audi" />
            <Row label="Modelo" value="A4" />
            <Row label="Versión" value="2.0 TDI" />
            <Row label="Combustible" value="Diésel" />
            <Row label="Tipo ECU" value="Bosch EDC17C64" />
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-4 font-black uppercase">Herramientas compatibles</h2>
          <div className="space-y-2">
            {herramientas.map(([tool, estado]) => (
              <div key={tool} className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3 text-sm">
                <span className="font-bold">{tool}</span>
                <span className={`rounded-full px-2 py-1 text-xs font-black ${estado === 'Compatible' ? 'bg-emerald-500/15 text-emerald-300' : estado === 'Parcial' ? 'bg-amber-500/15 text-amber-300' : 'bg-red-500/15 text-red-300'}`}>{estado}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-4 font-black uppercase">Últimos pedidos</h2>
          <div className="space-y-2">
            {pedidos.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">Aún no hay pedidos. Crea el primero.</div>
            ) : pedidos.slice(0, 5).map((pedido) => (
              <Link href="/pedidos" key={pedido.id} className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3 text-sm hover:bg-white/[0.06]">
                <span>
                  <span className="block font-black">{pedido.numero || 'Pedido FS'}</span>
                  <span className="text-zinc-500">{pedido.marca || 'Marca —'} {pedido.ecu ? `· ${pedido.ecu}` : ''}</span>
                </span>
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-black text-zinc-300">{statusLabel(pedido.estado)}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <footer className="flex flex-col justify-between gap-3 border-t border-white/10 pt-5 text-sm text-zinc-500 md:flex-row">
        <span>🔒 Encriptación SSL</span>
        <span>🇪🇺 Servidores en la UE</span>
        <span>☁️ Copias de seguridad diarias</span>
        <span>© 2026 Autokeys Remaps Pro</span>
      </footer>
    </div>
  )
}

function Stat({ icon: Icon, label, value, action, green, purple, orange, blue }: any) {
  const color = green ? 'text-lime-400 bg-lime-500/15' : purple ? 'text-purple-300 bg-purple-500/15' : orange ? 'text-amber-300 bg-amber-500/15' : blue ? 'text-sky-300 bg-sky-500/15' : 'text-red-300 bg-white/10'
  return (
    <div className="card p-5">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-3xl ${color}`}><Icon size={28} /></div>
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-zinc-400">{label}</p>
          <div className="mt-1 text-2xl font-black">{value}</div>
          <p className="mt-1 text-sm font-bold text-red-400">{action}</p>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, success, pill }: { label: string; value: string; success?: boolean; pill?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className={`${success ? 'text-emerald-300' : 'text-zinc-200'} ${pill ? 'rounded-full bg-red-500/15 px-2 py-1 text-xs font-black text-red-200' : 'font-bold'}`}>{value}</span>
    </div>
  )
}
