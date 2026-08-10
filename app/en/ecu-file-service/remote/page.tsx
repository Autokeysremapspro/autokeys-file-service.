import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Cloud, FileUp, Workflow } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Remote ECU File Service for Workshops & Tuners | AK Cloud',
  description: 'Remote ECU tuning file service for professional workshops and tuners. Upload the original ECU file online and manage your calibration request and MOD delivery in AK Cloud.',
  alternates: { canonical: '/en/ecu-file-service/remote' },
}

export default function Page() {
  return <main className="ak-v5-bg min-h-screen text-white"><header className="ak-v5-topbar"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Create account <ArrowRight size={15}/></Link></div></header><section className="mx-auto max-w-[1180px] px-5 py-24"><div className="ak-v5-pill inline-flex"><Cloud size={14}/> REMOTE ECU FILE SERVICE</div><h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">Remote ECU file service.<br/><span className="text-[#ff425a]">Upload ORI. Receive MOD.</span></h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">A remote workflow for professional workshops and tuners. Read the ECU with your own compatible tool, submit the original file and job information online, and manage the resulting calibration delivery through AK Cloud.</p><div className="mt-9 flex gap-3"><Link href="/register" className="ak-v5-button">Create account <ArrowRight size={18}/></Link><Link href="/en/ecu-file-service" className="ak-v5-button-secondary">ECU File Service</Link></div><div className="mt-12 grid gap-4 md:grid-cols-2"><div className="ak-v5-card p-6"><FileUp className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Work from your own workshop</h2><p className="mt-3 leading-7 text-white/45">Upload the ORI together with vehicle, ECU and read-method information without changing your normal read/write workflow.</p></div><div className="ak-v5-card p-6"><Workflow className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">One job, one history</h2><p className="mt-3 leading-7 text-white/45">Requests and delivered files remain grouped by job for a clearer professional file-service process.</p></div></div></section></main>
}
