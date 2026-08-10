import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileUp, Gauge } from 'lucide-react'

export const metadata: Metadata = {
  title: 'ECU File Service for Tuners | AK Cloud',
  description: 'Professional ECU file service for tuners and remapping specialists. Upload the ORI, request the calibration and manage each MOD delivery through AK Cloud.',
  alternates: { canonical: '/en/ecu-file-service/tuners' },
}

export default function Page() {
  return <main className="ak-v5-bg min-h-screen text-white"><header className="ak-v5-topbar"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Create account <ArrowRight size={15}/></Link></div></header><section className="mx-auto max-w-[1180px] px-5 py-24"><div className="ak-v5-pill inline-flex"><Gauge size={14}/> PROFESSIONAL TUNERS</div><h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">ECU file service for tuners.<br/><span className="text-[#ff425a]">A cleaner ORI → MOD workflow.</span></h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">Built for remapping professionals who already read and write ECUs. Create the job, upload the original file with the correct vehicle and ECU information and keep the requested calibration and delivered MOD organised in one place.</p><div className="mt-9 flex gap-3"><Link href="/register" className="ak-v5-button">Request access <ArrowRight size={18}/></Link><Link href="/en/ecu-file-service" className="ak-v5-button-secondary">Explore file service</Link></div><div className="mt-12 grid gap-4 md:grid-cols-2"><div className="ak-v5-card p-6"><FileUp className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Submit your ORI</h2><p className="mt-3 leading-7 text-white/45">Attach the original read and the exact ECU, software, engine and read-method details required for the job.</p></div><div className="ak-v5-card p-6"><CheckCircle2 className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Track every calibration</h2><p className="mt-3 leading-7 text-white/45">Keep job information, communication and delivered files linked to the same request instead of scattered across chats.</p></div></div></section></main>
}
