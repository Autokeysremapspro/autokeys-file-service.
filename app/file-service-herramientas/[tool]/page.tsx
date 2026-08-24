import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, FileUp, Wrench } from 'lucide-react'

const tools = {
  kess3: { name: 'KESS3', maker: 'Alientech', title: 'KESS3 File Service', enUrl: '/en/file-service-tools/kess3' },
  flex: { name: 'FLEX', maker: 'Magicmotorsport', title: 'FLEX File Service', enUrl: '/en/file-service-tools/flex' },
  autotuner: { name: 'AutoTuner', maker: 'AutoTuner', title: 'AutoTuner File Service', enUrl: '/en/ecu-file-service/autotuner' },
} as const

type ToolKey = keyof typeof tools

export function generateStaticParams() { return Object.keys(tools).map(tool => ({ tool })) }

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool } = await params
  const item = tools[tool as ToolKey]
  if (!item) return {}
  const description = `File Service para profesionales que trabajan con ${item.name}. Sube tu ORI y gestiona solicitud, soporte y entrega del MOD desde AK Cloud.`
  return {
    title: `${item.title} para profesionales`,
    description,
    alternates: {
      canonical: `/file-service-herramientas/${tool}`,
      languages: { es: `/file-service-herramientas/${tool}`, en: item.enUrl, 'x-default': `/file-service-herramientas/${tool}` },
    },
    openGraph: {
      title: `${item.title} | AK Cloud`,
      description,
      url: `/file-service-herramientas/${tool}`,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `${item.name} File Service · AK Cloud` }],
    },
  }
}

export default async function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params
  const item = tools[tool as ToolKey]
  if (!item) notFound()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: item.title,
    serviceType: `${item.name} ECU file service for automotive professionals`,
    description: `File Service para talleres y preparadores que obtienen sus archivos originales con ${item.name}.`,
    url: `https://www.akcloud.es/file-service-herramientas/${tool}`,
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
        <div className="ak-v5-pill inline-flex"><Wrench size={14}/> {item.name.toUpperCase()} · PROFESSIONAL FILE SERVICE</div>
        <h1 className="ak-v5-title mt-7 max-w-4xl text-5xl sm:text-7xl">{item.title}.<br/><span className="text-[#ff425a]">Del ORI al MOD en un solo pedido.</span></h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">Si ya trabajas con {item.name}, AK Cloud te permite centralizar el archivo original, identificación del vehículo y ECU, servicio solicitado, comunicación y entrega del archivo modificado. La lectura y escritura se realizan con tu propia herramienta y protocolos compatibles.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="ak-v5-button">Crear cuenta profesional <ArrowRight size={18}/></Link><Link href="/file-service-ecu" className="ak-v5-button-secondary">Ver ECU File Service</Link></div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">{[['Sube el ORI',FileUp],['Selecciona el servicio',CheckCircle2],['Recibe el MOD',ArrowRight]].map(([text,Icon]: any)=><div key={text} className="ak-v5-card p-6"><Icon size={21} className="text-[#67e8d1]"/><h2 className="mt-4 text-lg font-bold">{text}</h2></div>)}</div>
      </section>
      <section className="border-y border-white/[.06] bg-white/[.018]"><div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8"><div className="ak-v5-kicker">Compatibilidad</div><h2 className="ak-v5-title mt-4 text-4xl">La herramienta no determina por sí sola la solución disponible.</h2><p className="mt-6 max-w-3xl leading-7 text-white/45">Antes de solicitar un archivo, identifica correctamente vehículo, motor, ECU, hardware, software y método de lectura. La disponibilidad depende de la referencia concreta y del contenido leído.</p><p className="mt-4 max-w-3xl leading-7 text-white/45">También conviene conservar la identificación original que muestra {item.name}, porque ese contexto permite relacionar el fichero con la unidad concreta y evita depender únicamente del nombre que se haya dado al archivo.</p><div className="mt-7 flex flex-wrap gap-4"><Link href={`/guias/file-service/${tool}`} className="font-bold text-[#67e8d1]">Guía de trabajo con {item.name} →</Link><Link href="/stage-1-file-service" className="font-bold text-[#ff425a]">Stage 1 File Service →</Link><Link href="/ecu-file-service/edc17" className="font-bold text-white/60">Bosch EDC17 →</Link><Link href="/ecu-file-service/md1" className="font-bold text-white/60">Bosch MD1 →</Link><Link href="/ecu-file-service/mg1" className="font-bold text-white/60">Bosch MG1 →</Link></div></div></section>
      <section className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="ak-v5-card p-7">
            <h2 className="text-2xl font-bold">Qué aporta AK Cloud a tu flujo con {item.name}</h2>
            <p className="mt-4 leading-7 text-white/45">{item.name} es la herramienta con la que el profesional obtiene o escribe el archivo cuando el vehículo y protocolo son compatibles. AK Cloud actúa después como plataforma de File Service: conserva el ORI, los datos técnicos, el servicio solicitado, los mensajes y la versión MOD entregada.</p>
            <p className="mt-4 leading-7 text-white/45">Separar claramente herramienta y File Service evita confusiones. AK Cloud no sustituye a {item.name} ni controla la conexión con el vehículo; organiza el trabajo de archivo y su trazabilidad para talleres y preparadores.</p>
          </div>
          <div className="ak-v5-card p-7">
            <h2 className="text-2xl font-bold">Antes de subir una lectura</h2>
            <p className="mt-4 leading-7 text-white/45">Comprueba que la identificación de la ECU coincide con el archivo, conserva siempre el original y utiliza el método de lectura recomendado para esa unidad. Si una ECU admite varios protocolos, el contenido disponible puede variar según el método empleado.</p>
            <p className="mt-4 leading-7 text-white/45">Al crear el pedido incluye vehículo, motor, referencia de ECU y cualquier dato relevante. Cuanta más información técnica correcta acompañe al ORI, más claro será el proceso de revisión y entrega.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
