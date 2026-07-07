'use client'

import { useEffect, useMemo, useState } from 'react'
import { CreditCard, Download, Loader2, Plus, ReceiptText, ShieldCheck, Sparkles, Wallet } from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'
import { getCreditoMovimientos, type CreditoMovimiento } from '@/lib/services/creditos'
import { FALLBACK_SERVICIOS, getServiciosActivos, type AkCloudServicio } from '@/lib/services/akCloudConfig'

function formatDate(date?: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function tipoClass(tipo: string) {
  if (tipo === 'recarga') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
  if (tipo === 'consumo') return 'border-red-500/30 bg-red-500/10 text-red-300'
  if (tipo === 'devolucion') return 'border-blue-500/30 bg-blue-500/10 text-blue-300'
  return 'border-white/10 bg-white/[0.04] text-white/60'
}

export default function CreditosPage() {
  const [movimientos, setMovimientos] = useState<CreditoMovimiento[]>([])
  const [servicios, setServicios] = useState<AkCloudServicio[]>(FALLBACK_SERVICIOS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [movs, serviciosData] = await Promise.all([getCreditoMovimientos(), getServiciosActivos()])
      setMovimientos(movs)
      setServicios(serviciosData)
    } catch (err: any) {
      setError(err?.message || 'No se pudieron cargar los créditos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const saldo = useMemo(() => {
    const latest = movimientos.find((m) => typeof m.saldo_resultante === 'number')
    if (latest) return Number(latest.saldo_resultante || 0)
    return movimientos.reduce((acc, mov) => acc + Number(mov.creditos || 0), 0)
  }, [movimientos])

  const consumidos = useMemo(
    () => movimientos.filter((m) => m.tipo === 'consumo').reduce((acc, mov) => acc + Math.abs(Number(mov.creditos || 0)), 0),
    [movimientos]
  )

  const recargados = useMemo(
    () => movimientos.filter((m) => m.tipo === 'recarga').reduce((acc, mov) => acc + Number(mov.creditos || 0), 0),
    [movimientos]
  )

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(217,4,41,.22),transparent_32%),radial-gradient(circle_at_85%_18%,rgba(255,31,68,.12),transparent_30%)]" />
      <div className="flex">
        <AKSidebar />

        <section className="min-h-screen flex-1 p-5 lg:p-8">
          <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--ak-red)]/30 bg-[var(--ak-red)]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-[var(--ak-glow)]">
                <Wallet size={15} /> AK Credits
              </div>
              <h1 className="text-4xl font-black tracking-tight lg:text-6xl">Créditos y precios</h1>
              <p className="mt-3 max-w-3xl text-white/45">Controla tu saldo, historial de movimientos y coste por servicio dentro de AK Cloud.</p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--ak-red)]/40 bg-[var(--ak-red)] px-5 py-3 text-sm font-black shadow-[0_0_45px_rgba(217,4,41,.35)] transition hover:scale-[1.02] hover:bg-[var(--ak-glow)]">
              <Plus size={18} /> Solicitar recarga
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between text-white/40"><span className="text-xs font-black uppercase tracking-[0.22em]">Saldo</span><Wallet /></div>
              <div className="mt-4 text-4xl font-black text-emerald-300">{saldo}</div>
              <p className="mt-1 text-sm text-white/35">créditos disponibles</p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between text-white/40"><span className="text-xs font-black uppercase tracking-[0.22em]">Recargados</span><CreditCard /></div>
              <div className="mt-4 text-4xl font-black">{recargados}</div>
              <p className="mt-1 text-sm text-white/35">créditos añadidos</p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between text-white/40"><span className="text-xs font-black uppercase tracking-[0.22em]">Consumidos</span><ReceiptText /></div>
              <div className="mt-4 text-4xl font-black text-red-300">{consumidos}</div>
              <p className="mt-1 text-sm text-white/35">en pedidos</p>
            </div>
            <div className="rounded-[2rem] border border-[var(--ak-red)]/25 bg-[var(--ak-red)]/10 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between text-[var(--ak-glow)]"><span className="text-xs font-black uppercase tracking-[0.22em]">Plan</span><ShieldCheck /></div>
              <div className="mt-4 text-2xl font-black">Professional</div>
              <p className="mt-1 text-sm text-white/45">prioridad y soporte técnico</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_420px]">
            <section className="rounded-[2.2rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">Tarifa de servicios</h2>
                  <p className="mt-1 text-sm text-white/40">Precios base en créditos. Se gestionan desde Autokeys Core y se actualizan automáticamente.</p>
                </div>
                <Sparkles className="text-[var(--ak-glow)]" />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {servicios.map((servicio) => (
                  <div key={servicio.slug} className="group rounded-[1.5rem] border border-white/10 bg-black/25 p-4 transition hover:-translate-y-0.5 hover:border-[var(--ak-red)]/45 hover:bg-[var(--ak-red)]/10">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">{servicio.categoria}</div>
                        <h3 className="mt-2 text-lg font-black">{servicio.nombre}</h3>
                        <p className="mt-1 text-sm text-white/40">{servicio.descripcion}</p>
                      </div>
                      <div className="rounded-2xl border border-[var(--ak-red)]/30 bg-[var(--ak-red)]/15 px-3 py-2 text-lg font-black text-[var(--ak-glow)]">{servicio.creditos}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2.2rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">Movimientos</h2>
                  <p className="mt-1 text-sm text-white/40">Historial de recargas y consumos.</p>
                </div>
                <button onClick={load} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white/60 hover:text-white">Actualizar</button>
              </div>

              {error && <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}
              {loading ? (
                <div className="flex items-center gap-2 text-white/45"><Loader2 className="animate-spin" size={18} /> Cargando movimientos...</div>
              ) : movimientos.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-white/10 p-8 text-center text-white/35">Todavía no hay movimientos.</div>
              ) : (
                <div className="space-y-3">
                  {movimientos.map((mov) => (
                    <div key={mov.id} className="rounded-[1.4rem] border border-white/10 bg-black/25 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${tipoClass(mov.tipo)}`}>{mov.tipo}</span>
                          <div className="mt-2 font-black">{mov.concepto || 'Movimiento de créditos'}</div>
                          <div className="mt-1 text-xs text-white/35">{formatDate(mov.created_at)}</div>
                        </div>
                        <div className={`text-2xl font-black ${Number(mov.creditos) >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{Number(mov.creditos) > 0 ? '+' : ''}{mov.creditos}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}
