import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, Cpu, FileUp, ShieldCheck } from 'lucide-react'

const families = {
  edc17: { name: 'Bosch EDC17', title: 'Bosch EDC17 File Service', description: 'File service profesional para ECUs Bosch EDC17. Gestiona ORI, datos del vehículo, solicitud y MOD desde AK Cloud.' },
  md1: { name: 'Bosch MD1', title: 'Bosch MD1 File Service', description: 'File service profesional para ECUs Bosch MD1. Solicitudes para talleres y preparadores con herramienta compatible.' },
  mg1: { name: 'Bosch MG1', title: 'Bosch MG1 File Service', description: 'File service profesional para ECUs Bosch MG1. Centraliza archivo original, pedido, soporte y entrega del MOD.' },
} as const

type Family = keyof typeof families

export function generateStaticParams() { return Object.keys(families).map(family => ({ family })) }

export async function generateMetadata({ params }: { params: Promise<{ family: string }> }): Promise<Metadata> {
  const { family } = await params
  const item = families[family as Family]
  if (!item) return {}
  const title = `${item.title} para profesionales`
  const url = `/ecu-file-service/${family}`
  return {
    title,
    description: item.description,
    alternates: { canonical: url, languages: { es: url, en: `/en/ecu-file-service/${family}`, 'x-default': url } },
    openGraph: {
      type: 'website',
      title,
      description: item.description,
      url,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `${item.name} File Service · AK Cloud` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: item.description,
      images: ['/og-image.png'],
    },
  }
}

export default async function FamilyPage({ params }: { params: Promise<{ family: string }> }) {
  const { family } = await params
  const item = families[family as Family]
  if (!item) notFound()
  return (
    <main className="ak-v5-bg min-h-screen text-white">
      <header className="ak-v5-topbar sticky top-0 z-50"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4 lg:px-8"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Crear cuenta <ArrowRight size={15}/></Link></div></header>
      <section className="mx-auto max-w-[1180px] px-5 py-24 lg:px-8">
        <div className="ak-v5-pill inline-flex"><Cpu size={14}/> {item.name.toUpperCase()} · FILE SERVICE</div>
        <h1 className="ak-v5-title mt-7 max-w-4xl text-5xl sm:text-7xl">{item.title}.<br/><span className="text-[#ff425a]">Un workspace para cada pedido.</span></h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">{item.description} El profesional realiza la lectura y escritura con su propia herramienta; AK Cloud organiza el flujo del archivo y la comunicación asociada al trabajo.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="ak-v5-button">Solicitar acceso profesional <ArrowRight size={18}/></Link><Link href="/file-service-ecu" className="ak-v5-button-secondary">ECU File Service</Link></div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">{[['Sube tu ORI',FileUp],['Pedido trazable',ShieldCheck],['Pago por archivo',CheckCircle2]].map(([text,Icon]: any)=><div key={text} className="ak-v5-card p-6"><Icon size={21} className="text-[#67e8d1]"/><h2 className="mt-4 text-lg font-bold">{text}</h2></div>)}</div>
      </section>
      <section className="border-y border-white/[.06] bg-white/[.018]"><div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8"><div className="ak-v5-kicker">Antes de solicitar</div><h2 className="ak-v5-title mt-4 text-4xl">Identifica correctamente hardware, software y tipo de lectura.</h2><p className="mt-6 max-w-3xl leading-7 text-white/45">La disponibilidad de una solución depende de la referencia concreta, software, vehículo, motorización, protocolo y contenido obtenido. Una familia ECU no implica compatibilidad universal con todos sus modelos o versiones.</p><Link href="/stage-1-file-service" className="mt-7 inline-flex items-center gap-2 font-bold text-[#ff425a]">Ver Stage 1 File Service <ArrowRight size={16}/></Link></div></section>
    </main>
  )
}
