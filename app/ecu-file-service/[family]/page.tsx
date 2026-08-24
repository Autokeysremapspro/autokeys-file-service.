import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, Cpu, FileUp, ShieldCheck } from 'lucide-react'

const families = {
  edc17: {
    name: 'Bosch EDC17',
    title: 'Bosch EDC17 File Service',
    description: 'File Service profesional para ECUs Bosch EDC17. Gestiona ORI, datos del vehículo, solicitud y MOD desde AK Cloud.',
    context: 'La familia Bosch EDC17 está presente en numerosos vehículos diésel y gasolina y agrupa múltiples variantes de hardware y software. Por eso no basta con indicar “EDC17”: para preparar correctamente una solicitud necesitamos la referencia concreta de la ECU, los datos del vehículo y una lectura válida obtenida con un protocolo compatible.',
  },
  md1: {
    name: 'Bosch MD1',
    title: 'Bosch MD1 File Service',
    description: 'File Service profesional para ECUs Bosch MD1. Solicitudes para talleres y preparadores con herramienta compatible.',
    context: 'Bosch MD1 pertenece a una generación moderna de unidades de control diésel con distintas variantes de hardware, software y métodos de acceso. La identificación exacta y una lectura correcta son esenciales antes de solicitar una calibración o modificación de archivo.',
  },
  mg1: {
    name: 'Bosch MG1',
    title: 'Bosch MG1 File Service',
    description: 'File Service profesional para ECUs Bosch MG1. Centraliza archivo original, pedido, soporte y entrega del MOD.',
    context: 'Bosch MG1 se utiliza en numerosas aplicaciones gasolina modernas y existe en múltiples variantes. El archivo debe asociarse a la referencia, software, motorización y tipo de lectura correctos para evitar tratar como equivalentes unidades que no lo son.',
  },
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
      title: `${item.title} | AK Cloud`,
      description: item.description,
      url,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `${item.name} File Service · AK Cloud` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${item.title} | AK Cloud`,
      description: item.description,
      images: ['/og-image.png'],
    },
  }
}

export default async function FamilyPage({ params }: { params: Promise<{ family: string }> }) {
  const { family } = await params
  const item = families[family as Family]
  if (!item) notFound()
  const url = `https://www.akcloud.es/ecu-file-service/${family}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: item.title,
    serviceType: `${item.name} ECU file service for automotive professionals`,
    description: item.description,
    url,
    provider: {
      '@type': 'Organization',
      name: 'AK Cloud',
      url: 'https://www.akcloud.es',
      parentOrganization: {
        '@type': 'Organization',
        name: 'Autokeys Remaps Pro',
        url: 'https://www.autokeysremapspro.es/',
      },
    },
    audience: { '@type': 'BusinessAudience', audienceType: 'Automotive workshops and professional tuners' },
    areaServed: { '@type': 'Country', name: 'España' },
  }
  return (
    <main className="ak-v5-bg min-h-screen text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="ak-v5-topbar sticky top-0 z-50"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4 lg:px-8"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Crear cuenta <ArrowRight size={15}/></Link></div></header>
      <section className="mx-auto max-w-[1180px] px-5 py-24 lg:px-8">
        <div className="ak-v5-pill inline-flex"><Cpu size={14}/> {item.name.toUpperCase()} · FILE SERVICE</div>
        <h1 className="ak-v5-title mt-7 max-w-4xl text-5xl sm:text-7xl">{item.title}.<br/><span className="text-[#ff425a]">Un workspace para cada pedido.</span></h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">{item.description} El profesional realiza la lectura y escritura con su propia herramienta; AK Cloud organiza el flujo del archivo y la comunicación asociada al trabajo.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="ak-v5-button">Solicitar acceso profesional <ArrowRight size={18}/></Link><Link href="/file-service-ecu" className="ak-v5-button-secondary">ECU File Service</Link></div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">{[['Sube tu ORI',FileUp],['Pedido trazable',ShieldCheck],['Pago por archivo',CheckCircle2]].map(([text,Icon]: any)=><div key={text} className="ak-v5-card p-6"><Icon size={21} className="text-[#67e8d1]"/><h2 className="mt-4 text-lg font-bold">{text}</h2></div>)}</div>
      </section>
      <section className="border-y border-white/[.06] bg-white/[.018]"><div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8"><div className="ak-v5-kicker">Antes de solicitar</div><h2 className="ak-v5-title mt-4 text-4xl">Identifica correctamente hardware, software y tipo de lectura.</h2><p className="mt-6 max-w-3xl leading-7 text-white/45">{item.context}</p><p className="mt-4 max-w-3xl leading-7 text-white/45">La disponibilidad de una solución depende de la referencia concreta, software, vehículo, motorización, protocolo y contenido obtenido. Una familia ECU no implica compatibilidad universal con todos sus modelos o versiones.</p><div className="mt-7 flex flex-wrap gap-4"><Link href={`/guias/file-service/${family}`} className="font-bold text-[#67e8d1]">Leer guía técnica de {item.name} →</Link><Link href="/stage-1-file-service" className="font-bold text-[#ff425a]">Ver Stage 1 File Service →</Link></div></div></section>
      <section className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="ak-v5-card p-7">
            <h2 className="text-2xl font-bold">Flujo profesional ORI → MOD</h2>
            <p className="mt-4 leading-7 text-white/45">El pedido reúne el archivo original, los datos técnicos del vehículo, el servicio solicitado, los mensajes del laboratorio y el archivo final. De este modo el taller conserva la trazabilidad del trabajo en una sola plataforma y puede localizar fácilmente la versión entregada.</p>
            <p className="mt-4 leading-7 text-white/45">Antes de subir el ORI conviene verificar que la lectura corresponde realmente a la ECU identificada, que el archivo no está incompleto y que la herramienta utilizada admite el método de escritura previsto.</p>
          </div>
          <div className="ak-v5-card p-7">
            <h2 className="text-2xl font-bold">Qué debes comprobar en el vehículo</h2>
            <p className="mt-4 leading-7 text-white/45">Una modificación de software no sustituye la diagnosis. El profesional debe revisar averías activas, estado mecánico, alimentación eléctrica y cualquier incidencia que pueda comprometer la lectura, escritura o comportamiento posterior del vehículo.</p>
            <p className="mt-4 leading-7 text-white/45">AK Cloud está orientado a talleres y preparadores que ya trabajan con equipos de programación y necesitan un canal ordenado para solicitar, recibir y documentar sus archivos.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
