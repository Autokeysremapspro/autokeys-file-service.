'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Car, Cpu, Download, FileArchive, History, ShieldCheck, Sparkles } from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import AKLibraryFileCard from '@/components/ak/AKLibraryFileCard'
import { getBibliotecaPedido, type BibliotecaArchivo, formatBibliotecaDate } from '@/lib/services/biblioteca'
import type { FileServicePedido } from '@/lib/services/pedidos'

export default function BibliotecaPedidoPage({ params }: { params: { id: string } }) {
  const [pedido, setPedido] = useState<FileServicePedido | null>(null)
  const [archivos, setArchivos] = useState<BibliotecaArchivo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBibliotecaPedido(params.id)
      .then(({ pedido, archivos }) => {
        setPedido(pedido)
        setArchivos(archivos)
      })
      .catch((error) => {
        console.error(error)
        alert(error?.message || 'No se pudo cargar el trabajo')
      })
      .finally(() => setLoading(false))
  }, [params.id])

  const title = useMemo(() => {
    if (!pedido) return 'Trabajo'
    return [pedido.marca, pedido.modelo, pedido.motor].filter(Boolean).join(' ') || pedido.numero || 'Trabajo AK Cloud'
  }, [pedido])

  return (
    <main className="ak-noise ak-grid flex min-h-screen overflow-hidden">
      <AKSidebar />

      <section className="relative z-10 flex-1 p-4 lg:p-8">
        <div className="mb-6">
          <Link href="/biblioteca" className="inline-flex items-center gap-2 text-sm font-black text-white/45 transition hover:text-white">
            <ArrowLeft size={16} /> Volver a biblioteca
          </Link>
        </div>

        {loading ? (
          <AKCard className="p-10 text-center text-white/35">Cargando trabajo...</AKCard>
        ) : !pedido ? (
          <AKCard className="p-10 text-center text-white/35">No se pudo cargar el trabajo.</AKCard>
        ) : (
          <>
            <header className="mb-7 grid gap-6 2xl:grid-cols-[1fr_390px]">
              <AKCard className="relative overflow-hidden p-7 md:p-9">
                <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--ak-red)]/20 blur-3xl" />
                <div className="relative">
                  <p className="text-xs font-black uppercase tracking-[0.34em] text-[var(--ak-glow)]">Trabajo archivado</p>
                  <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">{title}</h1>
                  <p className="mt-3 text-sm text-white/40">{pedido.numero || 'FS'} · {formatBibliotecaDate(pedido.created_at)}</p>

                  <div className="mt-7 grid gap-3 md:grid-cols-3">
                    <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/35"><Cpu size={15} /> ECU</div>
                      <div className="mt-2 text-xl font-black">{pedido.ecu || '—'}</div>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/35"><ShieldCheck size={15} /> HW / SW</div>
                      <div className="mt-2 text-sm font-black">{pedido.hw || 'HW —'} · {pedido.sw || 'SW —'}</div>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/35"><FileArchive size={15} /> Archivos</div>
                      <div className="mt-2 text-xl font-black">{archivos.length}</div>
                    </div>
                  </div>
                </div>
              </AKCard>

              <AKCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Servicios</p>
                    <h2 className="mt-1 text-2xl font-black">Configuración</h2>
                  </div>
                  <Sparkles className="text-[var(--ak-glow)]" />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {(pedido.servicios || []).length > 0 ? (pedido.servicios || []).map((servicio) => (
                    <span key={servicio} className="rounded-full border border-[var(--ak-red)]/25 bg-[var(--ak-red)]/10 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--ak-glow)]">{servicio}</span>
                  )) : <span className="text-sm text-white/35">Sin servicios asociados</span>}
                </div>
                <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/35"><History size={15} /> Estado</div>
                  <div className="mt-2 text-xl font-black capitalize">{String(pedido.estado || 'pendiente').replace('_', ' ')}</div>
                </div>
              </AKCard>
            </header>

            <section className="grid gap-6 2xl:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                {archivos.length === 0 ? (
                  <AKCard className="p-10 text-center text-white/35">Este trabajo aún no tiene archivos disponibles.</AKCard>
                ) : (
                  archivos.map((archivo) => <AKLibraryFileCard key={archivo.id} archivo={archivo} />)
                )}
              </div>

              <aside className="space-y-5">
                <AKCard className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ak-red)]/12 text-[var(--ak-glow)]"><Car size={23} /></div>
                    <div>
                      <div className="font-black">{[pedido.marca, pedido.modelo].filter(Boolean).join(' ') || 'Vehículo pendiente'}</div>
                      <div className="text-sm text-white/35">{pedido.motor || 'Motor —'}</div>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between gap-4 border-b border-white/10 pb-3"><span className="text-white/35">Año</span><span className="font-bold">{pedido.anio || '—'}</span></div>
                    <div className="flex justify-between gap-4 border-b border-white/10 pb-3"><span className="text-white/35">CV</span><span className="font-bold">{pedido.cv || '—'}</span></div>
                    <div className="flex justify-between gap-4 border-b border-white/10 pb-3"><span className="text-white/35">Cambio</span><span className="font-bold">{pedido.cambio || '—'}</span></div>
                    <div className="flex justify-between gap-4"><span className="text-white/35">Precio</span><span className="font-bold">{pedido.precio ? `${pedido.precio} créditos` : '—'}</span></div>
                  </div>
                </AKCard>

                <AKCard className="p-6">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-glow)]">Acciones</p>
                  <div className="mt-5 grid gap-2">
                    <AKButton href={`/pedidos/${pedido.id}`} variant="ghost">Abrir pedido</AKButton>
                    <AKButton href="/nuevo-pedido"><Download size={18} /> Nuevo trabajo</AKButton>
                  </div>
                </AKCard>
              </aside>
            </section>
          </>
        )}
      </section>
    </main>
  )
}
