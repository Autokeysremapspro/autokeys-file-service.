'use client'

import { Database, Download, FileArchive, Search } from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'
import AKCard from '@/components/ak/AKCard'

const files = [
  { name: 'Audi_A4_EDC17C64_ORI.bin', type: 'ORI', ecu: 'EDC17C64', date: '05/07/2026' },
  { name: 'Audi_A4_EDC17C64_STAGE1_DPF.bin', type: 'MOD', ecu: 'EDC17C64', date: '05/07/2026' },
  { name: 'BMW_320d_EDC17C50_ORI.bin', type: 'ORI', ecu: 'EDC17C50', date: '04/07/2026' },
]

export default function BibliotecaPage() {
  return (
    <main className="ak-noise flex min-h-screen">
      <AKSidebar />
      <section className="flex-1 p-4 lg:p-8">
        <div className="mb-7">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--ak-glow)]">Private Library</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Biblioteca</h1>
          <p className="mt-2 text-sm text-white/40">Tu nube privada de ORI, MOD, PDFs y trabajos anteriores.</p>
        </div>

        <AKCard className="mb-6 p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
            <Search size={18} className="text-white/35" />
            <input placeholder="Buscar ORI, MOD, ECU, HW, SW, vehículo..." className="w-full bg-transparent text-sm outline-none placeholder:text-white/25" />
          </div>
        </AKCard>

        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <AKCard className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-glow)]">Archivos recientes</p>
                <h2 className="mt-1 text-2xl font-black">Technical files</h2>
              </div>
              <Database className="text-white/25" />
            </div>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.name} className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ak-red)]/12 text-[var(--ak-glow)]"><FileArchive size={20} /></div>
                    <div>
                      <div className="font-black">{file.name}</div>
                      <div className="mt-1 text-xs text-white/35">{file.ecu} · {file.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-black text-white/45">{file.type}</span>
                    <Download size={18} className="text-white/30" />
                  </div>
                </div>
              ))}
            </div>
          </AKCard>

          <AKCard className="p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Smart filters</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Audi', 'BMW', 'Bosch', 'EDC17', 'MED17', 'Stage 1', 'DPF OFF', 'ORI', 'MOD'].map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-white/45">{tag}</span>)}
            </div>
          </AKCard>
        </div>
      </section>
    </main>
  )
}
