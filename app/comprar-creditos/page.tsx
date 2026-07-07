'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle2, CreditCard, Loader2, ShieldCheck, Sparkles, Wallet } from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'
import { supabase } from '@/lib/supabase'
import {
  estadoRecargaClass,
  formatEuros,
  getMisRecargas,
  solicitarRecarga,
  type RecargaCreditos,
  type RecargaMetodo,
} from '@/lib/services/recargas'
import { FALLBACK_METODOS, FALLBACK_PLANES, getMetodosPagoActivos, getPlanesActivos, type AkCloudMetodoPago, type AkCloudPlan } from '@/lib/services/akCloudConfig'

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

export default function ComprarCreditosPage() {
  const [planes, setPlanes] = useState<AkCloudPlan[]>(FALLBACK_PLANES)
  const [metodos, setMetodos] = useState<AkCloudMetodoPago[]>(FALLBACK_METODOS)
  const [packKey, setPackKey] = useState(FALLBACK_PLANES[1]?.slug || FALLBACK_PLANES[0].slug)
  const [metodo, setMetodo] = useState<RecargaMetodo>('paypal')
  const [referencia, setReferencia] = useState('')
  const [notas, setNotas] = useState('')
  const [recargas, setRecargas] = useState<RecargaCreditos[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const pack = useMemo(() => planes.find((item) => item.slug === packKey) || planes[0] || FALLBACK_PLANES[0], [planes, packKey])
  const paypalActivo = metodos.some((item) => item.codigo === 'paypal' && item.activo !== false)
  const metodosManuales = metodos.filter((item) => item.codigo !== 'paypal')

  async function load() {
    setLoading(true)
    try {
      const [planesData, metodosData, recargasData] = await Promise.all([
        getPlanesActivos(),
        getMetodosPagoActivos(),
        getMisRecargas(),
      ])
      setPlanes(planesData)
      setMetodos(metodosData)
      setRecargas(recargasData)
      if (!planesData.some((item) => item.slug === packKey)) {
        setPackKey((planesData.find((item) => item.destacado) || planesData[0] || FALLBACK_PLANES[0]).slug)
      }
      if (!metodosData.some((item) => item.codigo === metodo)) {
        setMetodo((metodosData.find((item) => item.codigo !== 'paypal') || metodosData[0] || FALLBACK_METODOS[0]).codigo)
      }
    } catch (error: any) {
      toast.error(error?.message || 'No se pudieron cargar las recargas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function pagarConPayPal() {
    setSaving(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) throw new Error('Inicia sesión para comprar créditos')

      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ packKey: pack.slug }),
      })

      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.error || 'No se pudo iniciar PayPal')
      window.location.href = payload.approveUrl
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo iniciar el pago')
      setSaving(false)
    }
  }

  async function solicitarManual() {
    setSaving(true)
    try {
      await solicitarRecarga({
        creditos: Number(pack.creditos_mes || 0),
        importe: Number(pack.precio_mensual || 0),
        metodo_pago: metodo,
        referencia_pago: referencia,
        notas_cliente: notas,
      })
      toast.success('Solicitud de recarga enviada')
      setReferencia('')
      setNotas('')
      await load()
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo solicitar la recarga')
    } finally {
      setSaving(false)
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
                <Wallet size={15} /> AK Cloud Payments
              </div>
              <h1 className="text-4xl font-black tracking-tight lg:text-6xl">Comprar créditos</h1>
              <p className="mt-3 max-w-3xl text-white/45">Los planes y precios se gestionan desde Autokeys Core. Cualquier cambio en Core aparece aquí automáticamente.</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
            <section className="space-y-6">
              <div className="rounded-[2.2rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black">Planes activos</h2>
                    <p className="mt-1 text-sm text-white/40">Estos planes salen directamente de AK Cloud Admin en Autokeys Core.</p>
                  </div>
                  <Sparkles className="text-[var(--ak-glow)]" />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  {planes.map((item) => {
                    const selected = packKey === item.slug
                    return (
                      <button
                        key={item.slug}
                        onClick={() => setPackKey(item.slug)}
                        className={`group text-left rounded-[2rem] border p-5 transition hover:-translate-y-1 ${selected ? 'border-[var(--ak-red)]/70 bg-[var(--ak-red)]/15 shadow-[0_0_55px_rgba(217,4,41,.25)]' : 'border-white/10 bg-black/25 hover:border-white/20 hover:bg-white/[0.04]'}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xs font-black uppercase tracking-[0.22em] text-white/35">{item.destacado ? 'Recomendado' : 'Plan'}</div>
                            <h3 className="mt-2 text-2xl font-black">{item.nombre}</h3>
                          </div>
                          {selected && <CheckCircle2 className="text-[var(--ak-glow)]" />}
                        </div>
                        <div className="mt-6 text-5xl font-black">{item.creditos_mes}</div>
                        <p className="mt-1 text-sm text-white/35">créditos</p>
                        <div className="mt-5 text-2xl font-black text-emerald-300">{formatEuros(Number(item.precio_mensual || 0))}</div>
                        <p className="mt-3 min-h-[44px] text-sm text-white/42">{item.descripcion || 'Plan configurado desde Autokeys Core.'}</p>
                        {!!item.ventajas?.length && (
                          <ul className="mt-4 space-y-2 text-xs text-white/45">
                            {item.ventajas.slice(0, 3).map((ventaja) => <li key={ventaja}>✓ {ventaja}</li>)}
                          </ul>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {paypalActivo && (
                <div className="rounded-[2.2rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black">Pago automático PayPal</h2>
                      <p className="mt-1 text-sm text-white/40">Se abre PayPal, confirmas el pago y AK Cloud añade los créditos automáticamente.</p>
                    </div>
                    <div className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Auto</div>
                  </div>

                  <button
                    onClick={pagarConPayPal}
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#ffc439] px-5 py-4 text-sm font-black text-black shadow-[0_0_55px_rgba(255,196,57,.20)] transition hover:scale-[1.01] disabled:opacity-60"
                  >
                    {saving && metodo === 'paypal' ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
                    Pagar con PayPal · {formatEuros(Number(pack.precio_mensual || 0))}
                  </button>
                </div>
              )}

              {metodosManuales.length > 0 && (
                <div className="rounded-[2.2rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">
                  <div className="mb-5">
                    <h2 className="text-2xl font-black">Métodos manuales</h2>
                    <p className="mt-1 text-sm text-white/40">Bizum, transferencia u otros métodos activados desde Core.</p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {metodosManuales.map((item) => (
                      <button
                        key={item.codigo}
                        onClick={() => setMetodo(item.codigo)}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${metodo === item.codigo ? 'border-[var(--ak-red)]/70 bg-[var(--ak-red)]/15 text-white' : 'border-white/10 bg-black/25 text-white/45 hover:text-white'}`}
                      >
                        <span className="block">{item.nombre}</span>
                        <span className="mt-1 block text-xs font-medium normal-case text-white/35">{item.descripcion}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/45">
                    {metodos.find((item) => item.codigo === metodo)?.instrucciones || 'Añade la referencia del pago para que Autokeys pueda validarlo.'}
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-white/35">Referencia / ID de pago</span>
                      <input value={referencia} onChange={(e) => setReferencia(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-[var(--ak-red)]/60" placeholder="Ej: Bizum, transferencia, recibo..." />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-white/35">Notas</span>
                      <input value={notas} onChange={(e) => setNotas(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-[var(--ak-red)]/60" placeholder="Opcional" />
                    </label>
                  </div>

                  <button
                    onClick={solicitarManual}
                    disabled={saving}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-black text-white/80 transition hover:border-[var(--ak-red)]/40 hover:bg-[var(--ak-red)]/10 disabled:opacity-60"
                  >
                    {saving && metodo !== 'paypal' ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                    Solicitar recarga manual
                  </button>
                </div>
              )}
            </section>

            <aside className="space-y-6">
              <div className="sticky top-6 rounded-[2.2rem] border border-[var(--ak-red)]/25 bg-[var(--ak-red)]/10 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.24em] text-[var(--ak-glow)]">Resumen</div>
                    <h2 className="mt-2 text-3xl font-black">{pack.nombre}</h2>
                  </div>
                  <CreditCard className="text-[var(--ak-glow)]" size={32} />
                </div>

                <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-black/25 p-5">
                  <div className="flex justify-between text-white/45"><span>Créditos</span><strong className="text-white">{pack.creditos_mes}</strong></div>
                  <div className="mt-3 flex justify-between text-white/45"><span>Importe</span><strong className="text-emerald-300">{formatEuros(Number(pack.precio_mensual || 0))}</strong></div>
                  <div className="mt-3 flex justify-between text-white/45"><span>Origen</span><strong className="text-white">Autokeys Core</strong></div>
                </div>

                {paypalActivo && (
                  <button
                    onClick={pagarConPayPal}
                    disabled={saving}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--ak-red)] px-5 py-4 text-sm font-black shadow-[0_0_55px_rgba(217,4,41,.35)] transition hover:scale-[1.02] hover:bg-[var(--ak-glow)] disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                    Pagar ahora
                  </button>
                )}
              </div>

              <div className="rounded-[2.2rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">
                <h2 className="text-xl font-black">Mis recargas</h2>
                <p className="mt-1 text-sm text-white/40">Estado de tus últimas compras y solicitudes.</p>

                {loading ? (
                  <div className="mt-5 flex items-center gap-2 text-white/45"><Loader2 className="animate-spin" size={18} /> Cargando...</div>
                ) : recargas.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-white/35">No hay recargas todavía.</div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {recargas.slice(0, 5).map((recarga) => (
                      <div key={recarga.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${estadoRecargaClass(recarga.estado)}`}>{recarga.estado || 'pendiente'}</span>
                            <div className="mt-2 font-black">{recarga.creditos} créditos</div>
                            <div className="mt-1 text-xs text-white/35">{formatDate(recarga.created_at)}</div>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-black text-emerald-300">{formatEuros(Number(recarga.importe || 0))}</div>
                            <div className="mt-1 text-white/35">{recarga.metodo_pago || '—'}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  )
}
