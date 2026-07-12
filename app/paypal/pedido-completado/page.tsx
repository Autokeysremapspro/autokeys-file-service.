'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

export default function PedidoCompletadoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [estado, setEstado] = useState<'procesando' | 'ok' | 'error'>('procesando')
  const [mensaje, setMensaje] = useState('Confirmando tu pago con PayPal...')

  useEffect(() => {
    const pendienteId = searchParams.get('pendiente')
    if (!pendienteId) {
      setEstado('error')
      setMensaje('Falta información del pago.')
      return
    }

    fetch('/api/pedidos/capturar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pendienteId }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setEstado('ok')
        setMensaje('Pago confirmado — tu pedido ya está en cola.')
        setTimeout(() => router.push(`/pedidos/${data.pedido.id}`), 1800)
      })
      .catch((err) => {
        setEstado('error')
        setMensaje(err.message || 'No se pudo confirmar el pago.')
      })
  }, [searchParams, router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <div className="w-full max-w-md rounded-[1.8rem] border border-white/10 bg-white/[.03] p-8 text-center">
        {estado === 'procesando' && <Loader2 className="mx-auto animate-spin text-red-400" size={40} />}
        {estado === 'ok' && <CheckCircle2 className="mx-auto text-emerald-400" size={40} />}
        {estado === 'error' && <XCircle className="mx-auto text-red-400" size={40} />}
        <p className="mt-5 text-sm text-white/60">{mensaje}</p>
        {estado === 'error' && (
          <button onClick={() => router.push('/nuevo-pedido')} className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-black uppercase">
            Volver a intentarlo
          </button>
        )}
      </div>
    </main>
  )
}
