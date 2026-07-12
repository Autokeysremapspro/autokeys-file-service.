'use client'

import { useRouter } from 'next/navigation'
import { XCircle } from 'lucide-react'

export default function PedidoCanceladoPage() {
  const router = useRouter()
  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <div className="w-full max-w-md rounded-[1.8rem] border border-white/10 bg-white/[.03] p-8 text-center">
        <XCircle className="mx-auto text-amber-400" size={40} />
        <h1 className="mt-4 text-xl font-black uppercase">Pago cancelado</h1>
        <p className="mt-3 text-sm text-white/50">No se ha cobrado nada y el pedido no se ha creado. Puedes intentarlo de nuevo cuando quieras.</p>
        <button onClick={() => router.push('/nuevo-pedido')} className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-black uppercase">
          Volver a intentarlo
        </button>
      </div>
    </main>
  )
}
