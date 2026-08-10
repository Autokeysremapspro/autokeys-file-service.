import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Gauge, FileUp } from 'lucide-react'

const title = 'Stage 3 ECU File Service'
const description = 'Stage 3 ECU tuning file service for professional workshops and tuners. Submit the original ECU read, vehicle setup and hardware specification through AK Cloud.'
const url = '/en/ecu-file-service/stage-3'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url, languages: { en: url, es: '/ecu-file-service/stage-3', 'x-default': '/ecu-file-service/stage-3' } },
  openGraph: { type: 'website', title, description, url, images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Stage 3 ECU File Service · AK Cloud' }] },
  twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] },
}

export default function Page() {
  return <main className="ak-v5-bg min-h-screen text-white"><header className="ak-v5-topbar"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Create account <ArrowRight size={15}/></Link></div></header><section className="mx-auto max-w-[1180px] px-5 py-24"><div className="ak-v5-pill inline-flex"><Gauge size={14}/> STAGE 3 · ECU FILE SERVICE</div><h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">Stage 3 ECU tuning files.<br/><span className="text-[#ff425a]">Built around the actual hardware setup.</span></h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">For professional projects with significant hardware changes. Upload the original ECU read and describe the vehicle, ECU identification, read method, turbo, fueling, intake, exhaust and other relevant modifications for technical evaluation.</p><div className="mt-9 flex gap-3"><Link href="/register" className="ak-v5-button">Request access <ArrowRight size={18}/></Link><Link href="/en/ecu-file-service/custom-tuning" className="ak-v5-button-secondary">Custom tuning</Link></div><div className="mt-12 grid gap-4 md:grid-cols-2"><div className="ak-v5-card p-6"><FileUp className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Hardware-specific request</h2><p className="mt-3 leading-7 text-white/45">Provide the exact configuration so the request can be evaluated against the real engine and ECU setup rather than a generic Stage calibration.</p></div><div className="ak-v5-card p-6"><CheckCircle2 className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Professional workflow</h2><p className="mt-3 leading-7 text-white/45">ORI, technical requirements, support conversation and delivered MOD remain organised together inside AK Cloud.</p></div></div></section></main>
}