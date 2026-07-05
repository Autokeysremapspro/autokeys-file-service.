'use client'

import AKSidebar from '@/components/ak/AKSidebar'
import AKStatCard from '@/components/ak/AKStatCard'
import AKUploader from '@/components/ak/AKUploader'
import AKECUCard from '@/components/ak/AKECUCard'
import AKButton from '@/components/ak/AKButton'
import { Bell, Search, Sparkles } from 'lucide-react'
import { useState } from 'react'

export default function DashboardPage() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [analysed, setAnalysed] = useState(false)

  function handleFile(file: File) {
    setFileName(file.name)
    setAnalysed(false)
    window.setTimeout(() => setAnalysed(true), 900)
  }

  return (
    <main className="ak-noise flex min-h-screen">
      <AKSidebar />
      <section className="flex-1 p-5 lg:p-8">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--ak-glow)]">AK Cloud Workspace</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">File Service, reimagined.</h1>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white/40"><Search size={18} /> Search ECU, HW, order...</div>
            <button className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"><Bell size={20} /></button>
          </div>
        </header>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <AKStatCard label="Balance" value="250 €" helper="Professional plan" tone="green" />
          <AKStatCard label="Jobs" value="126" helper="Total requests" tone="blue" />
          <AKStatCard label="Processing" value="4" helper="Active jobs" tone="orange" />
          <AKStatCard label="Downloads" value="98" helper="Ready files" tone="red" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <AKUploader fileName={fileName} onFile={handleFile} />
            {fileName && (
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-[var(--ak-glow)]" />
                  <div>
                    <h3 className="font-black">Intelligent analysis</h3>
                    <p className="text-sm text-white/35">Detecting ECU, HW/SW, checksum and compatible services...</p>
                  </div>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full bg-[var(--ak-red)] transition-all duration-700 ${analysed ? 'w-full' : 'w-1/2'}`} /></div>
              </div>
            )}
            <AKButton href="/nuevo-pedido" className="w-full">Create tuning request</AKButton>
          </div>
          <AKECUCard visible={analysed} />
        </div>
      </section>
    </main>
  )
}
