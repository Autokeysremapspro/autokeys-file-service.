import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Cpu, FileUp } from 'lucide-react'

const title = 'Bosch MG1 File Service for Professionals'
const description = 'Professional Bosch MG1 File Service for workshops and tuners. Upload the ORI, identify the ECU and manage calibration delivery through AK Cloud.'
const url = '/en/ecu-file-service/mg1'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url, languages: { en: url, es: '/ecu-file-service/mg1', 'x-default': '/ecu-file-service/mg1' } },
  openGraph: { type: 'website', title: `${title} | AK Cloud`, description, url, images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Bosch MG1 File Service · AK Cloud' }] },
  twitter: { card: 'summary_large_image', title: `${title} | AK Cloud`, description, images: ['/og-image.png'] },
}

export default function Page() {
  const jsonLd = {
    '@context':'https://schema.org','@type':'Service',name:'Bosch MG1 File Service',serviceType:'Bosch MG1 ECU file service for automotive professionals',url:'https://www.akcloud.es/en/ecu-file-service/mg1',
    provider:{'@type':'Organization',name:'AK Cloud',url:'https://www.akcloud.es',parentOrganization:{'@type':'Organization',name:'Autokeys Remaps Pro',url:'https://www.autokeysremapspro.es/'}},
    audience:{'@type':'BusinessAudience',audienceType:'Automotive workshops and professional tuners'},
  }
  return <main className="ak-v5-bg min-h-screen text-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <header className="ak-v5-topbar"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Create account <ArrowRight size={15}/></Link></div></header>
    <section className="mx-auto max-w-[1180px] px-5 py-24"><div className="ak-v5-pill inline-flex"><Cpu size={14}/> BOSCH MG1 · FILE SERVICE</div><h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">Bosch MG1 file service.<br/><span className="text-[#ff425a]">For professional tuning requests.</span></h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">AK Cloud gives workshops and professional tuners a clear workflow for Bosch MG1 file requests. Upload the original ECU read, identify the exact vehicle and ECU software and receive the modified file inside the same job.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/register" className="ak-v5-button">Request access <ArrowRight size={18}/></Link><Link href="/en/ecu-file-service" className="ak-v5-button-secondary">ECU File Service</Link></div><div className="mt-12 grid gap-4 md:grid-cols-2"><div className="ak-v5-card p-6"><FileUp className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Exact ECU identification</h2><p className="mt-3 leading-7 text-white/45">Coverage and available calibrations depend on the specific MG1 variant, software and read protocol.</p></div><div className="ak-v5-card p-6"><CheckCircle2 className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">ORI and MOD together</h2><p className="mt-3 leading-7 text-white/45">Keep the original file, request details, support conversation and delivered calibration organised by job.</p></div></div></section>
    <section className="border-y border-white/[.06] bg-white/[.018]"><div className="mx-auto max-w-[1180px] px-5 py-20"><div className="ak-v5-kicker">MG1 TECHNICAL CONTEXT</div><h2 className="ak-v5-title mt-4 text-4xl">Match the file to the exact vehicle and ECU software.</h2><p className="mt-6 max-w-3xl leading-7 text-white/45">Bosch MG1 is used across many modern petrol applications and includes multiple hardware and software variants. A generic family name is not enough for a reliable file request. Submit the vehicle, engine, ECU identification, software data and read method together with the untouched original file.</p><p className="mt-4 max-w-3xl leading-7 text-white/45">The programming method matters as well. Depending on the control unit and tool, different access modes can expose different data, so the workshop should record how the original file was obtained and verify the intended write procedure before programming.</p></div></section>
    <section className="mx-auto max-w-[1180px] px-5 py-20"><div className="grid gap-6 lg:grid-cols-2"><div className="ak-v5-card p-7"><h2 className="text-2xl font-bold">Keep every MG1 job traceable</h2><p className="mt-4 leading-7 text-white/45">AK Cloud links the ORI, technical vehicle data, requested calibration, support discussion and delivered MOD to a single order. This makes it easier for professional workshops to manage several vehicles without losing the relationship between each original and modified file.</p><p className="mt-4 leading-7 text-white/45">A later review can start from the existing job history instead of reconstructing the request from scattered messages.</p></div><div className="ak-v5-card p-7"><h2 className="text-2xl font-bold">Diagnosis before calibration</h2><p className="mt-4 leading-7 text-white/45">Check active faults, mechanical condition and electrical stability before requesting or writing a modified file. AK Cloud provides the B2B file-service workflow; the professional workshop remains responsible for the vehicle-side diagnosis and programming process.</p></div></div></section>
  </main>
}
