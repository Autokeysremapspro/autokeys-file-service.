import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Check, Clock3, CloudUpload, Gauge, Headphones, Infinity, LockKeyhole, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Waves, Zap } from 'lucide-react'

export const metadata = {
  title: 'Precios File Service ECU | Pago por archivo | AK Cloud',
  description: 'Precios claros de File Service ECU para talleres. Sin planes ni cuotas: paga únicamente por cada archivo que necesites.',
}

const services = [
  ['Archivo estándar', '35 €', 'Lectura/modificación ORI, MOD y banco. La solución más demandada.', CloudUpload],
  ['Stage 1', '70 €', 'Mejora de rendimiento segura y fiable. Más par, más respuesta.', Gauge],
  ['Stage 2', '120 €', 'Para los que quieren más. Optimización avanzada.', Sparkles],
  ['DPF Off', '50 €', 'Solución profesional para uso off-road.', SlidersHorizontal],
  ['EGR Off', '50 €', 'Más fiabilidad y mejor rendimiento.', Settings],
  ['AdBlue Off', '60 €', 'Soluciones limpias, efectivas y seguras.', Waves],
  ['Immo Off', '90 €', 'Soluciones immo y clonación.', LockKeyhole],
  ['Hardcut', '60 €', 'Sonido más agresivo para proyectos especiales.', Zap],
  ['Pops & Bangs', '60 €', 'Carácter y emociones. Soluciones a medida.', Waves],
] as const

const faqs = [
  ['¿Cuánto tarda la entrega de un archivo?', 'El tiempo depende de la ECU y del servicio. Verás la estimación antes de enviar el pedido y el estado se actualiza en tiempo real.'],
  ['¿Cómo solicito un trabajo especial?', 'Sube el archivo, selecciona Custom / Consultar y describe exactamente el resultado que necesitas.'],
  ['¿Qué métodos de pago aceptáis?', 'El pago disponible para cada pedido se muestra antes de confirmar, con el importe final visible.'],
  ['¿Los archivos son seguros?', 'Sí. Cada pedido queda vinculado a tu cuenta y únicamente es accesible por ti y por el equipo técnico.'],
  ['¿Dais soporte después de la entrega?', 'Sí. Cada servicio mantiene su conversación técnica para revisiones o dudas relacionadas con el archivo.'],
]

export default function PreciosPage() {
  return (
    <main className="ak10-pricing min-h-screen bg-[#030405] text-white">
      <header className="ak10-public-nav sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5 lg:px-8">
          <Link href="/"><Image src="/images/brand/ak-cloud-logo.webp" alt="AK Cloud" width={2172} height={724} className="h-auto w-[190px]" priority /></Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold lg:flex"><Link href="/">Inicio</Link><Link href="/#como-funciona">Cómo funciona</Link><Link href="/#servicios">Servicios</Link><Link href="/precios" className="border-b-2 border-red-500 pb-3">Precios</Link><Link href="/login">Acceso</Link></nav>
          <Link href="/register" className="ak5-primary !px-5 !py-3 !normal-case !tracking-normal">Solicitar acceso <ArrowRight size={16} /></Link>
        </div>
      </header>

      <section className="ak10-pricing-hero border-b border-white/10">
        <div className="relative z-10 mx-auto max-w-[1500px] px-5 py-16 lg:px-8 lg:py-20">
          <div className="ak10-eyebrow">ECU solutions for a higher performance</div>
          <h1 className="mt-4 max-w-[760px] text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-7xl">Precios claros para<br /><span className="text-[#ff001b]">talleres y profesionales</span></h1>
          <p className="mt-5 text-lg text-white/65">Archivos verificados. Calidad garantizada. Sin sorpresas.</p>
          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-sm">
            <Benefit icon={ShieldCheck} title="Precios transparentes" text="Lo que ves es lo que pagas" />
            <Benefit icon={Infinity} title="Sin permanencia" text="Tú decides cuándo" />
            <Benefit icon={Headphones} title="Soporte técnico incluido" text="De expertos, para expertos" />
            <Benefit icon={Check} title="Revisión manual" text="Cada archivo es verificado" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-9 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div><div className="ak10-eyebrow">Nuestros servicios</div><h2 className="mt-2 text-3xl font-black">Precios por tipo de servicio</h2><p className="mt-2 text-sm text-white/50">Soluciones profesionales para todo tipo de vehículos y necesidades.</p></div>
          <div className="text-center lg:text-right"><div className="text-sm font-bold uppercase tracking-[.25em]">Sin planes. Sin <span className="text-red-500">cuotas.</span></div><div className="mt-1 text-3xl font-black uppercase">Pago por archivo.</div></div>
          <div className="flex gap-3"><Link href="/nuevo-pedido" className="ak5-primary !px-5 !py-3 !normal-case !tracking-normal"><CloudUpload size={18} /> Subir archivo</Link><Link href="/register" className="ak5-secondary !px-5 !py-3 !normal-case !tracking-normal">Solicitar acceso</Link></div>
        </div>

        <div className="mt-7 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {services.map(([name, price, description, Icon]) => <article key={name} className="ak10-panel group min-h-[225px] p-4"><Icon size={34} className="text-red-500 transition group-hover:drop-shadow-[0_0_12px_rgba(255,0,27,.6)]" /><h3 className="mt-5 text-lg font-black">{name}</h3><div className="mt-3 text-xs text-white/50">desde</div><div className="text-3xl font-black text-[#ff001b]">{price}</div><p className="mt-2 text-xs leading-5 text-white/55">{description}</p></article>)}
          <article className="ak10-panel min-h-[225px] p-4"><Settings size={34} /><h3 className="mt-5 text-lg font-black">Custom / Consultar</h3><div className="mt-4 text-xl font-black text-red-500">A consultar</div><p className="mt-2 text-xs leading-5 text-white/55">Trabajos especiales, vehículos poco comunes o solicitudes específicas.</p><Link href="/register" className="mt-4 flex justify-center rounded border border-white/20 px-3 py-2 text-xs font-bold">Solicitar precio</Link></article>
        </div>

        <div className="ak10-panel mt-4 grid gap-4 p-4 md:grid-cols-4">
          <Benefit icon={Zap} title="Precios transparentes" text="Sin costes ocultos" />
          <Benefit icon={Infinity} title="Sin permanencia" text="Pago por archivo, sin cuotas" />
          <Benefit icon={Headphones} title="Soporte incluido" text="Técnicos a tu lado" />
          <Benefit icon={ShieldCheck} title="Revisión manual" text="Calidad y fiabilidad" />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[.75fr_1.2fr_.8fr]">
          <div className="ak10-panel p-6"><div className="ak10-eyebrow">Más que archivos</div><h2 className="mt-3 text-2xl font-black">Un socio para tu taller.</h2><p className="mt-3 text-sm leading-6 text-white/50">Soporte real, calidad verificada y un servicio pensado por y para profesionales.</p><Link href="/register" className="ak5-secondary mt-6 w-full !normal-case !tracking-normal">Solicitar acceso</Link></div>
          <div className="ak10-panel p-6"><h2 className="text-xl font-black">Preguntas frecuentes</h2><div className="mt-3 divide-y divide-white/[.08]">{faqs.map(([q, a]) => <details key={q} className="group py-3"><summary className="cursor-pointer list-none text-sm font-semibold">{q}<span className="float-right text-red-500">+</span></summary><p className="mt-2 text-sm leading-6 text-white/48">{a}</p></details>)}</div></div>
          <div className="ak10-panel p-6"><div className="flex items-center gap-3"><Clock3 className="text-red-500" /><h2 className="text-lg font-black">¿Necesitas un precio personalizado?</h2></div><p className="mt-3 text-sm leading-6 text-white/50">Sube tu archivo o cuéntanos tu caso. Te daremos un presupuesto en pocos minutos.</p><Link href="/nuevo-pedido" className="ak5-primary mt-6 w-full !normal-case !tracking-normal"><CloudUpload size={17} /> Subir archivo</Link><Link href="/soporte" className="ak5-secondary mt-2 w-full !normal-case !tracking-normal">Contactar con soporte</Link></div>
        </div>
      </section>
    </main>
  )
}

function Benefit({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return <div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-red-500 text-red-500"><Icon size={18} /></span><span><strong className="block text-sm">{title}</strong><span className="text-xs text-white/45">{text}</span></span></div>
}
