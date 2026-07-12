'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle2, Loader2, RefreshCw, ShieldCheck, XCircle } from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'
import {
  aprobarRecarga,
  estadoRecargaClass,
  formatEuros,
  getTodasRecargas,
  rechazarRecarga,
  type RecargaCreditos,
} from '@/lib/services/recargas'

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

export default function AdminRecargasPage() {
  const [recargas, setRecargas] = useState<RecargaCreditos[]>([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState<string | null>(null)
  const [filter, setFilter] = useState('pendiente')

  async function load() {
    setLoading(true)
    try {
      setRecargas(await getTodasRecargas())
    } catch (error: any) {
      toast.error(error?.message || 'No se pudieron cargar las recargas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'todas') return recargas
    return recargas.filter((item) => (item.estado || 'pendiente') === filter)
  }, [recargas, filter])

  const pending = recargas.filter((item) => (item.estado || 'pendiente') === 'pendiente')
  const totalPendiente = pending.reduce((acc, item) => acc + Number(item.importe || 0), 0)
  const creditosPendientes = pending.reduce((acc, item) => acc + Number(item.creditos || 0), 0)

  async function approve(item: RecargaCreditos) {
    if (!confirm(`¿Aprobar recarga de ${item.creditos} créditos por ${formatEuros(item.importe)}?`)) return
    const note = prompt('Nota interna opcional para esta aprobación') || ''
    setWorking(item.id)
    try {
      await aprobarRecarga(item, note)
      toast.success('Recarga aprobada y créditos añadidos')
      await load()
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo aprobar la recarga')
    } finally {
      setWorking(null)
    }
  }

  async function reject(item: RecargaCreditos) {
    const reason = prompt('Motivo del rechazo / nota interna') || ''
    setWorking(item.id)
    try {
      await rechazarRecarga(item.id, reason)
      toast.success('Recarga rechazada')
      await load()
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo rechazar la recarga')
    } finally {
      setWorking(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(217,4,41,.22),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(28,141,255,.12),transparent_28%)]" />
      <div className="flex">
        <AKSidebar />

        <section className="min-h-screen flex-1 p-5 lg:p-8">
          <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--ak-red)]/30 bg-[var(--ak-red)]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-[var(--ak-glow)]">
                <ShieldCheck size={15} /> Admin Credits
              </div>
              <h1 className="text-4xl font-black tracking-tight lg:text-6xl">Recargas de créditos</h1>
              <p className="mt-3 max-w-3xl text-white/45">Aprueba recargas manuales, rechaza solicitudes incorrectas y suma créditos automáticamente al distribuidor.</p>
            </div>
            <button onClick={load} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/[0.08] hover:text-white">
              <RefreshCw size={18} /> Actualizar
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Pendientes</div>
              <div className="mt-3 text-4xl font-black text-amber-300">{pending.length}</div>
              <p className="mt-1 text-sm text-white/35">solicitudes esperando revisión</p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Créditos</div>
              <div className="mt-3 text-4xl font-black">{creditosPendientes}</div>
              <p className="mt-1 text-sm text-white/35">créditos pendientes de aprobar</p>
            </div>
            <div className="rounded-[2rem] border border-[var(--ak-red)]/25 bg-[var(--ak-red)]/10 p-5 backdrop-blur-xl">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-glow)]">Importe pendiente</div>
              <div className="mt-3 text-4xl font-black text-emerald-300">{formatEuros(totalPendiente)}</div>
              <p className="mt-1 text-sm text-white/45">por confirmar</p>
            </div>
          </div>

          <div className="mt-8 rounded-[2.2rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">
            <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-2xl font-black">Solicitudes</h2>
                <p className="mt-1 text-sm text-white/40">Revisa método de pago, referencia e importe antes de aprobar.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['pendiente', 'aprobado', 'rechazado', 'todas'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${filter === item ? 'border-[var(--ak-red)]/70 bg-[var(--ak-red)]/15 text-white' : 'border-white/10 bg-black/25 text-white/40 hover:text-white'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-white/45"><Loader2 className="animate-spin" size={18} /> Cargando recargas...</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 p-8 text-center text-white/35">No hay solicitudes en este estado.</div>
            ) : (
              <div className="space-y-3">
                {filtered.map((item) => (
                  <div key={item.id} className="rounded-[1.6rem] border border-white/10 bg-black/25 p-5">
                    <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${estadoRecargaClass(item.estado)}`}>{item.estado || 'pendiente'}</span>
                          <span className="text-xs text-white/35">{formatDate(item.created_at)}</span>
                        </div>
                        <h3 className="text-xl font-black">{item.nombre_cliente || item.email_cliente || 'Distribuidor'}</h3>
                        <p className="mt-1 text-sm text-white/40">{item.email_cliente || 'Sin email'} · {item.metodo_pago || 'sin método'} · Ref: {item.referencia_pago || '—'}</p>
                        {!item.referencia_pago && (item.metodo_pago === 'paypal' || item.metodo_pago === 'transferencia' || item.metodo_pago === 'tarjeta') && (
                          <p className="mt-2 inline-flex rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-200">Pendiente de referencia de pago</p>
                        )}
                        {item.notas_cliente && <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/55">{item.notas_cliente}</p>}
                      </div>

                      <div className="flex flex-col gap-3 xl:w-[330px]">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Créditos</div>
                            <div className="mt-1 text-2xl font-black">{item.creditos}</div>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Importe</div>
                            <div className="mt-1 text-2xl font-black text-emerald-300">{formatEuros(item.importe)}</div>
                          </div>
                        </div>

                        {(item.estado || 'pendiente') === 'pendiente' && (
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => approve(item)} disabled={working === item.id} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black transition hover:bg-emerald-500 disabled:opacity-60">
                              {working === item.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Aprobar
                            </button>
                            <button onClick={() => reject(item)} disabled={working === item.id} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 transition hover:bg-red-500/20 disabled:opacity-60">
                              <XCircle size={16} /> Rechazar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
