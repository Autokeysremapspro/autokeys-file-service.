'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Clock3, Download, FileArchive, Gauge, Sparkles, UploadCloud } from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import AKTimeline from '@/components/ak/AKTimeline'
import { descargarArchivo, formatBytes, formatEstado, type FileServicePedido } from '@/lib/services/pedidos'
import { formatGarageDate, getGarageVehicle, getVehicleDisplayName, type GarageVehicle } from '@/lib/services/garage'

async function downloadBlob(filename: string, bucket?: string | null, path?: string | null) {
  if (!bucket || !path) return
  const blob = await descargarArchivo(bucket, path)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function GarageVehiclePage({ params }: { params: { key: string } }) {
  const [vehicle, setVehicle] = useState<GarageVehicle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGarageVehicle(decodeURIComponent(params.key))
      .then(setVehicle)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.key])

  const name = vehicle ? getVehicleDisplayName(vehicle) : 'Vehículo'

  const files = useMemo(() => {
    if (!vehicle) return [] as Array<{ tipo: 'ORI' | 'MOD'; pedido: FileServicePedido; nombre: string; bucket?: string | null; path?: string | null; size?: number | null }>
    return vehicle.pedidos.flatMap((pedido) => {
      const result: Array<{ tipo: 'ORI' | 'MOD'; pedido: FileServicePedido; nombre: string; bucket?: string | null; path?: string | null; size?: number | null }> = []
      if (pedido.ori_nombre) result.push({ tipo: 'ORI', pedido, nombre: pedido.ori_nombre, bucket: pedido.ori_bucket, path: pedido.ori_path, size: pedido.ori_size })
      if (pedido.mod_nombre) result.push({ tipo: 'MOD', pedido, nombre: pedido.mod_nombre, bucket: pedido.mod_bucket, path: pedido.mod_path, size: null })
      return result
    })
  }, [vehicle])

  return (
    <main className="ak-noise flex min-h-screen">
      <AKSidebar />
      <section className="flex-1 p-4 lg:p-8">
        <Link href="/garage" className="mb-6 inline-flex items-center gap-2 text-sm font-black text-white/45 hover:text-white">
          <ArrowLeft size={17} /> Volver al garaje
        </Link>

        {loading ? (
          <AKCard className="p-8 text-white/35">Cargando vehículo...</AKCard>
        ) : !vehicle ? (
          <AKCard className="p-10 text-center text-white/45">No se encontró este vehículo.</AKCard>
        ) : (
          <>
            <header className="mb-7 grid gap-5 xl:grid-cols-[1fr_360px]">
              <AKCard className="overflow-hidden p-7 md:p-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--ak-red)]/25 bg-[var(--ak-red)]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-glow)]">
                  <Sparkles size={15} /> Vehicle Record
                </div>
                <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">{name}</h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/42">
                  Historial completo de trabajos, servicios, archivos ORI/MOD y estados del vehículo.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[vehicle.ecu, vehicle.hw, vehicle.sw, vehicle.cv].map((item) => (
                    <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black text-white/50">{item}</span>
                  ))}
                </div>
              </AKCard>

              <AKCard className="p-6">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Resumen</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-black/25 p-4"><FileArchive size={17} className="text-white/35" /><div className="mt-2 text-3xl font-black">{vehicle.trabajos}</div><div className="text-xs text-white/30">Trabajos</div></div>
                  <div className="rounded-2xl bg-black/25 p-4"><CheckCircle2 size={17} className="text-emerald-300" /><div className="mt-2 text-3xl font-black">{vehicle.finalizados}</div><div className="text-xs text-white/30">Finalizados</div></div>
                  <div className="rounded-2xl bg-black/25 p-4"><Clock3 size={17} className="text-amber-300" /><div className="mt-2 text-3xl font-black">{vehicle.pendientes}</div><div className="text-xs text-white/30">Abiertos</div></div>
                  <div className="rounded-2xl bg-black/25 p-4"><Gauge size={17} className="text-[var(--ak-glow)]" /><div className="mt-2 text-3xl font-black">{vehicle.servicios.length}</div><div className="text-xs text-white/30">Servicios</div></div>
                </div>
              </AKCard>
            </header>

            <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
              <section className="space-y-6">
                <AKCard className="p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-glow)]">Historial</p>
                      <h2 className="mt-1 text-2xl font-black">Trabajos realizados</h2>
                    </div>
                    <AKButton href="/nuevo-pedido" variant="ghost"><UploadCloud size={17} /> Nuevo trabajo</AKButton>
                  </div>

                  <div className="space-y-3">
                    {vehicle.pedidos.map((pedido) => (
                      <Link key={pedido.id} href={`/pedidos/${pedido.id}`} className="block rounded-3xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-[var(--ak-red)]/35 hover:bg-white/[0.055]">
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                          <div>
                            <div className="text-lg font-black">{pedido.numero || 'FS'} · {(pedido.servicios || []).join(' + ') || 'Servicio pendiente'}</div>
                            <div className="mt-1 text-sm text-white/35">{formatGarageDate(pedido.created_at)} · {pedido.ori_nombre || 'Sin ORI'}</div>
                          </div>
                          <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-black text-white/55">{formatEstado(pedido.estado)}</span>
                        </div>
                        <div className="mt-4"><AKTimeline estado={pedido.estado} /></div>
                      </Link>
                    ))}
                  </div>
                </AKCard>
              </section>

              <aside className="space-y-6">
                <AKCard className="p-6">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Servicios usados</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {vehicle.servicios.map((service) => (
                      <span key={service} className="rounded-full border border-[var(--ak-red)]/20 bg-[var(--ak-red)]/10 px-3 py-1 text-xs font-black text-[var(--ak-glow)]">{service}</span>
                    ))}
                  </div>
                </AKCard>

                <AKCard className="p-6">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Archivos</p>
                  <div className="mt-4 space-y-3">
                    {files.length === 0 ? (
                      <div className="rounded-2xl bg-white/[0.035] p-4 text-sm text-white/35">No hay archivos asociados.</div>
                    ) : (
                      files.map((file) => (
                        <button key={`${file.tipo}-${file.pedido.id}-${file.nombre}`} onClick={() => downloadBlob(file.nombre, file.bucket, file.path)} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:border-[var(--ak-red)]/35 hover:bg-white/[0.055]">
                          <div>
                            <div className="text-sm font-black">{file.tipo} · {file.nombre}</div>
                            <div className="mt-1 text-xs text-white/35">{file.pedido.numero || 'FS'} · {formatBytes(file.size)}</div>
                          </div>
                          <Download size={17} className="text-white/35" />
                        </button>
                      ))
                    )}
                  </div>
                </AKCard>
              </aside>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
