import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Cpu, FileUp } from 'lucide-react'

const title = 'Bosch MG1 File Service for Professionals'
const description = 'Professional Bosch MG1 ECU file service for workshops and tuners. Upload your original ECU read and manage calibration requests through AK Cloud.'
const url = '/en/ecu-file-service/mg1'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url, languages: { en: url, es: '/ecu-file-service/mg1', 'x-default': '/ecu-file-service/mg1' } },
  openGraph: { type: 'website', title, description, url, images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Bosch MG1 File Service · AK Cloud' }] },
  twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] },
}

export default function Page() {
  return <main className="ak-v5-bg min-h-screen text-white"><header className="ak-v5-topbar"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Create account <ArrowRight size={15}/></Link></div></header><section className="mx-auto max-w-[1180px] px-5 py-24"><div className="ak-v5-pill inline-flex"><Cpu size={14}/> BOSCH MG1 · FILE SERVICE</div><h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">Bosch MG1 file service.<br/><span className="text-[#ff425a]">For professional tuning requests.</span></h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">AK Cloud gives workshops and professional tuners a clear workflow for Bosch MG1 file requests. Upload the original ECU read, identify the exact vehicle and ECU software and receive the modified file inside the same job.</p><div className="mt-9 flex gap-3"><Link href="/register" className="ak-v5-button">Request access <ArrowRight size={18}/></Link><Link href="/en/ecu-file-service" className="ak-v5-button-secondary">ECU File Service</Link></div><div className="mt-12 grid gap-4 md:grid-cols-2"><div className="ak-v5-card p-6"><FileUp className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Exact ECU identification</h2><p className="mt-3 leading-7 text-white/45">Coverage and available calibrations depend on the specific MG1 variant, software and read protocol.</p></div><div className="ak-v5-card p-6"><CheckCircle2 className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">ORI and MOD together</h2><p className="mt-3 leading-7 text-white/45">Keep the original file, request details, support conversation and delivered calibration organised by job.</p></div></div></section></main>
}
