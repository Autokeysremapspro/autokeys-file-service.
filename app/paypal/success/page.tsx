'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'

function PayPalSuccessContent() {
  const params = useSearchParams()
  const orderId = params.get('token')
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [message, setMessage] = useState('Confirmando pago con PayPal...')

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
        setStatus('ok')
        setMessage('Pago confirmado. Tus créditos ya se han añadido al saldo.')
      } catch (error: any) {
        setStatus('error')
        setMessage(error?.message || 'No se pudo confirmar el pago')
      }
    }

    capture()
  }, [orderId])

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_25%_0%,rgba(217,4,41,.22),transparent_34%),radial-gradient(circle_at_78%_12%,rgba(28,141,255,.10),transparent_30%)]" />
      <div className="flex">
        <AKSidebar />
        <section className="flex min-h-screen flex-1 items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-[2.4rem] border border-white/10 bg-white/[0.035] p-8 text-center backdrop-blur-xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] border border-white/10 bg-black/35">
              {status === 'loading' && <Loader2 className="animate-spin text-[var(--ak-glow)]" size={38} />}
              {status === 'ok' && <CheckCircle2 className="text-emerald-300" size={42} />}
              {status === 'error' && <XCircle className="text-red-300" size={42} />}
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight">{status === 'ok' ? 'Pago recibido' : status === 'error' ? 'Pago pendiente' : 'Confirmando pago'}</h1>
            <p className="mt-3 text-white/50">{message}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/creditos" className="rounded-2xl bg-[var(--ak-red)] px-6 py-3 text-sm font-black shadow-[0_0_45px_rgba(217,4,41,.28)] transition hover:bg-[var(--ak-glow)]">Ver créditos</Link>
              <Link href="/dashboard" className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-black text-white/70 transition hover:text-white">Volver al Workspace</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default function PayPalSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white" /> }>
      <PayPalSuccessContent />
    </Suspense>
  )
}
