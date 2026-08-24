import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileUp, ShieldCheck, Wrench } from 'lucide-react'

const title = 'ECU File Service for Professional Tuners'
const description = 'Professional ECU File Service for workshops and tuners. Upload your ORI, submit vehicle and ECU data and receive the MOD through AK Cloud. Pay per file.'
const url = '/en/ecu-file-service'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url, languages: { en: url, es: '/file-service-ecu', 'x-default': '/file-service-ecu' } },
  openGraph: { type: 'website', title: `${title} | AK Cloud`, description, url, images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Professional ECU File Service · AK Cloud' }] },
  twitter: { card: 'summary_large_image', title: `${title} | AK Cloud`, description, images: ['/og-image.png'] },
}

export default function EnglishEcuFileServicePage() {
  const jsonLd = {
    '@context':'https://schema.org','@type':'Service',name:'AK Cloud ECU File Service',serviceType:'Professional ECU and TCU tuning file service',
    provider:{'@type':'Organization',name:'AK Cloud',url:'https://www.akcloud.es',parentOrganization:{'@type':'Organization',name:'Autokeys Remaps Pro',url:'https://www.autokeysremapspro.es/'}},
    areaServed:'Worldwide',audience:{'@type':'BusinessAudience',audienceType:'Automotive workshops and professional tuners'},url:'https://www.akcloud.es/en/ecu-file-service',
  }
  return <main className="ak-v5-bg min-h-screen text-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}} />
    <header className="ak-v5-topbar sticky top-0 z-50"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4 lg:px-8"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Create account <ArrowRight size={15}/></Link></div></header>
    <section className="mx-auto max-w-[1180px] px-5 py-24 lg:px-8"><div className="ak-v5-pill inline-flex">PROFESSIONAL ECU FILE SERVICE</div><h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">ECU tuning files for professionals.<br/><span className="text-[#ff425a]">Pay per file. Keep every job organised.</span></h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">AK Cloud is built for workshops and professional tuners using their own reading and writing tools. Upload the original file, identify the vehicle and ECU, request the required calibration and receive the modified file inside the same job workspace.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="ak-v5-button">Request professional access <ArrowRight size={18}/></Link><Link href="/file-service-ecu" className="ak-v5-button-secondary">Español</Link></div><div className="mt-12 grid gap-4 md:grid-cols-3">{[['Upload your ORI',FileUp],['Request the calibration',Wrench],['Receive your MOD',ShieldCheck]].map(([t,I]:any)=><div key={t} className="ak-v5-card p-6"><I size={21} className="text-[#67e8d1]"/><h2 className="mt-4 text-lg font-bold">{t}</h2></div>)}</div></section>
    <section className="border-y border-white/[.06] bg-white/[.018]"><div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8"><div className="ak-v5-kicker">Built for B2B workflows</div><h2 className="ak-v5-title mt-4 text-4xl">No credit packs required to get started.</h2><div className="mt-8 grid gap-4 md:grid-cols-2">{['Pay per file','ORI and MOD history','Job-linked technical support','Clear vehicle and ECU identification'].map(x=><div key={x} className="ak-v5-card flex items-center gap-3 p-5"><CheckCircle2 size={18} className="text-[#67e8d1]"/><span className="font-semibold">{x}</span></div>)}</div><p className="mt-8 max-w-3xl leading-7 text-white/45">Compatibility and available solutions depend on the exact vehicle, ECU hardware and software, protocol and read type. The professional remains responsible for correct diagnosis, reading and writing procedures.</p></div></section>
    <section className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8"><div className="grid gap-6 lg:grid-cols-2"><div className="ak-v5-card p-7"><h2 className="text-2xl font-bold">What to include with an ECU file request</h2><p className="mt-4 leading-7 text-white/45">Send a verified original ECU read and provide the exact vehicle, engine, ECU hardware and software identification, programming tool and read method. Accurate information helps the file-service team understand the technical context and prevents different control-unit variants from being treated as if they were interchangeable.</p><p className="mt-4 leading-7 text-white/45">Keep an untouched ORI backup before any programming work. If the same ECU supports more than one access protocol, record how the file was obtained because the available content can differ between reading methods.</p></div><div className="ak-v5-card p-7"><h2 className="text-2xl font-bold">A professional workflow, not just a download link</h2><p className="mt-4 leading-7 text-white/45">Each AK Cloud request keeps vehicle data, the original file, requested work, technical communication and delivered MOD connected to the same job. Workshops can return to the history later and identify exactly which file was supplied for a vehicle.</p><p className="mt-4 leading-7 text-white/45">AK Cloud manages the B2B file-service workflow while the workshop remains responsible for diagnostics, vehicle condition and safe reading and writing procedures.</p></div></div></section>
  </main>
}
