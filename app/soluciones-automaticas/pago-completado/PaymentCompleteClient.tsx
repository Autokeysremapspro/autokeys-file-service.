'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Download, Loader2, XCircle } from 'lucide-react'
import AKPageShell from '@/components/ak/AKPageShell'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'

export default function PaymentCompleteClient({ orderId }: { orderId: string }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('Confirmando el pago de forma segura...')
  const [solution, setSolution] = useState<any>(null)

  useEffect(() => {
    if (!orderId) { setState('error'); setMessage('Falta el identificador de la compra.'); return }
    ;(async () => {
      try {
        const response = await fetch('/api/automatic-solutions/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error)
        setSolution(payload.order.solution)
        setState('ready')
        setMessage('Pago confirmado. Tu archivo está listo.')
      } catch (error) {
        setState('error')
        setMessage(error instanceof Error ? error.message : 'No se pudo confirmar el pago')
      }
    })()
  }, [orderId])

  async function download() {
    const response = await fetch(`/api/automatic-solutions/${orderId}/download`, { method: 'POST' })
    const payload = await response.json()
    if (!response.ok) { setState('error'); setMessage(payload.error); return }
    window.location.href = payload.url
  }

  return <AKPageShell title="Solución automática" subtitle="Confirmación y entrega privada de tu archivo." eyebrow="Compra individual"><div className="mx-auto max-w-2xl"><AKCard className="p-8 text-center">{state === 'loading' ? <Loader2 size={44} className="mx-auto animate-spin text-red-300"/> : state === 'ready' ? <CheckCircle2 size={48} className="mx-auto text-emerald-300"/> : <XCircle size={48} className="mx-auto text-red-300"/>}<h2 className="mt-5 text-2xl font-black">{message}</h2>{solution && <p className="mt-2 text-sm text-white/45">{solution.service_name} · {solution.ecu} · {solution.mod_name}</p>}{state === 'ready' && <AKButton className="mx-auto mt-6" onClick={download}><Download size={18}/> Descargar archivo MOD</AKButton>}{state === 'error' && <a href="/soluciones-automaticas" className="mt-6 inline-flex rounded-xl border border-white/10 px-4 py-3 text-sm font-bold">Volver a soluciones automáticas</a>}</AKCard></div></AKPageShell>
}

