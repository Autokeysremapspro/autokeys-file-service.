'use client'

import { Car, Clock, FileArchive, Search } from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'
import AKCard from '@/components/ak/AKCard'

const vehicles = [
  { name: 'Audi A4 B8', ecu: 'Bosch EDC17C64', jobs: 12, last: 'Stage 1 + DPF OFF', tone: 'red' },
  { name: 'BMW 320d', ecu: 'Bosch EDC17C50', jobs: 8, last: 'Stage 1', tone: 'blue' },
  { name: 'Golf GTI', ecu: 'Bosch MED17.5', jobs: 5, last: 'Pops & Bangs', tone: 'green' },
]

export default function GaragePage() {
  return (
    <main className="ak-noise flex min-h-screen">
      <AKSidebar />
      <section className="flex-1 p-4 lg:p-8">
        <div className="mb-7">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--ak-glow)]">Private Garage</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Mi Garaje</h1>
          <p className="mt-2 text-sm text-white/40">Historial técnico de vehículos, trabajos, ORI/MOD y servicios realizados.</p>
        </div>

        <AKCard className="mb-6 p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
            <Search size={18} className="text-white/35" />
            <input placeholder="Buscar vehículo, ECU, matrícula, HW, SW..." className="w-full bg-transparent text-sm outline-none placeholder:text-white/25" />
          </div>
        </AKCard>

        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {vehicles.map((vehicle) => (
            <AKCard key={vehicle.name} className="group overflow-hidden p-6 transition hover:-translate-y-1 hover:border-[var(--ak-red)]/40">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white/35">{vehicle.ecu}</div>
                  <h2 className="mt-4 text-2xl font-black">{vehicle.name}</h2>
                  <p className="mt-1 text-sm text-white/38">Último trabajo: {vehicle.last}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ak-red)]/12 text-[var(--ak-glow)]"><Car size={26} /></div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-black/25 p-4"><FileArchive size={17} className="text-white/35" /><div className="mt-2 text-2xl font-black">{vehicle.jobs}</div><div className="text-xs text-white/30">Trabajos</div></div>
                <div className="rounded-2xl bg-black/25 p-4"><Clock size={17} className="text-white/35" /><div className="mt-2 text-2xl font-black">17 min</div><div className="text-xs text-white/30">Tiempo medio</div></div>
              </div>
            </AKCard>
          ))}
        </div>
      </section>
    </main>
  )
}
