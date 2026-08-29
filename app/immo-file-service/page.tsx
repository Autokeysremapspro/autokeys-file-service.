import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileUp, KeyRound, ShieldCheck } from 'lucide-react'

const title = 'IMMO File Service profesional para talleres'
const description = 'IMMO File Service para profesionales: soluciones sobre archivos ECU, virgin, clonación y sincronización según unidad. Gestiona el trabajo dentro de AK Cloud.'
const url = '/immo-file-service'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { type: 'website', title: `${title} | AK Cloud`, description, url, images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'IMMO File Service profesional · AK Cloud' }] },
  twitter: { card: 'summary_large_image', title: `${title} | AK Cloud`, description, images: ['/og-image.png'] },
}

export default function ImmoFileServicePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'AK Cloud IMMO File Service',
    serviceType: 'Professional ECU immobilizer data file service for legitimate automotive repair',
    url: 'https://www.akcloud.es/immo-file-service',
    provider: { '@type': 'Organization', name: 'AK Cloud', url: 'https://www.akcloud.es', parentOrganization: { '@type': 'Organization', name: 'Autokeys Remaps Pro', url: 'https://www.autokeysremapspro.es/' } },
    audience: { '@type': 'BusinessAudience', audienceType: 'Automotive workshops and professional repair businesses' },
    areaServed: { '@type': 'Country', name: 'España' },
  }

  return (
    <main className="ak-v5-bg min-h-screen text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="ak-v5-topbar sticky top-0 z-50"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4 lg:px-8"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Solicitar acceso <ArrowRight size={15}/></Link></div></header>
      <section className="mx-auto max-w-[1180px] px-5 py-24 lg:px-8"><div className="ak-v5-pill inline-flex"><KeyRound size={14}/> IMMO · ECU DATA</div><h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">IMMO File Service.<br/><span className="text-[#ff425a]">Soluciones ECU para reparación profesional.</span></h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">Servicio B2B orientado a talleres y especialistas que trabajan sobre vehículos y unidades con procedencia legítima. El pedido reúne archivo, identificación técnica, necesidad de reparación, comunicación y archivo final en un único historial.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="ak-v5-button">Crear cuenta profesional <ArrowRight size={18}/></Link><Link href="/file-service-ecu" className="ak-v5-button-secondary">Ver ECU File Service</Link></div><div className="mt-12 grid gap-4 md:grid-cols-3">{[['Sube los datos',FileUp],['Identificación técnica',KeyRound],['Entrega trazable',ShieldCheck]].map(([text,Icon]: any)=><div key={text} className="ak-v5-card p-6"><Icon size={21} className="text-[#67e8d1]"/><h2 className="mt-4 text-lg font-bold">{text}</h2></div>)}</div></section>
      <section className="border-y border-white/[.06] bg-white/[.018]"><div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8"><div className="ak-v5-kicker">SERVICIOS SEGÚN COBERTURA</div><h2 className="ak-v5-title mt-4 text-4xl">Desde EDC15/EDC16 hasta EDC17, MD1 y MG1.</h2><p className="mt-6 max-w-3xl leading-7 text-white/45">La solución depende de la ECU concreta, software, memoria disponible y finalidad de la reparación. Las unidades modernas o los casos complejos se valoran dentro de Special Lab en lugar de aplicar una tarifa genérica.</p><div className="mt-8 grid gap-4 md:grid-cols-2">{['IMMO OFF según ECU y caso legítimo','ECU Virgin','ECU Clone Data','Transferencia de datos autorizada','Sincronización ECU ↔ BSI/BCM','Reparación y reconstrucción de datos ECU'].map(x=><div key={x} className="ak-v5-card flex items-center gap-3 p-5"><CheckCircle2 size={18} className="text-[#67e8d1]"/><span className="font-semibold">{x}</span></div>)}</div></div></section>
      <section className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8"><div className="grid gap-6 lg:grid-cols-2"><div className="ak-v5-card p-7"><h2 className="text-2xl font-bold">No tratamos todas las unidades igual</h2><p className="mt-4 leading-7 text-white/45">EDC15/16, EDC17 y generaciones MD1/MG1 pueden requerir enfoques y tiempos distintos. AK Cloud permite seleccionar la familia adecuada y conservar la información ligada al pedido.</p></div><div className="ak-v5-card p-7"><h2 className="text-2xl font-bold">Canal profesional y documentado</h2><p className="mt-4 leading-7 text-white/45">El servicio está pensado para reparación, sustitución y recuperación legítima de módulos. La plataforma centraliza la trazabilidad y evita intercambiar datos sensibles sin contexto por canales dispersos.</p></div></div><div className="mt-10 flex flex-wrap gap-4"><Link href="/ecu-file-service/edc17" className="font-bold text-[#ff425a]">EDC17 File Service →</Link><Link href="/ecu-file-service/md1" className="font-bold text-white/60">MD1 File Service →</Link><Link href="/ecu-file-service/mg1" className="font-bold text-white/60">MG1 File Service →</Link></div></section>
    </main>
  )
}
