import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileUp, Wrench } from 'lucide-react'

const title = 'ECU File Service for Workshops'
const description = 'Professional ECU file service for automotive workshops. Upload the original ECU read, request the required calibration and receive the modified file through AK Cloud.'
const url = '/en/ecu-file-service/workshops'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url, languages: { en: url, 'x-default': url } },
  openGraph: { type: 'website', title, description, url, images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'ECU File Service for Workshops · AK Cloud' }] },
  twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] },
}

export default function Page() {
  return <main className="ak-v5-bg min-h-screen text-white"><header className="ak-v5-topbar"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Create account <ArrowRight size={15}/></Link></div></header><section className="mx-auto max-w-[1180px] px-5 py-24"><div className="ak-v5-pill inline-flex"><Wrench size={14}/> WORKSHOPS · ECU FILE SERVICE</div><h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">ECU file service for workshops.<br/><span className="text-[#ff425a]">Send the ORI. Keep the job moving.</span></h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">AK Cloud is built for automotive workshops that read and write ECUs but need professional calibration support. Create a job, upload the original read and keep the requested service and delivered MOD organised in one place.</p><div className="mt-9 flex gap-3"><Link href="/register" className="ak-v5-button">Create workshop account <ArrowRight size={18}/></Link><Link href="/en/ecu-file-service" className="ak-v5-button-secondary">Explore File Service</Link></div><div className="mt-12 grid gap-4 md:grid-cols-2"><div className="ak-v5-card p-6"><FileUp className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Simple professional workflow</h2><p className="mt-3 leading-7 text-white/45">Upload the original ECU file with the vehicle and ECU information needed to evaluate the request.</p></div><div className="ak-v5-card p-6"><CheckCircle2 className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Orders stay organised</h2><p className="mt-3 leading-7 text-white/45">Each job keeps its ORI, requested calibration, communication and delivered MOD together for easier workshop management.</p></div></div></section></main>
}
