import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Gauge, FileUp } from 'lucide-react'

const title = 'Stage 2 ECU File Service for Professionals'
const description = 'Professional Stage 2 ECU file service for workshops and tuners. Upload the original ECU read with the vehicle hardware setup and manage your calibration request through AK Cloud.'
const url = '/en/ecu-file-service/stage-2'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { type: 'website', title, description, url, images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Stage 2 ECU File Service · AK Cloud' }] },
  twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] },
}

export default function Page() {
  return <main className="ak-v5-bg min-h-screen text-white"><header className="ak-v5-topbar"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Create account <ArrowRight size={15}/></Link></div></header><section className="mx-auto max-w-[1180px] px-5 py-24"><div className="ak-v5-pill inline-flex"><Gauge size={14}/> STAGE 2 · ECU FILE SERVICE</div><h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">Stage 2 ECU file service.<br/><span className="text-[#ff425a]">Built around the vehicle setup.</span></h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">For workshops and tuners requesting Stage 2 calibration files. Submit the original ECU read together with the exact vehicle, ECU identification, fuel, transmission and relevant hardware modifications so the request can be evaluated correctly.</p><div className="mt-9 flex gap-3"><Link href="/register" className="ak-v5-button">Request access <ArrowRight size={18}/></Link><Link href="/en/ecu-file-service" className="ak-v5-button-secondary">ECU File Service</Link></div><div className="mt-12 grid gap-4 md:grid-cols-2"><div className="ak-v5-card p-6"><FileUp className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Send ORI + hardware details</h2><p className="mt-3 leading-7 text-white/45">Stage 2 requests are assessed against the exact ECU software and the vehicle hardware configuration supplied with the job.</p></div><div className="ak-v5-card p-6"><CheckCircle2 className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Professional job workflow</h2><p className="mt-3 leading-7 text-white/45">Keep the original file, calibration request, communication and delivered MOD together inside one AK Cloud order.</p></div></div></section></main>
}
