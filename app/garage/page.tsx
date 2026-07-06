'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Car, FileArchive, Gauge, Search, Sparkles, UploadCloud } from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import AKGarageVehicleCard from '@/components/ak/AKGarageVehicleCard'
import { getGarageVehicles, type GarageVehicle } from '@/lib/services/garage'

export default function GaragePage() {
  const [vehicles, setVehicles] = useState<GarageVehicle[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGarageVehicles()
      .then(setVehicles)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return vehicles
    return vehicles.filter((vehicle) =>
      [
        vehicle.marca,
        vehicle.modelo,
        vehicle.motor,
        vehicle.ecu,
        vehicle.hw,
        vehicle.sw,
        vehicle.cv,
        ...vehicle.servicios,
      ].some((value) => (value || '').toLowerCase().includes(q))
    )
  }, [vehicles, query])

  const stats = useMemo(() => {
    return {
      vehicles: vehicles.length,
      trabajos: vehicles.reduce((total, vehicle) => total + vehicle.trabajos, 0),
      finalizados: vehicles.reduce((total, vehicle) => total + vehicle.finalizados, 0),
      abiertos: vehicles.reduce((total, vehicle) => total + vehicle.pendientes, 0),
    }
  }, [vehicles])

  return (
    <main className="ak-noise flex min-h-screen">
      <AKSidebar />
      <section className="flex-1 p-4 lg:p-8">
        <header className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--ak-glow)]">Private Garage</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Mi Garaje</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/40">
              Cada vehículo con su historial técnico, ORI, MOD, servicios realizados y pedidos asociados.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <AKButton href="/nuevo-pedido"><UploadCloud size={18} /> Nuevo trabajo</AKButton>
            <AKButton href="/biblioteca" variant="ghost"><FileArchive size={18} /> Biblioteca</AKButton>
          </div>
        </header>

        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
          <AKCard className="p-5"><div className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Vehículos</div><div className="mt-3 text-4xl font-black">{stats.vehicles}</div><div className="mt-1 text-sm text-white/35">Garage privado</div></AKCard>
          <AKCard className="p-5"><div className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Trabajos</div><div className="mt-3 text-4xl font-black">{stats.trabajos}</div><div className="mt-1 text-sm text-white/35">Historial acumulado</div></AKCard>
          <AKCard className="p-5"><div className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Finalizados</div><div className="mt-3 text-4xl font-black text-emerald-300">{stats.finalizados}</div><div className="mt-1 text-sm text-white/35">MOD disponibles</div></AKCard>
          <AKCard className="p-5"><div className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Abiertos</div><div className="mt-3 text-4xl font-black text-amber-300">{stats.abiertos}</div><div className="mt-1 text-sm text-white/35">En cola o proceso</div></AKCard>
        </div>

        <AKCard className="mt-6 overflow-hidden p-5 md:p-6">
          <div className="grid gap-5 xl:grid-cols-[1fr_330px] xl:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--ak-red)]/25 bg-[var(--ak-red)]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-glow)]">
                <Sparkles size={15} /> Vehicle Intelligence
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight">Historial técnico vivo por vehículo</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/42">
                El distribuidor no solo sube archivos: conserva todo su historial de trabajos con Autokeys Lab, listo para repetir servicios o descargar versiones anteriores.
              </p>
            </div>
            <div className="rounded-[1.7rem] border border-white/10 bg-black/25 p-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
                <Search size={18} className="text-white/35" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar marca, ECU, HW, SW, servicio..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-white/25"
                />
              </div>
            </div>
          </div>
        </AKCard>

        <div className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {loading ? (
            <AKCard className="p-8 text-white/35">Cargando garaje...</AKCard>
          ) : filtered.length === 0 ? (
            <AKCard className="p-10 text-center md:col-span-2 2xl:col-span-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--ak-red)]/12 text-[var(--ak-glow)]"><Car size={30} /></div>
              <h3 className="mt-5 text-2xl font-black">Todavía no hay vehículos</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm text-white/40">Cuando crees pedidos, AK Cloud agrupará automáticamente tus trabajos por vehículo y ECU.</p>
              <div className="mt-6"><AKButton href="/nuevo-pedido">Crear primer trabajo</AKButton></div>
            </AKCard>
          ) : (
            filtered.map((vehicle) => <AKGarageVehicleCard key={vehicle.key} vehicle={vehicle} />)
          )}
        </div>
      </section>
    </main>
  )
}
