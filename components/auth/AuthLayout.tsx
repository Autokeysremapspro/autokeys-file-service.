import Image from 'next/image'
import Link from 'next/link'
import { FileCheck2, Headphones, Zap } from 'lucide-react'
import AuthFooter from './AuthFooter'

const benefits = [
  { icon: FileCheck2, title: 'Archivos verificados', text: 'Calidad y fiabilidad garantizada' },
  { icon: Headphones, title: 'Soporte técnico experto', text: 'Técnicos a tu lado' },
  { icon: Zap, title: 'Sin cuotas. Pago por archivo.', text: 'Máxima flexibilidad' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="ak10-auth relative overflow-hidden">
      <div className="ak10-auth-bg"><Image src="/images/marketing/auth-car-black.webp" alt="" fill sizes="100vw" priority /></div>
      <div className="ak10-auth-grid">
        <section className="ak10-auth-promo">
          <Link href="/" className="inline-block"><Image src="/images/brand/ak-cloud-logo.webp" alt="AK Cloud by Autokeys Remaps Pro" width={2172} height={724} className="h-auto w-[330px]" priority /></Link>
          <div className="mt-9 text-[11px] font-black uppercase tracking-[.24em] text-[#ff001b]">ECU solutions for a higher performance</div>
          <h1 className="mt-4 text-[clamp(2.8rem,4.4vw,5.3rem)] font-black leading-[.94] tracking-[-.055em]">Acceso profesional<br />para <span className="text-[#ff001b]">talleres</span></h1>
          <p className="mt-5 max-w-[600px] text-lg leading-7 text-white/65">Archivos ORI, MOD y lecturas en banco/OBD con soporte técnico de expertos.<br />Solo pagas por lo que necesitas.</p>
          <div className="mt-9 space-y-5">{benefits.map(({ icon: Icon, title, text }) => <div key={title} className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-full border-2 border-red-500 text-red-500"><Icon size={21} /></span><span><strong className="block text-sm">{title}</strong><span className="text-xs text-white/45">{text}</span></span></div>)}</div>
          <div className="mt-10 h-[3px] w-10 bg-[#ff001b]" />
          <div className="mt-4 text-[10px] font-bold uppercase leading-5 tracking-[.3em] text-white/45">Más potencia<br />Más posibilidades<br />Tu taller, un paso por delante.</div>
        </section>

        <section className="relative flex min-h-full items-center justify-center py-5">{children}</section>
      </div>
      <div className="relative z-10"><AuthFooter /></div>
    </main>
  )
}
