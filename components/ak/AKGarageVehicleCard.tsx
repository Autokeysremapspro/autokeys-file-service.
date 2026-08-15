import Link from 'next/link'
import { ArrowRight, Car, CheckCircle2, Clock3, FileArchive, Gauge, Repeat2, Sparkles } from 'lucide-react'
import AKCard from '@/components/ak/AKCard'
import { formatGarageDate, getVehicleDisplayName, type GarageVehicle } from '@/lib/services/garage'

export default function AKGarageVehicleCard({ vehicle }: { vehicle: GarageVehicle }) {
  const name = getVehicleDisplayName(vehicle)
  const open = vehicle.pendientes > 0
  const recurrent = vehicle.trabajos > 1
  const reusable = !open && vehicle.finalizados > 0

  return (
    <AKCard className="group relative overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:border-red-400/45">
      <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-red-400/12 blur-3xl transition group-hover:bg-red-400/20" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white/35">
              <Gauge size={13} /> {vehicle.ecu}
            </div>
            {recurrent && (
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-200">
                <Repeat2 size={12} /> Recurrente
              </div>
            )}
            {reusable && (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-200">
                <Sparkles size={12} /> Historial listo
              </div>
            )}
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight">{name}</h2>
          <p className="mt-2 text-sm text-white/38">Último: {vehicle.ultimoTrabajo}</p>
        </div>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/12 text-red-300 shadow-[0_0_32px_rgba(255,66,90,.22)]">
          <Car size={26} />
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <FileArchive size={17} className="text-white/35" />
          <div className="mt-2 text-2xl font-black">{vehicle.trabajos}</div>
          <div className="text-xs text-white/30">Trabajos</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <CheckCircle2 size={17} className="text-emerald-300" />
          <div className="mt-2 text-2xl font-black">{vehicle.finalizados}</div>
          <div className="text-xs text-white/30">Listos</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <Clock3 size={17} className={open ? 'text-amber-300' : 'text-white/35'} />
          <div className="mt-2 text-2xl font-black">{vehicle.pendientes}</div>
          <div className="text-xs text-white/30">Abiertos</div>
        </div>
      </div>

      <div className="relative mt-5 flex flex-wrap gap-2">
        {vehicle.servicios.slice(0, 4).map((service) => (
          <span key={service} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-white/48">
            {service}
          </span>
        ))}
        {vehicle.servicios.length > 4 && (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-white/35">
            +{vehicle.servicios.length - 4}
          </span>
        )}
      </div>

      <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-4">
        <div className="text-xs text-white/32">Última actividad · {formatGarageDate(vehicle.ultimaFecha)}</div>
        <Link href={`/garage/${vehicle.key}`} className="inline-flex items-center gap-2 text-sm font-black text-red-300">
          Abrir historial <ArrowRight size={16} />
        </Link>
      </div>
    </AKCard>
  )
}
