'use client'

import Link from 'next/link'
import { Bell, Search, Sparkles, UploadCloud } from 'lucide-react'
import AKButton from './AKButton'

export default function AKTopbar({ title = 'Workspace', subtitle = 'Professional File Service' }: { title?: string; subtitle?: string }) {
  return (
    <header className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--ak-red)]/25 bg-[var(--ak-red)]/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.28em] text-[var(--ak-glow)]">
          <Sparkles size={14} /> AK Cloud
        </div>
        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/42">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="hidden min-w-[280px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-bold text-white/35 md:flex">
          <Search size={18} /> Search ECU, HW, SW, order...
        </div>
        <button className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-3 hover:bg-white/[0.07]">
          <Bell size={19} />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ak-red)] text-[11px] font-black">3</span>
        </button>
        <AKButton href="/nuevo-pedido"><UploadCloud size={18} /> New Job</AKButton>
      </div>
    </header>
  )
}
