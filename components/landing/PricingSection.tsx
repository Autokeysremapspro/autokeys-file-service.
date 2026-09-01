import Link from 'next/link'
import { ArrowRight, BadgeCheck, Gauge, ShieldCheck, UserPlus } from 'lucide-react'

const rates = [
  { service: 'Stage 1', price: '44,90 €', note: 'Calibración profesional' },
  { service: 'Stage 2', price: '64,90 €', note: 'Configuración avanzada' },
  { service: 'DPF', price: '34,90 €', note: 'Solución por archivo' },
  { service: 'EGR', price: '29,90 €', note: 'Solución por archivo' },
  { service: 'AdBlue / SCR', price: '39,90 €', note: 'Solución por archivo' },
  { service: 'Pops & Bangs', price: '39,90 €', note: 'Configuración performance' },
  { service: 'Airbag Crash Data', price: '34,90 €', note: 'Reset digital estándar' },
  { service: 'IMMO OFF', price: '44,90 €', note: 'EDC15 / EDC16' },
  { service: 'TCU / DSG', price: '59,90 €', note: 'Desde' },
  { service: 'MD1 / MG1', price: '79,90 €', note: 'Desde' },
]

export default function PricingSection() {
  return (
    <section id="precios" className="relative z-10 mx-auto max-w-[1480px] px-5 py-16 lg:px-8">
      <div className="mb-9 text-center">
        <div className="ak-v5-kicker !text-[#ff2b2b]">Tarifas profesionales</div>
        <h2 className="ak-v5-title mt-4 text-4xl sm:text-5xl">Precios claros. <span className="text-[#ff2b2b]">Soporte real.</span></h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/42">Tarifas estándar por archivo para nuevos clientes. Accede a AK Cloud para consultar el catálogo completo.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="ak-v5-card overflow-hidden">
          <div className="grid border-b border-white/[.07] bg-white/[.02] px-5 py-4 text-[10px] font-black uppercase tracking-[.16em] text-white/30 sm:grid-cols-[1.3fr_.7fr_.8fr]">
            <span>Servicio</span><span className="hidden sm:block">Tarifa</span><span className="hidden sm:block">Modalidad</span>
          </div>
          <div className="grid sm:grid-cols-2">
            {rates.map((rate, i) => (
              <div key={rate.service} className={`flex items-center justify-between gap-4 border-white/[.06] px-5 py-4 ${i % 2 === 0 ? 'sm:border-r' : ''} ${i < rates.length - 2 ? 'border-b' : ''}`}>
                <div>
                  <div className="font-bold text-white/85">{rate.service}</div>
                  <div className="mt-1 text-[11px] text-white/30">{rate.note}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/25">desde</div>
                  <div className="text-xl font-black text-[#ff2b2b]">{rate.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="ak-v5-card relative overflow-hidden p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,43,43,.18),transparent_52%)]" />
          <div className="relative">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#ff2b2b]/20 bg-[#ff2b2b]/10 text-[#ff2b2b]"><Gauge size={21} /></div>
            <h3 className="mt-6 text-2xl font-black">Tarifas estándar públicas</h3>
            <p className="mt-3 text-sm leading-6 text-white/42">Los importes de esta sección son las tarifas estándar visibles para nuevos clientes.</p>
            <div className="mt-6 space-y-3 text-sm font-semibold text-white/65">
              <div className="flex gap-3"><BadgeCheck size={17} className="mt-0.5 shrink-0 text-[#ff2b2b]" />Precios claros por servicio</div>
              <div className="flex gap-3"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-[#ff2b2b]" />Soporte técnico incluido</div>
              <div className="flex gap-3"><Gauge size={17} className="mt-0.5 shrink-0 text-[#ff2b2b]" />Servicios avanzados bajo valoración</div>
            </div>
            <Link href="/register" className="ak-v5-button mt-7 w-full justify-center !bg-gradient-to-b !from-[#ff2b2b] !to-[#b30012]"><UserPlus size={17} /> Solicitar cuenta</Link>
            <Link href="/login" className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-white/40 transition hover:text-white">Ya soy cliente <ArrowRight size={14} /></Link>
          </div>
        </aside>
      </div>

      <p className="mx-auto mt-5 max-w-4xl text-center text-[11px] leading-5 text-white/28">Tarifas estándar orientativas por archivo. El precio final puede variar según ECU, software, complejidad y solución requerida. Los servicios avanzados y Special Lab se valoran individualmente. Las tarifas privadas nunca se muestran en esta página.</p>
    </section>
  )
}
