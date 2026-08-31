import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileUp, ShieldCheck, Wrench } from 'lucide-react'

const title = 'ECU File Service & Tuning Files for Professional Tuners'
const description = 'Professional ECU file service and tuning files for workshops and tuners worldwide. Upload your ORI, submit vehicle and ECU data and receive the MOD through AK Cloud. Pay per file.'
const url = '/en/ecu-file-service'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url, languages: { en: url, es: '/file-service-ecu', 'x-default': '/file-service-ecu' } },
  robots: { index: true, follow: true },
  openGraph: { type: 'website', title: `${title} | AK Cloud`, description, url, images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Professional ECU File Service · AK Cloud' }] },
  twitter: { card: 'summary_large_image', title: `${title} | AK Cloud`, description, images: ['/og-image.png'] },
}

const commercialLinks = [
  ['/en/stage-1-file-service', 'Stage 1 tuning files', 'Professional Stage 1 file requests for workshops using their own reading and writing tools.'],
  ['/en/ecu-file-service/tuning-files-online', 'ECU tuning files online', 'Submit the ORI and manage the full tuning-file workflow online.'],
  ['/en/ecu-file-service/diesel-ecu-tuning-files', 'Diesel ECU tuning files', 'Structured diesel calibration requests with vehicle, ECU and read-method data.'],
  ['/en/ecu-file-service/petrol-tuning-files', 'Petrol ECU tuning files', 'Professional petrol calibration workflow based on the real vehicle configuration.'],
  ['/en/ecu-file-service/performance-tuning', 'Performance tuning files', 'Performance-oriented ECU file requests for professional workshops and tuners.'],
  ['/en/ecu-file-service/custom-tuning', 'Custom ECU tuning files', 'Custom calibration requests with hardware, fuel and technical context attached to the job.'],
  ['/en/ecu-file-service/workshops', 'ECU file service for workshops', 'A B2B workflow for garages and workshops that need repeatable ECU file handling.'],
  ['/en/ecu-file-service/tuners', 'ECU file service for tuners', 'Organised ORI, requirements, support and MOD delivery for professional tuners.'],
  ['/en/ecu-file-service/edc17', 'Bosch EDC17 file service', 'Professional file-service workflow for Bosch EDC17 families.'],
  ['/en/ecu-file-service/md1', 'Bosch MD1 file service', 'Structured file requests for Bosch MD1 control units.'],
  ['/en/ecu-file-service/mg1', 'Bosch MG1 file service', 'Professional file-service workflow for Bosch MG1 control units.'],
  ['/en/ecu-file-service/autotuner', 'AutoTuner file service', 'ORI/MOD workflow for professionals reading ECUs with AutoTuner.'],
] as const

const faqs = [
  ['What is an ECU file service?', 'An ECU file service prepares or modifies an ECU calibration file for a professional workshop or tuner that performs the vehicle diagnosis, ECU reading and final writing.'],
  ['Do I need to buy credit packs?', 'AK Cloud is designed around pay-per-file jobs, so professionals can request a file without committing to a large credit package.'],
  ['What information should I send with the ORI?', 'Include the exact vehicle, engine, ECU family, hardware and software identification when available, the programming tool, read method and relevant hardware changes.'],
  ['Can I use KESS3, FLEX or AutoTuner?', 'Coverage depends on the exact ECU and protocol, but AK Cloud supports professional workflows where the workshop obtains a valid ORI with its own compatible tool.'],
] as const

export default function EnglishEcuFileServicePage() {
  const jsonLd = [
    {
      '@context':'https://schema.org','@type':'Service',name:'AK Cloud ECU File Service',serviceType:'Professional ECU and TCU tuning file service',
      provider:{'@type':'Organization',name:'AK Cloud',url:'https://www.akcloud.es',parentOrganization:{'@type':'Organization',name:'Autokeys Remaps Pro',url:'https://www.autokeysremapspro.es/'}},
      areaServed:'Worldwide',audience:{'@type':'BusinessAudience',audienceType:'Automotive workshops and professional tuners'},url:'https://www.akcloud.es/en/ecu-file-service',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
  ]

  return <main className="ak-v5-bg min-h-screen text-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}} />
    <header className="ak-v5-topbar sticky top-0 z-50"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4 lg:px-8"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Create account <ArrowRight size={15}/></Link></div></header>
    <section className="mx-auto max-w-[1180px] px-5 py-24 lg:px-8"><div className="ak-v5-pill inline-flex">PROFESSIONAL ECU FILE SERVICE · TUNING FILES</div><h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">ECU tuning files for professionals.<br/><span className="text-[#ff425a]">Pay per file. Keep every job organised.</span></h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">AK Cloud is a professional ECU file service for workshops and tuners using their own reading and writing tools. Upload the original ECU file (ORI), identify the vehicle and control unit, request the calibration and receive the modified file (MOD) inside the same job workspace.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="ak-v5-button">Request professional access <ArrowRight size={18}/></Link><Link href="/file-service-ecu" className="ak-v5-button-secondary">Español</Link></div><div className="mt-12 grid gap-4 md:grid-cols-3">{[['Upload your ORI',FileUp],['Request the calibration',Wrench],['Receive your MOD',ShieldCheck]].map(([t,I]:any)=><div key={t} className="ak-v5-card p-6"><I size={21} className="text-[#67e8d1]"/><h2 className="mt-4 text-lg font-bold">{t}</h2></div>)}</div></section>

    <section className="border-y border-white/[.06] bg-white/[.018]"><div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8"><div className="ak-v5-kicker">Built for B2B workflows</div><h2 className="ak-v5-title mt-4 text-4xl">Professional tuning files without a fragmented workflow.</h2><div className="mt-8 grid gap-4 md:grid-cols-2">{['Pay per file','ORI and MOD history','Job-linked technical support','Clear vehicle and ECU identification'].map(x=><div key={x} className="ak-v5-card flex items-center gap-3 p-5"><CheckCircle2 size={18} className="text-[#67e8d1]"/><span className="font-semibold">{x}</span></div>)}</div><p className="mt-8 max-w-3xl leading-7 text-white/45">Compatibility and available solutions depend on the exact vehicle, ECU hardware and software, protocol and read type. The professional remains responsible for correct diagnosis, reading and writing procedures.</p></div></section>

    <section className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8">
      <div className="ak-v5-kicker">ECU FILE SERVICE DIRECTORY</div>
      <h2 className="ak-v5-title mt-4 text-4xl sm:text-5xl">Tuning files, ECU families and professional workflows.</h2>
      <p className="mt-5 max-w-3xl leading-7 text-white/45">Use the most specific page for the type of ECU file request you handle. These pages are part of the same AK Cloud professional file-service platform.</p>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {commercialLinks.map(([href, linkTitle, text]) => <Link key={href} href={href} className="ak-v5-card group p-6 transition hover:border-white/20"><h3 className="text-lg font-black">{linkTitle}</h3><p className="mt-3 text-sm leading-6 text-white/45">{text}</p><div className="mt-5 flex items-center gap-2 text-xs font-black text-[#ff425a]">View service <ArrowRight size={14} className="transition group-hover:translate-x-1"/></div></Link>)}
      </div>
    </section>

    <section className="border-y border-white/[.06] bg-white/[.018]"><div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8"><div className="grid gap-6 lg:grid-cols-2"><div className="ak-v5-card p-7"><h2 className="text-2xl font-bold">What to include with an ECU file request</h2><p className="mt-4 leading-7 text-white/45">Send a verified original ECU read and provide the exact vehicle, engine, ECU hardware and software identification, programming tool and read method. Accurate information helps the file-service team understand the technical context and prevents different control-unit variants from being treated as if they were interchangeable.</p><p className="mt-4 leading-7 text-white/45">Keep an untouched ORI backup before any programming work. If the same ECU supports more than one access protocol, record how the file was obtained because the available content can differ between reading methods.</p></div><div className="ak-v5-card p-7"><h2 className="text-2xl font-bold">A professional workflow, not just a download link</h2><p className="mt-4 leading-7 text-white/45">Each AK Cloud request keeps vehicle data, the original file, requested work, technical communication and delivered MOD connected to the same job. Workshops can return to the history later and identify exactly which file was supplied for a vehicle.</p><p className="mt-4 leading-7 text-white/45">AK Cloud manages the B2B file-service workflow while the workshop remains responsible for diagnostics, vehicle condition and safe reading and writing procedures.</p></div></div></section>

    <section className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8"><div className="ak-v5-kicker">ECU FILE SERVICE FAQ</div><h2 className="ak-v5-title mt-4 text-4xl">Questions from workshops and tuners.</h2><div className="mt-8 grid gap-4 md:grid-cols-2">{faqs.map(([q,a])=><article key={q} className="ak-v5-card p-6"><h3 className="text-lg font-black">{q}</h3><p className="mt-3 text-sm leading-7 text-white/45">{a}</p></article>)}</div></section>
  </main>
}
