import Link from 'next/link'
import { ArrowRight, Car, CheckCircle2, Clock3, FileArchive, Gauge, Repeat2, Sparkles } from 'lucide-react'
import AKCard from '@/components/ak/AKCard'
import { formatGarageDate, getVehicleDisplayName, type GarageVehicle } from '@/lib/services/garage'

export default function AKGarageVehicleCard({ vehicle }: { vehicle: GarageVehicle }) {
  const name = getVehicleDisplayName(vehicle)
  const open = vehicle.pendientes > 0
  const recurrent = vehicle.trabajos > 1
  const reusable = !open && vehicle.finalizados > 0
  const hasConfirmedTechnicalChanges = vehicle.historial.cambiosHw + vehicle.historial.cambiosSw > 0
  const ecuLabel = vehicle.ecu?.trim() || 'ECU sin confirmar'
  const lastJobLabel = vehicle.ultimoTrabajo?.trim() || 'Sin servicio registrado'
  const lastActivityLabel = vehicle.ultimaFecha ? formatGarageDate(vehicle.ultimaFecha) : 'Sin fecha registrada'

  return (
    <AKCard className="group relative overflow-hidden p-4 transition duration-300 hover:-translate-y-1 hover:border-red-400/45 sm:p-6">
      <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-red-400/12 blur-3xl transition group-hover:bg-red-400/20" />

      <div className="relative flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white/35">
              <Gauge size={13} className="shrink-0" /> <span className="truncate">{ecuLabel}</span>
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
            {hasConfirmedTechnicalChanges && (
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-amber-200">
                <Gauge size={12} /> Cambio técnico confirmado
              </div>
            )}
          </div>
          <h2 className="mt-4 break-words text-xl font-black tracking-tight sm:text-2xl">{name}</h2>
          <p className="mt-2 break-words text-sm text-white/38">Último: {lastJobLabel}</p>
          {hasConfirmedTechnicalChanges && (
            <p className="mt-2 break-words text-xs font-bold text-amber-200/65">
              Cambios registrados · HW {vehicle.historial.cambiosHw} · SW {vehicle.historial.cambiosSw}
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/12 text-red-300 shadow-[0_0_32px_rgba(255,66,90,.22)] sm:h-14 sm:w-14">
          <Car size={24} />
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-1 gap-3 min-[360px]:grid-cols-3">
        <div className="min-w-0 rounded-2xl border border-white/10 bg-black/25 p-3 sm:p-4">
          <FileArchive size={17} className="text-white/35" />
          <div className="mt-2 text-2xl font-black">{vehicle.trabajos}</div>
          <div className="truncate text-xs text-white/30">Trabajos</div>
        </div>
        <div className="min-w-0 rounded-2xl border border-white/10 bg-black/25 p-3 sm:p-4">
          <CheckCircle2 size={17} className="text-emerald-300" />
          <div className="mt-2 text-2xl font-black">{vehicle.finalizados}</div>
          <div className="truncate text-xs text-white/30">Listos</div>
        </div>
        <div className="min-w-0 rounded-2xl border border-white/10 bg-black/25 p-3 sm:p-4">
          <Clock3 size={17} className={open ? 'text-amber-300' : 'text-white/35'} />
          <div className="mt-2 text-2xl font-black">{vehicle.pendientes}</div>
          <div className="truncate text-xs text-white/30">Abiertos</div>
        </div>
      </div>

      {vehicle.servicios.length > 0 && (
        <div className="relative mt-5 flex flex-wrap gap-2">
          {vehicle.servicios.slice(0, 4).map((service) => (
            <span key={service} className="max-w-full break-words rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-white/48">
              {service}
            </span>
          ))}
          {vehicle.servicios.length > 4 && (
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-white/35">
              +{vehicle.servicios.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="relative mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 break-words text-xs text-white/32">Última actividad · {lastActivityLabel}</div>
        <Link href={`/garage/${vehicle.key}`} className="inline-flex shrink-0 items-center gap-2 self-start text-sm font-black text-red-300 sm:self-auto">
          Abrir historial <ArrowRight size={16} />
        </Link>
      </div>
    </AKCard>
  )
}
