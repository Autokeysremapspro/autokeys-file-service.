import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, FileUp, Wrench } from 'lucide-react'

const tools = {
  kess3: { name: 'KESS3', maker: 'Alientech' },
  flex: { name: 'FLEX', maker: 'Magicmotorsport' },
} as const

type ToolKey = keyof typeof tools

export function generateStaticParams() { return Object.keys(tools).map(tool => ({ tool })) }

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool } = await params
  const item = tools[tool as ToolKey]
  if (!item) return {}
  return {
    title: `${item.name} File Service for Professional Tuners | AK Cloud`,
    description: `Professional ECU file service for workshops and tuners using ${item.name} by ${item.maker}. Upload your ORI and manage MOD delivery through AK Cloud.`,
    alternates: { canonical: `/en/file-service-tools/${tool}`, languages: { en: `/en/file-service-tools/${tool}`, es: `/file-service-herramientas/${tool}`, 'x-default': `/file-service-herramientas/${tool}` } },
  }
}

export default async function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params
  const item = tools[tool as ToolKey]
  if (!item) notFound()
  return <main className="ak-v5-bg min-h-screen text-white"><header className="ak-v5-topbar"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Create account <ArrowRight size={15}/></Link></div></header><section className="mx-auto max-w-[1180px] px-5 py-24"><div className="ak-v5-pill inline-flex"><Wrench size={14}/> {item.name} · PROFESSIONAL FILE SERVICE</div><h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">{item.name} file service.<br/><span className="text-[#ff425a]">From your ORI to the delivered MOD.</span></h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">Already reading and writing ECUs with {item.name}? AK Cloud keeps the original file, vehicle and ECU identification, requested calibration, communication and delivered modified file together in one professional job.</p><div className="mt-9 flex gap-3"><Link href="/register" className="ak-v5-button">Request access <ArrowRight size={18}/></Link><Link href="/en/ecu-file-service" className="ak-v5-button-secondary">ECU File Service</Link></div><div className="mt-12 grid gap-4 md:grid-cols-2"><div className="ak-v5-card p-6"><FileUp className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Upload your ORI</h2><p className="mt-3 leading-7 text-white/45">Use your own compatible {item.name} protocol to read the ECU and submit the original file with complete identification.</p></div><div className="ak-v5-card p-6"><CheckCircle2 className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Receive the MOD</h2><p className="mt-3 leading-7 text-white/45">The requested calibration and delivered file remain associated with the same AK Cloud order.</p></div></div></section></main>
}
