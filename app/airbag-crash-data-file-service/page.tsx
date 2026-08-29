import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileUp, ShieldAlert, ShieldCheck } from 'lucide-react'

const title = 'Airbag Crash Data File Service para profesionales'
const description = 'Airbag Crash Data File Service para talleres y especialistas. Reset digital, virgin, VIN reset y reparación de datos según módulo y cobertura dentro de AK Cloud.'
const url = '/airbag-crash-data-file-service'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { type: 'website', title: `${title} | AK Cloud`, description, url, images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Airbag Crash Data File Service · AK Cloud' }] },
  twitter: { card: 'summary_large_image', title: `${title} | AK Cloud`, description, images: ['/og-image.png'] },
}

export default function AirbagFileServicePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'AK Cloud Airbag Crash Data File Service',
    serviceType: 'Professional SRS airbag module data repair file service',
    url: 'https://www.akcloud.es/airbag-crash-data-file-service',
    provider: { '@type': 'Organization', name: 'AK Cloud', url: 'https://www.akcloud.es', parentOrganization: { '@type': 'Organization', name: 'Autokeys Remaps Pro', url: 'https://www.autokeysremapspro.es/' } },
    audience: { '@type': 'BusinessAudience', audienceType: 'Automotive workshops and electronics specialists' },
    areaServed: { '@type': 'Country', name: 'España' },
  }

  return (
    <main className="ak-v5-bg min-h-screen text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="ak-v5-topbar sticky top-0 z-50"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4 lg:px-8"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Solicitar acceso <ArrowRight size={15}/></Link></div></header>
      <section className="mx-auto max-w-[1180px] px-5 py-24 lg:px-8"><div className="ak-v5-pill inline-flex"><ShieldAlert size={14}/> AIRBAG · CRASH DATA</div><h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">Airbag Crash Data File Service.<br/><span className="text-[#ff425a]">Reparación digital para profesionales.</span></h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">AK Cloud permite enviar el archivo de un módulo SRS, identificar la unidad y solicitar la solución disponible sin separar la información entre chats, correos y carpetas. El trabajo queda ligado a un pedido con historial y archivo final.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="ak-v5-button">Crear cuenta profesional <ArrowRight size={18}/></Link><Link href="/file-service-ecu" className="ak-v5-button-secondary">Ver File Service</Link></div><div className="mt-12 grid gap-4 md:grid-cols-3">{[['Sube el dump',FileUp],['Identifica el módulo',ShieldAlert],['Recibe el archivo',ShieldCheck]].map(([text,Icon]: any)=><div key={text} className="ak-v5-card p-6"><Icon size={21} className="text-[#67e8d1]"/><h2 className="mt-4 text-lg font-bold">{text}</h2></div>)}</div></section>
      <section className="border-y border-white/[.06] bg-white/[.018]"><div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8"><div className="ak-v5-kicker">SERVICIOS AIRBAG</div><h2 className="ak-v5-title mt-4 text-4xl">Crash reset y reparación según memoria y módulo.</h2><p className="mt-6 max-w-3xl leading-7 text-white/45">No todos los módulos SRS utilizan la misma memoria ni admiten el mismo tratamiento. La cobertura depende de la referencia, EEPROM o MCU, contenido leído y estado de los datos.</p><div className="mt-8 grid gap-4 md:grid-cols-2">{['Airbag Crash Data Reset','Airbag Crash Advanced','Airbag Virgin','Airbag VIN Reset','Reparación EEPROM / MCU','Reconstrucción de datos'].map(x=><div key={x} className="ak-v5-card flex items-center gap-3 p-5"><CheckCircle2 size={18} className="text-[#67e8d1]"/><span className="font-semibold">{x}</span></div>)}</div></div></section>
      <section className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8"><div className="grid gap-6 lg:grid-cols-2"><div className="ak-v5-card p-7"><h2 className="text-2xl font-bold">Datos correctos desde el principio</h2><p className="mt-4 leading-7 text-white/45">Incluye referencia del módulo, vehículo, memoria leída y cualquier incidencia relevante. Una identificación correcta permite saber antes si el caso entra en cobertura estándar o requiere valoración avanzada.</p></div><div className="ak-v5-card p-7"><h2 className="text-2xl font-bold">Archivo e historial en el mismo pedido</h2><p className="mt-4 leading-7 text-white/45">El taller conserva el archivo enviado, la conversación técnica y el resultado final asociados al mismo trabajo para poder recuperarlo después sin reconstruir el caso desde cero.</p></div></div><div className="mt-10 flex flex-wrap gap-4"><Link href="/immo-file-service" className="font-bold text-[#ff425a]">IMMO File Service →</Link><Link href="/file-service-tcu" className="font-bold text-white/60">TCU File Service →</Link><Link href="/file-service-ecu" className="font-bold text-white/60">ECU File Service →</Link></div></section>
    </main>
  )
}
