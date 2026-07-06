import Link from 'next/link'
import { XCircle } from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'

export default function PayPalCancelPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="flex">
        <AKSidebar />
        <section className="flex min-h-screen flex-1 items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-[2.4rem] border border-white/10 bg-white/[0.035] p-8 text-center backdrop-blur-xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] border border-red-500/20 bg-red-500/10">
              <XCircle className="text-red-300" size={42} />
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight">Pago cancelado</h1>
            <p className="mt-3 text-white/50">No se ha realizado ningún cargo. Puedes volver a seleccionar un pack cuando quieras.</p>
            <div className="mt-8 flex justify-center">
              <Link href="/comprar-creditos" className="rounded-2xl bg-[var(--ak-red)] px-6 py-3 text-sm font-black shadow-[0_0_45px_rgba(217,4,41,.28)] transition hover:bg-[var(--ak-glow)]">Volver a comprar créditos</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
