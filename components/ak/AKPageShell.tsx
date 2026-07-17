'use client'

import Link from 'next/link'
import { Bell, Menu, Search, UploadCloud } from 'lucide-react'
import AKSidebar from './AKSidebar'

export default function AKPageShell({
  children,
  title,
  subtitle,
  eyebrow = 'AK Cloud',
  actions,
}: {
  children: React.ReactNode
  title?: string
  subtitle?: string
  eyebrow?: string
  actions?: React.ReactNode
}) {
  return (
    <main className="ak-noise ak-grid ak-premium-shell flex min-h-screen text-white">
      <AKSidebar />
      <section className="relative z-10 min-w-0 flex-1">
        <header className="ak-premium-topbar sticky top-0 z-40 flex min-h-[72px] items-center justify-between border-b px-4 backdrop-blur-2xl lg:px-7 xl:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button aria-label="Abrir menú" className="rounded-[14px] border border-white/[.08] bg-white/[.035] p-3 text-white/70 transition hover:border-white/[.15] hover:bg-white/[.065] hover:text-white lg:hidden"><Menu size={19} /></button>
            <div className="hidden min-w-[310px] items-center gap-3 rounded-[14px] border border-white/[.075] bg-white/[.025] px-4 py-2.5 text-sm font-semibold text-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,.025)] transition hover:border-white/[.13] hover:bg-white/[.04] md:flex">
              <Search size={17} /> Buscar pedido, ECU, HW, SW...
              <span className="ml-auto rounded-md border border-white/[.08] bg-black/20 px-2 py-1 text-[10px] font-black text-white/25">⌘ K</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/nuevo-pedido" className="group relative hidden overflow-hidden rounded-[14px] border border-red-400/25 bg-gradient-to-r from-[#b80725] to-[#ef2444] px-4 py-2.5 text-sm font-black text-white shadow-[0_12px_38px_rgba(217,4,41,.25),inset_0_1px_0_rgba(255,255,255,.18)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(217,4,41,.34)] md:inline-flex md:items-center md:gap-2">
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <UploadCloud size={17} className="relative" /> <span className="relative">Nuevo pedido</span>
            </Link>
            <Link href="/notificaciones" aria-label="Notificaciones" className="relative rounded-[14px] border border-white/[.08] bg-white/[.035] p-3 text-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,.025)] transition hover:border-white/[.15] hover:bg-white/[.07] hover:text-white">
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-[#07080b] bg-red-500 px-1 text-[9px] font-black">3</span>
            </Link>
          </div>
        </header>
        <div className="ak-premium-content p-4 sm:p-5 lg:p-7 xl:p-9">
          {(title || subtitle) && (
            <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <div>
                <p className="ak-eyebrow text-[10px] font-black uppercase tracking-[0.26em] text-red-300">{eyebrow}</p>
                {title && <h1 className="ak-premium-heading mt-4 text-4xl font-black tracking-[-.045em] md:text-5xl">{title}</h1>}
                {subtitle && <p className="mt-3 max-w-3xl text-sm leading-6 text-white/42">{subtitle}</p>}
              </div>
              {actions}
            </div>
          )}
          {children}
        </div>
      </section>
    </main>
  )
}
