'use client'

import AKSidebar from '@/components/ak/AKSidebar'
import AKTopbar from '@/components/ak/AKTopbar'
import AKStatCard from '@/components/ak/AKStatCard'
import AKUploader from '@/components/ak/AKUploader'
import AKAnalysisProgress from '@/components/ak/AKAnalysisProgress'
import AKECUCard from '@/components/ak/AKECUCard'
import AKButton from '@/components/ak/AKButton'
import { ArrowRight, Car, Clock3, FileDown, FolderOpen, Headphones, Library, Sparkles, UploadCloud } from 'lucide-react'
import { useState } from 'react'

const recent = [
  { code: 'FS-2026-00128', car: 'BMW 320d · EDC17C50', status: 'Processing', tone: 'text-[var(--ak-blue)]' },
  { code: 'FS-2026-00127', car: 'Audi A4 · EDC17C64', status: 'Ready', tone: 'text-[var(--ak-green)]' },
  { code: 'FS-2026-00126', car: 'Golf GTI · MED17.5', status: 'Queue', tone: 'text-[var(--ak-orange)]' },
]

export default function DashboardPage() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [analysing, setAnalysing] = useState(false)
  const [analysed, setAnalysed] = useState(false)

  function handleFile(file: File) {
    setFileName(file.name)
    setAnalysed(false)
    setAnalysing(true)
    window.setTimeout(() => setAnalysed(true), 1050)
  }

  return (
    <main className="ak-noise ak-grid relative flex min-h-screen overflow-hidden">
      <AKSidebar />
      <section className="relative z-10 flex-1 p-5 lg:p-8">
        <AKTopbar title="Workspace" subtitle="A premium cloud workspace for tuning requests, ECU files and distributor workflow." />

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <AKStatCard label="Balance" value="250 €" helper="Professional plan" tone="green" />
          <AKStatCard label="Jobs" value="126" helper="Total requests" tone="blue" />
          <AKStatCard label="Processing" value="4" helper="Active jobs" tone="orange" />
          <AKStatCard label="Downloads" value="98" helper="Ready files" tone="red" />
        </div>

        <div className="grid gap-6 2xl:grid-cols-[1fr_430px]">
          <div className="space-y-6">
            <AKUploader fileName={fileName} onFile={handleFile} />
            <AKAnalysisProgress active={analysing} done={analysed} />

            <div className="grid gap-4 md:grid-cols-4">
              <QuickLink href="/nuevo-pedido" icon={<UploadCloud size={22} />} title="New Job" subtitle="Upload ORI" />
              <QuickLink href="/pedidos" icon={<FolderOpen size={22} />} title="Orders" subtitle="Track status" />
              <QuickLink href="/garage" icon={<Car size={22} />} title="Garage" subtitle="Vehicle history" />
              <QuickLink href="/biblioteca" icon={<Library size={22} />} title="Library" subtitle="Your files" />
            </div>
          </div>

          <div className="space-y-6">
            <AKECUCard visible={analysed} />
            <div className="ak-glass rounded-[2rem] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--ak-glow)]">Live queue</p>
                  <h3 className="mt-2 text-2xl font-black">Latest jobs</h3>
                </div>
                <AKButton href="/pedidos" variant="ghost" className="px-4 py-2">View all</AKButton>
              </div>
              <div className="mt-5 space-y-3">
                {recent.map((item) => (
                  <div key={item.code} className="rounded-2xl border border-white/10 bg-black/24 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black">{item.code}</p>
                        <p className="mt-1 text-sm text-white/38">{item.car}</p>
                      </div>
                      <span className={`text-xs font-black uppercase tracking-wider ${item.tone}`}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><Clock3 className="mb-2 text-[var(--ak-blue)]" size={18} /><strong>17 min</strong><p className="text-xs text-white/35">Average time</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><Headphones className="mb-2 text-[var(--ak-glow)]" size={18} /><strong>Priority</strong><p className="text-xs text-white/35">Support active</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function QuickLink({ href, icon, title, subtitle }: { href: string; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <AKButton href={href} variant="ghost" className="group justify-between rounded-[1.7rem] p-5 text-left">
      <span className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ak-red)]/12 text-[var(--ak-glow)]">{icon}</span><span><strong className="block">{title}</strong><span className="text-xs text-white/35">{subtitle}</span></span></span>
      <ArrowRight size={18} className="text-white/25 transition group-hover:translate-x-1 group-hover:text-[var(--ak-glow)]" />
    </AKButton>
  )
}
