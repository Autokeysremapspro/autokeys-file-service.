import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileUp, Gauge, ShieldCheck } from 'lucide-react'

const title = 'Stage 1 File Service for Professional Tuners'
const description = 'Professional Stage 1 file service for workshops and tuners. Upload your ORI, submit vehicle and ECU data and receive the MOD through AK Cloud.'
const url = '/en/stage-1-file-service'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url, languages: { en: url, es: '/stage-1-file-service', 'x-default': '/stage-1-file-service' } },
  openGraph: { type: 'website', title: `${title} | AK Cloud`, description, url, images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Stage 1 File Service · AK Cloud' }] },
  twitter: { card: 'summary_large_image', title: `${title} | AK Cloud`, description, images: ['/og-image.png'] },
}

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Stage 1 File Service',
    serviceType: 'Stage 1 ECU calibration file service for automotive professionals',
    url: 'https://www.akcloud.es/en/stage-1-file-service',
    provider: {
      '@type': 'Organization',
      name: 'AK Cloud',
      url: 'https://www.akcloud.es',
      parentOrganization: { '@type': 'Organization', name: 'Autokeys Remaps Pro', url: 'https://www.autokeysremapspro.es/' },
    },
    audience: { '@type': 'BusinessAudience', audienceType: 'Automotive workshops and professional tuners' },
  }

  return (
    <main className="ak-v5-bg min-h-screen text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="ak-v5-topbar"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Create account <ArrowRight size={15}/></Link></div></header>
      <section className="mx-auto max-w-[1180px] px-5 py-24">
        <div className="ak-v5-pill inline-flex">STAGE 1 · PROFESSIONAL FILE SERVICE</div>
        <h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">Stage 1 tuning files.<br/><span className="text-[#ff425a]">Built around your professional workflow.</span></h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">Read the original ECU file with your compatible tool, submit the vehicle and ECU information and manage the Stage 1 request through AK Cloud. The ORI, job communication and delivered MOD stay connected to the same order.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Link href="/register" className="ak-v5-button">Request access <ArrowRight size={18}/></Link><Link href="/en/ecu-file-service" className="ak-v5-button-secondary">ECU File Service</Link></div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">{[['Upload ORI',FileUp],['Request Stage 1',Gauge],['Receive MOD',ShieldCheck]].map(([t,I]:any)=><div key={t} className="ak-v5-card p-6"><I size={21} className="text-[#67e8d1]"/><h2 className="mt-4 font-bold">{t}</h2></div>)}</div>
      </section>
      <section className="border-y border-white/[.06] bg-white/[.018]"><div className="mx-auto max-w-[1180px] px-5 py-20"><div className="ak-v5-kicker">BEFORE YOU SUBMIT</div><h2 className="ak-v5-title mt-4 text-4xl">A good calibration starts with accurate job data.</h2><p className="mt-6 max-w-3xl leading-7 text-white/45">Provide a verified original read together with the exact vehicle, engine, ECU hardware and software identification and the read method used. Different ECU variants can share a family name while requiring different protocols or calibration approaches, so the exact identification matters.</p><p className="mt-4 max-w-3xl leading-7 text-white/45">The workshop should also check the mechanical condition of the vehicle and investigate active faults before requesting a performance calibration. A Stage 1 file is not a substitute for diagnosis and cannot correct an existing mechanical or electrical problem.</p></div></section>
      <section className="mx-auto max-w-[1180px] px-5 py-20"><div className="grid gap-6 lg:grid-cols-2"><div className="ak-v5-card p-7"><h2 className="text-2xl font-bold">One traceable ORI → MOD workflow</h2><p className="mt-4 leading-7 text-white/45">AK Cloud keeps the original file, vehicle information, requested work, technical messages and delivered modified file connected to the same job. This gives the workshop a clear record of which file belongs to which vehicle instead of spreading information across unrelated chat messages or email threads.</p><p className="mt-4 leading-7 text-white/45">If a later revision is required, the original request and delivered version remain available as technical context for the job.</p></div><div className="ak-v5-card p-7"><h2 className="text-2xl font-bold">Designed for professional workshops</h2><p className="mt-4 leading-7 text-white/45">AK Cloud is a B2B file-service platform. The professional performs reading and writing with a compatible programming tool while the platform manages the file request, support and delivery. Payment is handled per file, so a workshop can start without buying a credit pack or subscription.</p><div className="mt-6 flex items-center gap-3 text-white/50"><CheckCircle2 className="text-[#67e8d1]"/> Pay per file. No credit pack required to start.</div></div></div></section>
    </main>
  )
}
