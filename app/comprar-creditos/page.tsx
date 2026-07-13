'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { ArrowRight, Info } from 'lucide-react'
import Link from 'next/link'

// Esta página ya no se usa — el sistema pasó de créditos a pago real por
// pedido (PayPal en el momento de pedir). Se deja aquí, sin enlace desde
// ningún sitio, solo por si alguien llega por un enlace/marcador antiguo:
// en vez de dejar que "compre" algo que ya no sirve para nada, se explica
// y se manda a crear un pedido de verdad.
export default function ComprarCreditosPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => router.push('/nuevo-pedido'), 6000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <AppShell>
      <div className="mx-auto max-w-xl rounded-[1.8rem] border border-white/10 bg-white/[.03] p-8 text-center">
        <Info className="mx-auto text-red-400" size={40} />
        <h1 className="mt-4 text-2xl font-black uppercase">Ya no hace falta comprar créditos</h1>
        <p className="mt-3 text-sm text-white/55">
          Ahora cada pedido se paga en el momento de pedirlo — gratis si está incluido en tu plan, o con PayPal si no lo está. No necesitas recargar saldo por adelantado.
        </p>
        <Link href="/nuevo-pedido" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-black uppercase text-white">
          Crear un pedido <ArrowRight size={18} />
        </Link>
        <p className="mt-4 text-xs text-white/30">Te llevamos ahí automáticamente en unos segundos...</p>
      </div>
    </AppShell>
  )
}
