import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LegalLayout({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#050505] px-5 py-14 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-white/50 hover:text-white">
          <ArrowLeft size={16} /> Volver a AK Cloud
        </Link>
        <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-white/30">Última actualización: {updated}</p>
        <div className="mt-10 space-y-8 text-sm leading-7 text-white/70 [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-black [&_h2]:uppercase [&_h2]:text-white [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-white/90 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1 [&_a]:text-red-400 [&_a]:underline [&_strong]:text-white [&_strong]:font-bold">
          {children}
        </div>
        <p className="mt-16 text-xs text-white/25">
          Este documento es una plantilla de partida generada como ayuda técnica y no constituye asesoramiento legal. Antes de publicarlo, revísalo con un gestor o abogado para adaptarlo a tu situación fiscal, mercantil y de protección de datos concreta.
        </p>
      </div>
    </main>
  )
}
