'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

function PedidoCompletadoInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [estado, setEstado] = useState<'procesando' | 'ok' | 'error'>('procesando')
  const [mensaje, setMensaje] = useState('Confirmando tu pago con tarjeta...')
  const [pedidoId, setPedidoId] = useState<string | null>(null)

  useEffect(() => {
    const pendienteId = searchParams.get('pendiente')
    if (!pendienteId) {
      setEstado('error')
      setMensaje('Falta información del pago.')
      return
    }

    fetch('/api/sumup/confirmar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pendienteId }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setPedidoId(data.pedido?.id || null)
        setEstado('ok')
        setMensaje('Pago confirmado — tu pedido ya está en cola.')
      })
      .catch((err) => {
        setEstado('error')
        setMensaje(err.message || 'No se pudo confirmar el pago.')
      })
  }, [searchParams])

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <div className="w-full max-w-md rounded-[1.8rem] border border-white/10 bg-white/[.03] p-8 text-center">
        {estado === 'procesando' && <Loader2 className="mx-auto animate-spin text-emerald-400" size={40} />}
        {estado === 'ok' && <CheckCircle2 className="mx-auto text-emerald-400" size={40} />}
        {estado === 'error' && <XCircle className="mx-auto text-red-400" size={40} />}
        <h1 className="mt-5 text-2xl font-black">Pago con tarjeta · AK Cloud</h1>
        <p className="mt-3 text-sm text-white/60">{mensaje}</p>

        {estado === 'ok' && (
          <div className="mt-6 flex flex-col gap-3">
            {pedidoId && (
              <button
                onClick={() => router.push(`/pedidos/${pedidoId}`)}
                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black uppercase"
              >
                Ver pedido
              </button>
            )}
            <button
              onClick={() => router.push('/pedidos')}
              className="rounded-xl border border-white/15 bg-white/[.05] px-5 py-3 text-sm font-black uppercase text-white"
            >
              Ir al portal
            </button>
            <p className="text-xs text-white/40">
              Si la sesión ha caducado, AK Cloud te pedirá iniciar sesión antes de mostrar tus pedidos.
            </p>
          </div>
        )}

        {estado === 'error' && (
          <button onClick={() => router.push('/nuevo-pedido')} className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-black uppercase">
            Volver al portal
          </button>
        )}
      </div>
    </main>
  )
}

export default function PedidoCompletadoPage() {
  return <Suspense fallback={null}><PedidoCompletadoInner /></Suspense>
}
