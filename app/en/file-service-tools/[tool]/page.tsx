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
  const title = `${item.name} File Service for Professional Tuners`
  const description = `ECU File Service for workshops using ${item.name}. Upload the ORI, add vehicle and ECU data and manage support and MOD delivery through AK Cloud.`
  const url = `/en/file-service-tools/${tool}`
  return {
    title,
    description,
    alternates: { canonical: url, languages: { en: url, es: `/file-service-herramientas/${tool}`, 'x-default': `/file-service-herramientas/${tool}` } },
    openGraph: { type: 'website', title: `${title} | AK Cloud`, description, url, images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `${item.name} File Service · AK Cloud` }] },
    twitter: { card: 'summary_large_image', title: `${title} | AK Cloud`, description, images: ['/og-image.png'] },
  }
}

export default async function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params
  const item = tools[tool as ToolKey]
  if (!item) notFound()
  const jsonLd = {
    '@context':'https://schema.org','@type':'Service',name:`${item.name} File Service`,serviceType:`ECU file service for professionals using ${item.name}`,url:`https://www.akcloud.es/en/file-service-tools/${tool}`,
    provider:{'@type':'Organization',name:'AK Cloud',url:'https://www.akcloud.es',parentOrganization:{'@type':'Organization',name:'Autokeys Remaps Pro',url:'https://www.autokeysremapspro.es/'}},
    audience:{'@type':'BusinessAudience',audienceType:'Automotive workshops and professional tuners'},
  }
  return <main className="ak-v5-bg min-h-screen text-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <header className="ak-v5-topbar"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Create account <ArrowRight size={15}/></Link></div></header>
    <section className="mx-auto max-w-[1180px] px-5 py-24"><div className="ak-v5-pill inline-flex"><Wrench size={14}/> {item.name} · PROFESSIONAL FILE SERVICE</div><h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">{item.name} file service.<br/><span className="text-[#ff425a]">From your ORI to the delivered MOD.</span></h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">Already reading and writing ECUs with {item.name}? AK Cloud keeps the original file, vehicle and ECU identification, requested calibration, communication and delivered modified file together in one professional job.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/register" className="ak-v5-button">Request access <ArrowRight size={18}/></Link><Link href="/en/ecu-file-service" className="ak-v5-button-secondary">ECU File Service</Link></div><div className="mt-12 grid gap-4 md:grid-cols-2"><div className="ak-v5-card p-6"><FileUp className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Upload your ORI</h2><p className="mt-3 leading-7 text-white/45">Use your own compatible {item.name} protocol to read the ECU and submit the original file with complete identification.</p></div><div className="ak-v5-card p-6"><CheckCircle2 className="text-[#67e8d1]"/><h2 className="mt-4 text-xl font-bold">Receive the MOD</h2><p className="mt-3 leading-7 text-white/45">The requested calibration and delivered file remain associated with the same AK Cloud order.</p></div></div></section>
    <section className="border-y border-white/[.06] bg-white/[.018]"><div className="mx-auto max-w-[1180px] px-5 py-20"><div className="ak-v5-kicker">TOOL + FILE SERVICE</div><h2 className="ak-v5-title mt-4 text-4xl">{item.name} handles the vehicle connection. AK Cloud handles the file job.</h2><p className="mt-6 max-w-3xl leading-7 text-white/45">{item.name} is the professional programming tool used to read or write compatible control units. AK Cloud does not replace the tool or its protocols. It provides the B2B file-service layer after the original read: upload the ORI, identify the vehicle and ECU, request the required work, communicate with the file-service team and receive the MOD in the same job.</p><p className="mt-4 max-w-3xl leading-7 text-white/45">Always verify that the ECU identification matches the uploaded file and keep an untouched original backup. If the control unit supports several read methods, include the protocol used because different access modes can provide different file contents.</p></div></section>
    <section className="mx-auto max-w-[1180px] px-5 py-20"><div className="grid gap-6 lg:grid-cols-2"><div className="ak-v5-card p-7"><h2 className="text-2xl font-bold">A clearer workflow for busy workshops</h2><p className="mt-4 leading-7 text-white/45">Instead of exchanging an unnamed binary through chat, the AK Cloud order links the original file to vehicle data, ECU information, the requested service, support messages and the final MOD. This makes it easier to track several customer vehicles and recover the exact file supplied for a previous job.</p><p className="mt-4 leading-7 text-white/45">The workshop retains its own programming workflow with {item.name} while AK Cloud centralises the file-service history.</p></div><div className="ak-v5-card p-7"><h2 className="text-2xl font-bold">Checks before reading or writing</h2><p className="mt-4 leading-7 text-white/45">Confirm stable vehicle voltage, diagnose relevant faults and use the correct {item.name} protocol for the ECU. A modified file cannot compensate for a mechanical fault or an incomplete original read. Vehicle-side diagnosis and programming remain the responsibility of the professional workshop.</p></div></div></section>
  </main>
}
