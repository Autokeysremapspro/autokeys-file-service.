'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, CreditCard, FileUp, Loader2, ShieldCheck, Wallet, XCircle } from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'
import AKButton from '@/components/ak/AKButton'
import { getSaldoCreditos } from '@/lib/services/creditos'

function PayPalSuccessContent() {
  const params = useSearchParams()
  const orderId = params.get('token')
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [message, setMessage] = useState('Confirmando pago con PayPal...')
  const [creditos, setCreditos] = useState<number | null>(null)
  const [saldo, setSaldo] = useState<number | null>(null)

  useEffect(() => {
    async function capture() {
      if (!orderId) {
        setStatus('error')
        setMessage('No se recibió el identificador del pago.')
        return
      }

      try {
        const response = await fetch('/api/paypal/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload?.error || 'No se pudo confirmar el pago')

        const paymentCredits = Number(payload?.payment?.creditos || 0)
        if (paymentCredits > 0) setCreditos(paymentCredits)

        try {
          const currentSaldo = await getSaldoCreditos()
          setSaldo(Number(currentSaldo || 0))
        } catch {
          setSaldo(null)
        }

        setStatus('ok')
        setMessage('Pago confirmado. Tus créditos ya se han añadido automáticamente al saldo.')
      } catch (error: any) {
        setStatus('error')
        setMessage(error?.message || 'No se pudo confirmar el pago')
      }
    }

    capture()
  }, [orderId])

  const isOk = status === 'ok'
  const isLoading = status === 'loading'
  const isError = status === 'error'

  return (
    <main className="ak-noise ak-grid min-h-screen bg-[#050505] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_25%_0%,rgba(217,4,41,.26),transparent_34%),radial-gradient(circle_at_78%_12%,rgba(28,141,255,.12),transparent_30%)]" />
      <div className="flex">
        <AKSidebar />
        <section className="flex min-h-screen flex-1 items-center justify-center p-6">
          <div className="w-full max-w-5xl overflow-hidden rounded-[3rem] border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/40 backdrop-blur-2xl">
            <div className="grid lg:grid-cols-[1fr_360px]">
              <div className="p-8 md:p-12">
                <div className="flex h-24 w-24 items-center justify-center rounded-[2.2rem] border border-white/10 bg-black/35 shadow-[0_0_80px_rgba(217,4,41,.20)]">
                  {isLoading && <Loader2 className="animate-spin text-[var(--ak-glow)]" size={44} />}
                  {isOk && <CheckCircle2 className="text-emerald-300" size={48} />}
                  {isError && <XCircle className="text-red-300" size={48} />}
                </div>

                <p className="mt-8 text-xs font-black uppercase tracking-[0.34em] text-[var(--ak-glow)]">AK Cloud Payments</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
                  {isOk ? 'Pago completado' : isError ? 'Pago pendiente' : 'Confirmando pago'}
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50">{message}</p>

                {isOk && (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[2rem] border border-emerald-500/25 bg-emerald-500/10 p-5">
                      <div className="flex items-center gap-3 text-emerald-300">
                        <CreditCard size={22} />
                        <span className="text-xs font-black uppercase tracking-[0.22em]">Créditos añadidos</span>
                      </div>
                      <div className="mt-4 text-4xl font-black">+{creditos ?? '—'}</div>
                    </div>

                    <div className="rounded-[2rem] border border-white/10 bg-black/25 p-5">
                      <div className="flex items-center gap-3 text-[var(--ak-glow)]">
                        <Wallet size={22} />
                        <span className="text-xs font-black uppercase tracking-[0.22em]">Saldo actual</span>
                      </div>
                      <div className="mt-4 text-4xl font-black">{saldo ?? '—'}</div>
                    </div>
                  </div>
                )}

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <AKButton href="/nuevo-pedido"><FileUp size={18} /> Crear nuevo trabajo</AKButton>
                  <AKButton href="/creditos" variant="ghost"><Wallet size={18} /> Ver créditos</AKButton>
                  <AKButton href="/dashboard" variant="dark">Volver al Workspace</AKButton>
                </div>
              </div>

              <aside className="border-t border-white/10 bg-black/25 p-8 lg:border-l lg:border-t-0">
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ak-red)]/15 text-[var(--ak-glow)]">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black">Pago seguro</h2>
                      <p className="text-sm text-white/35">Procesado por PayPal Checkout.</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 text-sm text-white/45">
                    <div className="flex justify-between gap-4 rounded-2xl bg-white/[0.035] p-3"><span>Orden</span><strong className="truncate text-white/70">{orderId || '—'}</strong></div>
                    <div className="flex justify-between gap-4 rounded-2xl bg-white/[0.035] p-3"><span>Estado</span><strong className={isOk ? 'text-emerald-300' : isError ? 'text-red-300' : 'text-amber-300'}>{isOk ? 'Confirmado' : isError ? 'Revisar' : 'Procesando'}</strong></div>
                    <div className="flex justify-between gap-4 rounded-2xl bg-white/[0.035] p-3"><span>Método</span><strong className="text-white/70">PayPal</strong></div>
                  </div>
                </div>

                <div className="mt-5 rounded-[2rem] border border-[var(--ak-red)]/20 bg-[var(--ak-red)]/10 p-6">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--ak-glow)]">Siguiente paso</p>
                  <p className="mt-3 text-sm leading-6 text-white/55">
                    Puedes crear un trabajo ahora mismo. El coste se descontará de tu saldo de créditos cuando el pedido quede registrado.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default function PayPalSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white" />}>
      <PayPalSuccessContent />
    </Suspense>
  )
}
