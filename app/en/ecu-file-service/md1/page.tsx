import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Cpu, FileUp } from 'lucide-react'

const title = 'Bosch MD1 File Service for Professionals'
const description = 'Professional Bosch MD1 File Service for workshops and tuners. Upload the ORI, identify the ECU and manage calibration delivery through AK Cloud.'
const url = '/en/ecu-file-service/md1'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url, languages: { en: url, es: '/ecu-file-service/md1', 'x-default': '/ecu-file-service/md1' } },
  openGraph: { type: 'website', title: `${title} | AK Cloud`, description, url, images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Bosch MD1 File Service · AK Cloud' }] },
  twitter: { card: 'summary_large_image', title: `${title} | AK Cloud`, description, images: ['/og-image.png'] },
}

export default function Page() {
  const jsonLd = {
    '@context':'https://schema.org','@type':'Service',name:'Bosch MD1 File Service',serviceType:'Bosch MD1 ECU file service for automotive professionals',url:'https://www.akcloud.es/en/ecu-file-service/md1',
    provider:{'@type':'Organization',name:'AK Cloud',url:'https://www.akcloud.es',parentOrganization:{'@type':'Organization',name:'Autokeys Remaps Pro',url:'https://www.autokeysremapspro.es/'}},
    audience:{'@type':'BusinessAudience',audienceType:'Automotive workshops and professional tuners'},
  }
  return <main className="ak-v5-bg min-h-screen text-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <header className="ak-v5-topbar"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Create account <ArrowRight size={15}/></Link></div></header>
    <section className="mx-auto max-w-[1180px] px-5 py-24"><div className="ak-v5-pill inline-flex"><Cpu size={14}/> BOSCH MD1 · FILE SERVICE</div><h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">Bosch MD1 file service.<br/><span className="text-[#ff425a]">Professional ECU tuning workflow.</span></h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">For workshops and tuners working with Bosch MD1 ECUs. Submit the original read together with the exact vehicle, engine, hardware and software information and keep the complete ORI/MOD workflow linked to one AK Cloud job.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/register" className="ak-v5-button">Request access <ArrowRight size={18}/></Link><Link href="/en/ecu-file-service" className="ak-v5-button-secondary">ECU File Service</Link></div><div className="mt-12 grid gap-4 md:grid-cols-2"><div className="ak-v5-card p-6"><FileUp className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Upload the correct ORI</h2><p className="mt-3 leading-7 text-white/45">Available calibrations depend on the exact MD1 variant, software, protocol and read method.</p></div><div className="ak-v5-card p-6"><CheckCircle2 className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Structured file delivery</h2><p className="mt-3 leading-7 text-white/45">Vehicle data, original file, communication and delivered MOD remain associated with the same order.</p></div></div></section>
    <section className="border-y border-white/[.06] bg-white/[.018]"><div className="mx-auto max-w-[1180px] px-5 py-20"><div className="ak-v5-kicker">MD1 TECHNICAL CONTEXT</div><h2 className="ak-v5-title mt-4 text-4xl">Identify the exact control unit before requesting a file.</h2><p className="mt-6 max-w-3xl leading-7 text-white/45">Bosch MD1 belongs to a modern generation of diesel engine-control units with multiple hardware and software variants. The family name alone is not enough to determine coverage or the correct file strategy. Include the ECU reference, vehicle, engine, software identification and the method used to obtain the read.</p><p className="mt-4 max-w-3xl leading-7 text-white/45">Keep an untouched backup of the original file and confirm that the programming tool and protocol are appropriate for the specific unit before writing any modified calibration.</p></div></section>
    <section className="mx-auto max-w-[1180px] px-5 py-20"><div className="grid gap-6 lg:grid-cols-2"><div className="ak-v5-card p-7"><h2 className="text-2xl font-bold">From original read to delivered MOD</h2><p className="mt-4 leading-7 text-white/45">AK Cloud keeps the MD1 original file, vehicle and ECU data, requested work, support messages and delivered MOD in the same job. This makes the request easier to audit and revisit than exchanging isolated files through separate messaging channels.</p><p className="mt-4 leading-7 text-white/45">If the workshop later needs a review, the technical history remains linked to the original request.</p></div><div className="ak-v5-card p-7"><h2 className="text-2xl font-bold">Vehicle-side checks remain essential</h2><p className="mt-4 leading-7 text-white/45">The workshop should diagnose active faults and confirm mechanical and electrical condition before requesting or writing a calibration. Stable vehicle voltage, a compatible tool and a verified original read are part of a reliable programming workflow.</p></div></div></section>
  </main>
}
