import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, SlidersHorizontal, FileUp } from 'lucide-react'

const title = 'Custom ECU Tuning File Service'
const description = 'Custom ECU tuning file service for professional workshops and tuners. Send the original ECU read and precise vehicle requirements through the AK Cloud workflow.'
const url = '/en/ecu-file-service/custom-tuning'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url, languages: { en: url, 'x-default': url } },
  openGraph: { type: 'website', title, description, url, images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Custom ECU Tuning File Service · AK Cloud' }] },
  twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] },
}

export default function Page() {
  return <main className="ak-v5-bg min-h-screen text-white"><header className="ak-v5-topbar"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Create account <ArrowRight size={15}/></Link></div></header><section className="mx-auto max-w-[1180px] px-5 py-24"><div className="ak-v5-pill inline-flex"><SlidersHorizontal size={14}/> CUSTOM ECU TUNING · FILE SERVICE</div><h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">Custom ECU tuning files.<br/><span className="text-[#ff425a]">A clear workflow for specific requests.</span></h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">For professional jobs that need more context than a generic calibration request. Upload the original ECU file and provide the exact vehicle configuration, ECU identification, hardware changes and requested result for technical evaluation.</p><div className="mt-9 flex gap-3"><Link href="/register" className="ak-v5-button">Request access <ArrowRight size={18}/></Link><Link href="/en/ecu-file-service" className="ak-v5-button-secondary">ECU File Service</Link></div><div className="mt-12 grid gap-4 md:grid-cols-2"><div className="ak-v5-card p-6"><FileUp className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Detailed request data</h2><p className="mt-3 leading-7 text-white/45">The more accurately the ECU, software, read method, hardware and target are described, the better the request can be assessed.</p></div><div className="ak-v5-card p-6"><CheckCircle2 className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Everything linked to the job</h2><p className="mt-3 leading-7 text-white/45">ORI, requirements, support conversation and delivered MOD stay organised in the same professional workflow.</p></div></div></section></main>
}
