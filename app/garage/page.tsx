'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Car, FileArchive, Search, Sparkles, UploadCloud } from 'lucide-react'
import AKPageShell from '@/components/ak/AKPageShell'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import AKGarageVehicleCard from '@/components/ak/AKGarageVehicleCard'
import { getGarageVehicles, type GarageVehicle } from '@/lib/services/garage'

export default function GaragePage() {
  const [vehicles, setVehicles] = useState<GarageVehicle[]>([])
  const [query, setQuery] = useState('')
  const [onlyOpen, setOnlyOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const mountedRef = useRef(true)

  const loadGarage = useCallback(async () => {
    setLoading(true)
    setLoadError(false)

    try {
      const data = await getGarageVehicles()
      if (!mountedRef.current) return
      setVehicles(data)
    } catch (error) {
      console.error(error)
      if (!mountedRef.current) return
      setLoadError(true)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    void loadGarage()

    return () => {
      mountedRef.current = false
    }
  }, [loadGarage])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return vehicles.filter((vehicle) => {
      if (onlyOpen && vehicle.pendientes === 0) return false
      if (!q) return true
      return [
        vehicle.marca,
        vehicle.modelo,
        vehicle.motor,
        vehicle.ecu,
        vehicle.hw,
        vehicle.sw,
        vehicle.cv,
        ...vehicle.servicios,
      ].some((value) => (value || '').toLowerCase().includes(q))
    })
  }, [vehicles, query, onlyOpen])

  const stats = useMemo(() => {
    return {
      vehicles: vehicles.length,
      trabajos: vehicles.reduce((total, vehicle) => total + vehicle.trabajos, 0),
      finalizados: vehicles.reduce((total, vehicle) => total + vehicle.finalizados, 0),
      abiertos: vehicles.reduce((total, vehicle) => total + vehicle.pendientes, 0),
      vehiculosAbiertos: vehicles.filter((vehicle) => vehicle.pendientes > 0).length,
    }
  }, [vehicles])

  const hasSearch = query.trim().length > 0
  const hasActiveFilters = hasSearch || onlyOpen

  return (
    <AKPageShell title="Mis vehículos" subtitle="Un garaje técnico vivo con el historial de cada ECU, servicio, archivo y versión." eyebrow="Taller" actions={<div className="grid w-full grid-cols-1 gap-3 sm:flex sm:w-auto sm:flex-wrap"><AKButton href="/nuevo-pedido"><UploadCloud size={18}/> Nuevo trabajo</AKButton><AKButton href="/biblioteca" variant="ghost"><FileArchive size={18}/> Biblioteca</AKButton></div>}>
        <header className="sr-only">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-300">Garaje privado</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Mi Garaje</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/40">
              Cada vehículo con su historial técnico, ORI, MOD, servicios realizados y pedidos asociados.
            </p>
          </div>
        </header>

        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 2xl:grid-cols-4">
          <GarageStat label="Vehículos" value={stats.vehicles} helper="Garage privado" glow="rgba(239,16,24,.14)" valueClass="" />
          <GarageStat label="Trabajos" value={stats.trabajos} helper="Historial acumulado" glow="rgba(34,211,238,.14)" valueClass="" />
          <GarageStat label="Finalizados" value={stats.finalizados} helper="MOD disponibles" glow="rgba(52,211,153,.14)" valueClass="text-emerald-300" />
          <GarageStat label="Abiertos" value={stats.abiertos} helper="Trabajos en cola o proceso" glow="rgba(245,158,11,.14)" valueClass="text-amber-300" />
        </div>

        <AKCard className="ak5-gridline mt-6 overflow-hidden p-4 sm:p-5 md:p-6">
          <div className="grid gap-5 xl:grid-cols-[1fr_330px] xl:items-center">
            <div className="min-w-0">
              <div className="ak5-chip border-red-400/20 bg-red-400/10 text-red-300">
                <Sparkles size={15} /> Inteligencia del vehículo
              </div>
              <h2 className="mt-4 break-words text-3xl font-black tracking-tight">Historial técnico vivo por vehículo</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/42">
                El distribuidor no solo sube archivos: conserva todo su historial de trabajos con Autokeys Lab, listo para repetir servicios o descargar versiones anteriores.
              </p>
            </div>
            <div className="min-w-0 space-y-3 rounded-[1.4rem] border border-white/10 bg-black/25 p-3.5 sm:rounded-[1.7rem] sm:p-4">
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-3.5 py-3 sm:px-4">
                <Search size={18} className="shrink-0 text-white/35" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar marca, ECU, HW, SW, servicio..."
                  aria-label="Buscar en Mis vehículos"
                  className="min-w-0 w-full bg-transparent text-sm outline-none placeholder:text-white/25"
                />
              </div>
              <button
                type="button"
                onClick={() => setOnlyOpen((current) => !current)}
                aria-pressed={onlyOpen}
                className={`w-full break-words rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${onlyOpen ? 'border-amber-400/35 bg-amber-400/10 text-amber-200' : 'border-white/10 bg-white/[0.025] text-white/50 hover:bg-white/[0.05] hover:text-white/75'}`}
              >
                {onlyOpen ? `Mostrando vehículos con trabajos abiertos (${stats.vehiculosAbiertos})` : `Ver solo vehículos con trabajos abiertos (${stats.vehiculosAbiertos})`}
              </button>
              <p className="px-1 text-xs font-semibold text-white/35" role="status" aria-live="polite">
                {loading ? 'Actualizando garaje…' : hasActiveFilters ? `${filtered.length} de ${vehicles.length} vehículos visibles` : `${vehicles.length} vehículos en tu garaje`}
              </p>
            </div>
          </div>
        </AKCard>

        <div className="mt-6 grid gap-4 sm:gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {loading ? (
            <GarageLoadingSkeleton />
          ) : loadError ? (
            <AKCard className="p-6 text-center sm:p-10 md:col-span-2 2xl:col-span-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-400/12 text-amber-300"><AlertTriangle size={30} /></div>
              <h3 className="mt-5 break-words text-2xl font-black">No se pudo cargar tu garaje</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm text-white/40">Tus datos no se han borrado. No podemos consultar el historial en este momento.</p>
              <div className="mt-6"><AKButton onClick={() => void loadGarage()}>Reintentar</AKButton></div>
            </AKCard>
          ) : vehicles.length === 0 ? (
            <AKCard className="p-6 text-center sm:p-10 md:col-span-2 2xl:col-span-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-400/12 text-red-300"><Car size={30} /></div>
              <h3 className="mt-5 break-words text-2xl font-black">Todavía no hay vehículos</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm text-white/40">Cuando crees pedidos con vehículo y ECU identificados, AK Cloud conservará y agrupará su historial técnico sin inferir datos faltantes.</p>
              <div className="mt-6"><AKButton href="/nuevo-pedido">Crear primer trabajo</AKButton></div>
            </AKCard>
          ) : filtered.length === 0 && hasActiveFilters ? (
            <AKCard className="p-6 text-center sm:p-10 md:col-span-2 2xl:col-span-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/[0.05] text-white/45"><Search size={28} /></div>
              <h3 className="mt-5 break-words text-2xl font-black">Sin coincidencias</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm text-white/40">No hay vehículos que coincidan con los filtros activos.</p>
              <div className="mt-6"><AKButton variant="ghost" onClick={() => { setQuery(''); setOnlyOpen(false) }}>Limpiar filtros</AKButton></div>
            </AKCard>
          ) : (
            filtered.map((vehicle) => <AKGarageVehicleCard key={vehicle.key} vehicle={vehicle} />)
          )}
        </div>
    </AKPageShell>
  )
}

function GarageLoadingSkeleton() {
  return (
    <div className="contents" role="status" aria-live="polite" aria-label="Cargando historial de vehículos">
      {[0, 1, 2].map((item) => (
        <AKCard key={item} className="overflow-hidden p-5" aria-hidden="true">
          <div className="animate-pulse">
            <div className="flex items-center justify-between gap-4">
              <div className="h-4 w-24 rounded-full bg-white/[0.08]" />
              <div className="h-8 w-8 rounded-xl bg-white/[0.06]" />
            </div>
            <div className="mt-6 h-7 w-2/3 rounded-full bg-white/[0.09]" />
            <div className="mt-3 h-4 w-1/2 rounded-full bg-white/[0.06]" />
            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="h-16 rounded-2xl bg-white/[0.05]" />
              <div className="h-16 rounded-2xl bg-white/[0.05]" />
            </div>
            <div className="mt-5 h-10 rounded-2xl bg-white/[0.06]" />
          </div>
        </AKCard>
      ))}
      <span className="sr-only">Cargando garaje…</span>
    </div>
  )
}

function GarageStat({ label, value, helper, glow, valueClass }: { label: string; value: number; helper: string; glow: string; valueClass: string }) {
  return (
    <div className="ak5-card relative overflow-hidden rounded-[22px] p-5">
      <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full" style={{ background: `radial-gradient(circle,${glow},transparent 70%)` }} />
      <div className="relative text-xs font-black uppercase tracking-[0.22em] text-white/35">{label}</div>
      <div className={`relative mt-3 text-4xl font-black ${valueClass}`}>{value}</div>
      <div className="relative mt-1 text-sm text-white/35">{helper}</div>
    </div>
  )
}
