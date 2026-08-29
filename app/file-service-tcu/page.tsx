import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Cog, FileUp, Gauge, ShieldCheck } from 'lucide-react'

const title = 'TCU File Service profesional para talleres'
const description = 'TCU File Service para talleres y preparadores: DSG, DL501, ZF8 y otras cajas según cobertura. Sube el archivo, solicita la calibración y recibe el MOD en AK Cloud.'
const url = '/file-service-tcu'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    type: 'website',
    title: `${title} | AK Cloud`,
    description,
    url,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TCU File Service profesional · AK Cloud' }],
  },
  twitter: { card: 'summary_large_image', title: `${title} | AK Cloud`, description, images: ['/og-image.png'] },
}

export default function TcuFileServicePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'AK Cloud TCU File Service',
    serviceType: 'Professional TCU calibration file service',
    url: 'https://www.akcloud.es/file-service-tcu',
    provider: {
      '@type': 'Organization',
      name: 'AK Cloud',
      url: 'https://www.akcloud.es',
      parentOrganization: { '@type': 'Organization', name: 'Autokeys Remaps Pro', url: 'https://www.autokeysremapspro.es/' },
    },
    audience: { '@type': 'BusinessAudience', audienceType: 'Automotive workshops and professional tuners' },
    areaServed: { '@type': 'Country', name: 'España' },
  }

  return (
    <main className="ak-v5-bg min-h-screen text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="ak-v5-topbar sticky top-0 z-50"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4 lg:px-8"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Solicitar acceso <ArrowRight size={15}/></Link></div></header>

      <section className="mx-auto max-w-[1180px] px-5 py-24 lg:px-8">
        <div className="ak-v5-pill inline-flex"><Cog size={14}/> TCU · FILE SERVICE PROFESIONAL</div>
        <h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">TCU File Service.<br/><span className="text-[#ff425a]">Calibraciones de caja para profesionales.</span></h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">AK Cloud centraliza solicitudes de archivo para unidades de transmisión. El taller aporta la identificación correcta de la TCU, vehículo, software, método de lectura y objetivo del trabajo; el pedido mantiene ORI, comunicación y MOD dentro del mismo historial.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="ak-v5-button">Crear cuenta profesional <ArrowRight size={18}/></Link><Link href="/file-service-ecu" className="ak-v5-button-secondary">Ver ECU File Service</Link></div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">{[['Sube el archivo',FileUp],['Define la calibración',Gauge],['Recibe el MOD',ShieldCheck]].map(([text,Icon]: any)=><div key={text} className="ak-v5-card p-6"><Icon size={21} className="text-[#67e8d1]"/><h2 className="mt-4 text-lg font-bold">{text}</h2></div>)}</div>
      </section>

      <section className="border-y border-white/[.06] bg-white/[.018]"><div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8"><div className="ak-v5-kicker">COBERTURA SEGÚN UNIDAD</div><h2 className="ak-v5-title mt-4 text-4xl">DSG, DL501, ZF8 y otras TCU según hardware y software.</h2><p className="mt-6 max-w-3xl leading-7 text-white/45">La disponibilidad depende de la referencia concreta, software y contenido leído. No tratamos una familia de transmisión como si todas sus variantes fueran equivalentes. Identificar correctamente la unidad evita errores y acelera la valoración.</p><div className="mt-8 grid gap-4 md:grid-cols-2">{['TCU Stage 1 y Stage 2','DSG Tune y DL501 Tune','ZF8 Tune','Torque limiter y presión de embrague','Shift RPM y Launch RPM','Funciones y soluciones TCU según cobertura'].map(x=><div key={x} className="ak-v5-card flex items-center gap-3 p-5"><CheckCircle2 size={18} className="text-[#67e8d1]"/><span className="font-semibold">{x}</span></div>)}</div></div></section>

      <section className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8"><div className="grid gap-6 lg:grid-cols-2"><div className="ak-v5-card p-7"><h2 className="text-2xl font-bold">Pensado para talleres que ya programan</h2><p className="mt-4 leading-7 text-white/45">El profesional realiza la lectura y escritura con su propia herramienta compatible. AK Cloud organiza el trabajo de archivo: identificación, solicitud, soporte, versiones y entrega.</p></div><div className="ak-v5-card p-7"><h2 className="text-2xl font-bold">Un pedido trazable</h2><p className="mt-4 leading-7 text-white/45">Cada solicitud conserva el contexto técnico y el archivo entregado. Si la unidad vuelve más adelante, el historial permite recuperar qué se recibió y qué versión se preparó.</p></div></div><div className="mt-10 flex flex-wrap gap-4"><Link href="/stage-1-file-service" className="font-bold text-[#ff425a]">Stage 1 File Service →</Link><Link href="/ecu-file-service/edc17" className="font-bold text-white/60">Bosch EDC17 →</Link><Link href="/ecu-file-service/md1" className="font-bold text-white/60">Bosch MD1 →</Link><Link href="/ecu-file-service/mg1" className="font-bold text-white/60">Bosch MG1 →</Link></div></section>
    </main>
  )
}
