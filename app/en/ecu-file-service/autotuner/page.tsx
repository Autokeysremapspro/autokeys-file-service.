import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileUp, Wrench } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AutoTuner ECU File Service for Professionals | AK Cloud',
  description: 'Professional ECU file service for workshops and tuners using AutoTuner. Upload the original ECU read and manage your ORI/MOD workflow through AK Cloud.',
  alternates: { canonical: '/en/ecu-file-service/autotuner', languages: { en: '/en/ecu-file-service/autotuner', es: '/ecu-file-service/autotuner', 'x-default': '/ecu-file-service/autotuner' } },
}

export default function Page() {
  return <main className="ak-v5-bg min-h-screen text-white"><header className="ak-v5-topbar"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Create account <ArrowRight size={15}/></Link></div></header><section className="mx-auto max-w-[1180px] px-5 py-24"><div className="ak-v5-pill inline-flex"><Wrench size={14}/> AUTOTUNER · FILE SERVICE</div><h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">AutoTuner file service.<br/><span className="text-[#ff425a]">A clear workflow for professional ECU jobs.</span></h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">For workshops and tuners reading ECUs with AutoTuner. Upload your original file with the exact vehicle and ECU information and keep the complete calibration request organised inside AK Cloud.</p><div className="mt-9 flex gap-3"><Link href="/register" className="ak-v5-button">Request access <ArrowRight size={18}/></Link><Link href="/en/ecu-file-service" className="ak-v5-button-secondary">ECU File Service</Link></div><div className="mt-12 grid gap-4 md:grid-cols-2"><div className="ak-v5-card p-6"><FileUp className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Upload your AutoTuner read</h2><p className="mt-3 leading-7 text-white/45">Submit the ORI together with vehicle, ECU, software and read-method details required for the job.</p></div><div className="ak-v5-card p-6"><CheckCircle2 className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">One job, complete history</h2><p className="mt-3 leading-7 text-white/45">Original file, request details, communication and delivered MOD remain linked to the same order.</p></div></div></section></main>
}
