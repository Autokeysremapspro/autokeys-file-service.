import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Cpu, FileUp } from 'lucide-react'

const title = 'Bosch EDC17 File Service for Professionals'
const description = 'Professional Bosch EDC17 File Service for workshops and tuners. Upload the ORI, identify the ECU correctly and manage MOD delivery through AK Cloud.'
const url = '/en/ecu-file-service/edc17'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url, languages: { en: url, es: '/ecu-file-service/edc17', 'x-default': '/ecu-file-service/edc17' } },
  openGraph: { type: 'website', title: `${title} | AK Cloud`, description, url, images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Bosch EDC17 File Service · AK Cloud' }] },
  twitter: { card: 'summary_large_image', title: `${title} | AK Cloud`, description, images: ['/og-image.png'] },
}

export default function Page() {
  const jsonLd = {
    '@context':'https://schema.org','@type':'Service',name:'Bosch EDC17 File Service',serviceType:'Bosch EDC17 ECU file service for automotive professionals',url:'https://www.akcloud.es/en/ecu-file-service/edc17',
    provider:{'@type':'Organization',name:'AK Cloud',url:'https://www.akcloud.es',parentOrganization:{'@type':'Organization',name:'Autokeys Remaps Pro',url:'https://www.autokeysremapspro.es/'}},
    audience:{'@type':'BusinessAudience',audienceType:'Automotive workshops and professional tuners'},
  }
  return <main className="ak-v5-bg min-h-screen text-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <header className="ak-v5-topbar"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Create account <ArrowRight size={15}/></Link></div></header>
    <section className="mx-auto max-w-[1180px] px-5 py-24"><div className="ak-v5-pill inline-flex"><Cpu size={14}/> BOSCH EDC17 · FILE SERVICE</div><h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">Bosch EDC17 file service.<br/><span className="text-[#ff425a]">For workshops and professional tuners.</span></h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">AK Cloud provides a structured workflow for professional EDC17 file requests. Upload your original read, provide the exact vehicle, engine, ECU hardware and software information and keep the delivered modified file linked to the job.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/register" className="ak-v5-button">Request access <ArrowRight size={18}/></Link><Link href="/en/ecu-file-service" className="ak-v5-button-secondary">ECU File Service</Link></div><div className="mt-12 grid gap-4 md:grid-cols-2"><div className="ak-v5-card p-6"><FileUp className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Correct original read</h2><p className="mt-3 leading-7 text-white/45">The exact read method and available solution depend on the EDC17 variant, protocol, hardware and software.</p></div><div className="ak-v5-card p-6"><CheckCircle2 className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Job-based delivery</h2><p className="mt-3 leading-7 text-white/45">Keep ORI, request information, communication and MOD associated with the same order.</p></div></div></section>
    <section className="border-y border-white/[.06] bg-white/[.018]"><div className="mx-auto max-w-[1180px] px-5 py-20"><div className="ak-v5-kicker">EDC17 IDENTIFICATION</div><h2 className="ak-v5-title mt-4 text-4xl">The ECU family name is only the starting point.</h2><p className="mt-6 max-w-3xl leading-7 text-white/45">Bosch EDC17 covers many different control-unit variants used across diesel and petrol applications. Two ECUs can both be described as EDC17 while using different hardware, software, memories and access protocols. Submit the exact ECU reference, vehicle and engine information and the reading method used with the ORI.</p><p className="mt-4 max-w-3xl leading-7 text-white/45">Always keep an untouched original backup. Before writing a modified file, verify programming-tool compatibility and make sure vehicle voltage and mechanical condition are suitable for the procedure.</p></div></section>
    <section className="mx-auto max-w-[1180px] px-5 py-20"><div className="grid gap-6 lg:grid-cols-2"><div className="ak-v5-card p-7"><h2 className="text-2xl font-bold">A file request with technical context</h2><p className="mt-4 leading-7 text-white/45">The AK Cloud job combines the original ECU file with vehicle identification, requested calibration and technical communication. The delivered MOD is attached to the same request, giving the workshop a traceable record instead of an isolated file with no context.</p><p className="mt-4 leading-7 text-white/45">This is particularly useful when the same workshop manages several EDC17 vehicles or needs to revisit an earlier job.</p></div><div className="ak-v5-card p-7"><h2 className="text-2xl font-bold">Workshop diagnosis still comes first</h2><p className="mt-4 leading-7 text-white/45">A tuning or software file cannot replace fault finding. Active ECU, sensor, boost, fuel-system or electrical faults should be diagnosed before a calibration request. AK Cloud manages the file-service workflow; the professional remains responsible for the vehicle-side diagnosis, reading and writing process.</p></div></div></section>
  </main>
}
