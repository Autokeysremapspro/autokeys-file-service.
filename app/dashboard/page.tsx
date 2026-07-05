'use client'

import Link from 'next/link'
import { Bell, CloudUpload, Download, LifeBuoy, Rocket, Wallet } from 'lucide-react'

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#050509] text-white">
      <div className="mx-auto grid max-w-7xl gap-6 p-5 lg:grid-cols-[260px_1fr_320px]">
        <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-8">
            <div className="text-3xl font-black tracking-tight">AK CLOUD</div>
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">Autokeys File Service</div>
          </div>
          <nav className="space-y-2 text-sm font-bold">
            <Link className="block rounded-2xl bg-red-600 px-4 py-3" href="/dashboard">Dashboard</Link>
            <Link className="block rounded-2xl px-4 py-3 text-zinc-300 hover:bg-white/10" href="/nuevo-pedido">Nuevo trabajo</Link>
            <Link className="block rounded-2xl px-4 py-3 text-zinc-300 hover:bg-white/10" href="/pedidos">Mis trabajos</Link>
            <Link className="block rounded-2xl px-4 py-3 text-zinc-300 hover:bg-white/10" href="/descargas">Mis archivos</Link>
            <Link className="block rounded-2xl px-4 py-3 text-zinc-300 hover:bg-white/10" href="/perfil">Mi cuenta</Link>
          </nav>
        </aside>

        <section className="space-y-6">
          <header className="flex items-center justify-between rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">Professional File Service</div>
              <h1 className="mt-1 text-3xl font-black">Panel AK Cloud</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="rounded-2xl border border-white/10 bg-white/5 p-3"><Bell size={20} /></button>
              <Link href="/nuevo-pedido" className="rounded-2xl bg-red-600 px-5 py-3 font-black shadow-lg shadow-red-950/40">Nuevo pedido</Link>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-4">
            <Stat icon={<Wallet />} label="Saldo" value="250 €" />
            <Stat icon={<Rocket />} label="Trabajos" value="125" />
            <Stat icon={<CloudUpload />} label="En proceso" value="7" />
            <Stat icon={<Download />} label="Descargas" value="92" />
          </div>

          <div className="rounded-[2rem] border border-red-500/20 bg-gradient-to-br from-red-950/30 to-white/[0.04] p-8">
            <div className="mb-4 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-red-300">Subida rápida</div>
            <h2 className="text-4xl font-black">Envía un archivo en menos de 60 segundos</h2>
            <p className="mt-3 max-w-2xl text-zinc-400">Arrastra el ORI, selecciona servicios compatibles y crea el pedido. Rápido, limpio y pensado para distribuidores.</p>
            <Link href="/nuevo-pedido" className="mt-6 inline-flex rounded-2xl bg-red-600 px-6 py-4 font-black">Crear nuevo pedido</Link>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h3 className="text-2xl font-black">Últimos pedidos</h3>
            <div className="mt-5 space-y-3">
              {['FS-2026-00012 · BMW 320d · Stage 1', 'FS-2026-00011 · Audi A4 · DPF + EGR', 'FS-2026-00010 · Golf GTI · Pops & Bangs'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-zinc-300">{item}</div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Plan actual</div>
            <div className="mt-2 text-2xl font-black">Professional</div>
            <p className="mt-2 text-sm text-zinc-400">Soporte prioritario y cola rápida.</p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <LifeBuoy className="text-red-400" />
            <div className="mt-3 text-xl font-black">Soporte técnico</div>
            <p className="mt-2 text-sm text-zinc-400">Respuestas rápidas dentro del horario de laboratorio.</p>
          </div>
        </aside>
      </div>
    </main>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
      <div className="text-red-400">{icon}</div>
      <div className="mt-3 text-sm font-bold uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-1 text-2xl font-black">{value}</div>
    </div>
  )
}
