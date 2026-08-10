import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, FileUp, Gauge, Workflow } from 'lucide-react'

type Topic = {
  title: string
  description: string
  kicker: string
  heading: string
  accent: string
  intro: string
}

const topics = {
  'diesel-tuning': {
    title: 'Diesel ECU Tuning File Service',
    description: 'Professional diesel ECU tuning file service for workshops and tuners. Upload the original ECU read and manage performance calibration requests through AK Cloud.',
    kicker: 'DIESEL ECU TUNING · FILE SERVICE',
    heading: 'Diesel ECU tuning files.',
    accent: 'Professional calibration workflow.',
    intro: 'For workshops and tuners working with diesel engine management. Upload the original ECU read, identify the exact vehicle, engine, ECU and software, and submit the required calibration through one structured AK Cloud job.',
  },
  'petrol-tuning': {
    title: 'Petrol ECU Tuning File Service',
    description: 'Professional petrol ECU tuning file service for workshops and tuners. Submit the original ECU read and performance calibration request through AK Cloud.',
    kicker: 'PETROL ECU TUNING · FILE SERVICE',
    heading: 'Petrol ECU tuning files.',
    accent: 'Built for professional tuning requests.',
    intro: 'For workshops and tuners working with petrol engine management. Upload the original ECU read and provide the exact vehicle, engine, ECU, software, read method, hardware configuration and requested performance target.',
  },
  'turbo-diesel-tuning': {
    title: 'Turbo Diesel ECU Tuning File Service',
    description: 'Turbo diesel ECU tuning file service for professional workshops and tuners. Upload the original ECU read, vehicle data and hardware configuration through AK Cloud.',
    kicker: 'TURBO DIESEL · ECU FILE SERVICE',
    heading: 'Turbo diesel ECU tuning files.',
    accent: 'Structured for professional calibration work.',
    intro: 'For workshops and tuners handling turbo diesel performance requests. Submit the original ECU read with exact vehicle, engine, ECU, software, read method and relevant hardware information for technical evaluation.',
  },
  'turbo-petrol-tuning': {
    title: 'Turbo Petrol ECU Tuning File Service',
    description: 'Turbo petrol ECU tuning file service for professional workshops and tuners. Submit the original ECU read, hardware setup and performance target through AK Cloud.',
    kicker: 'TURBO PETROL · ECU FILE SERVICE',
    heading: 'Turbo petrol ECU tuning files.',
    accent: 'Built around the real vehicle setup.',
    intro: 'For professional turbo petrol calibration requests. Upload the original ECU read and provide the exact engine, ECU, software, read method, fuel, turbo and relevant hardware configuration for technical evaluation.',
  },
  chiptuning: {
    title: 'Chiptuning File Service',
    description: 'Professional chiptuning file service for workshops and tuners. Upload the original ECU file and manage tuning requirements and delivery through AK Cloud.',
    kicker: 'CHIPTUNING · FILE SERVICE',
    heading: 'Chiptuning files for workshops and tuners.',
    accent: 'Technical requests managed clearly.',
    intro: 'AK Cloud provides a structured workflow for professional chiptuning file requests. Upload the original ECU read, provide the vehicle and ECU information and define the required calibration before technical evaluation.',
  },
  'ecu-remap': {
    title: 'ECU Remap File Service',
    description: 'Professional ECU remap file service for workshops and tuners. Upload the original ECU read, vehicle details and tuning requirements through AK Cloud.',
    kicker: 'ECU REMAP · FILE SERVICE',
    heading: 'ECU remap files for professionals.',
    accent: 'From original read to delivered calibration.',
    intro: 'A professional ECU remapping workflow for workshops and tuners. Upload the original ECU file, identify the vehicle and control unit, describe the requested result and keep the complete technical job organised inside AK Cloud.',
  },
  'online-tuning': {
    title: 'Online ECU Tuning File Service',
    description: 'Online ECU tuning file service for professional workshops and tuners. Upload the original ECU read, submit the vehicle requirements and manage the job through AK Cloud.',
    kicker: 'ONLINE ECU TUNING · FILE SERVICE',
    heading: 'Online ECU tuning file service.',
    accent: 'Upload the ORI. Manage the complete job online.',
    intro: 'A professional online workflow for workshops and tuners. Submit the original ECU file together with vehicle identification, ECU data, read method and requested calibration, then keep the request and delivered file organised in AK Cloud.',
  },
  'tuning-files': {
    title: 'ECU Tuning Files for Workshops',
    description: 'ECU tuning files for professional workshops and tuners through AK Cloud. Upload the original ECU read and manage each calibration request in one organised workflow.',
    kicker: 'ECU TUNING FILES · WORKSHOPS & TUNERS',
    heading: 'ECU tuning files for workshops.',
    accent: 'A structured file service for professional jobs.',
    intro: 'AK Cloud provides a dedicated workflow for professional ECU tuning file requests. Upload the original read, identify the vehicle and ECU, describe the required calibration and keep the delivered file linked to the job.',
  },
  'car-tuning': {
    title: 'Car ECU Tuning File Service',
    description: 'Car ECU tuning file service for professional workshops and tuners. Upload the original ECU read and manage performance calibration requests through AK Cloud.',
    kicker: 'CAR ECU TUNING · FILE SERVICE',
    heading: 'Car ECU tuning file service.',
    accent: 'Professional calibration requests in one workflow.',
    intro: 'For workshops and tuners handling passenger-car ECU calibration jobs. Upload the original ECU file, identify the vehicle and control unit, specify the required tuning and keep the complete request organised in AK Cloud.',
  },
  'remapping-files': {
    title: 'ECU Remapping Files Online',
    description: 'Professional ECU remapping files online for workshops and tuners. Send the original ECU read and manage the calibration request through the AK Cloud file service.',
    kicker: 'ECU REMAPPING FILES · ONLINE',
    heading: 'ECU remapping files online.',
    accent: 'A file service workflow for professional tuners.',
    intro: 'Submit ECU remapping requests without scattering files and technical details across different channels. Upload the ORI, provide the vehicle and ECU information, describe the requested calibration and manage the delivered MOD through AK Cloud.',
  },
  'professional-remapping': {
    title: 'Professional ECU Remapping File Service',
    description: 'Professional ECU remapping file service for workshops and tuners. Upload the original ECU read and manage vehicle data, requirements, support and MOD delivery through AK Cloud.',
    kicker: 'PROFESSIONAL ECU REMAPPING · FILE SERVICE',
    heading: 'Professional ECU remapping files.',
    accent: 'Built for workshop workflows.',
    intro: 'Submit the original ECU read with accurate vehicle, ECU, read method and calibration requirements. AK Cloud keeps the technical request, support and delivered modified file organised around the same job.',
  },
  'tuning-for-tuners': {
    title: 'ECU Tuning File Service for Tuners',
    description: 'ECU tuning file service for professional tuners. Send original ECU files, technical requirements and vehicle information through the organised AK Cloud workflow.',
    kicker: 'ECU TUNING FILES · FOR TUNERS',
    heading: 'ECU tuning files for tuners.',
    accent: 'Send the ORI. Keep the job organised.',
    intro: 'A professional file service workflow for tuners handling ECU calibration jobs. Submit the original read, vehicle and ECU identification, read method, hardware details and requested calibration in one structured request.',
  },
  'ecu-calibration': {
    title: 'ECU Calibration File Service',
    description: 'Professional ECU calibration file service for workshops and tuners. Upload the original ECU read, vehicle data and calibration requirements through AK Cloud.',
    kicker: 'ECU CALIBRATION · FILE SERVICE',
    heading: 'ECU calibration files.',
    accent: 'Built from the original read and real job data.',
    intro: 'AK Cloud gives professional workshops and tuners a structured way to submit ECU calibration requests. Upload the original file, identify the vehicle and ECU, describe the hardware and requested result, and keep the technical workflow organised from ORI to delivered MOD.',
  },
  garages: {
    title: 'ECU File Service for Garages',
    description: 'ECU file service for garages and automotive workshops. Upload the original ECU read, vehicle information and job requirements through the AK Cloud workflow.',
    kicker: 'GARAGES · ECU FILE SERVICE',
    heading: 'ECU file service for garages.',
    accent: 'A simpler way to manage tuning jobs.',
    intro: 'AK Cloud is designed for garages that need a clear professional workflow for ECU file requests. Submit the original read, vehicle and ECU information, requested work and relevant job details without relying on fragmented email or messaging threads.',
  },
  'tuning-file-provider': {
    title: 'ECU Tuning File Provider for Professionals',
    description: 'Professional ECU tuning file provider for workshops and tuners. Submit original ECU reads and job data through the structured AK Cloud file service workflow.',
    kicker: 'ECU TUNING FILE PROVIDER · PROFESSIONAL',
    heading: 'An ECU tuning file provider.',
    accent: 'Built for professional workshop workflows.',
    intro: 'AK Cloud provides workshops and professional tuners with a structured way to request ECU tuning files. Upload the original read, identify the vehicle and ECU, add the relevant technical data and keep each request, conversation and delivered file linked to the same job.',
  },
  'tuning-file-supplier': {
    title: 'ECU Tuning File Supplier for Workshops',
    description: 'ECU tuning file supplier for professional workshops and tuners. Upload original ECU files, job details and calibration requirements through AK Cloud.',
    kicker: 'ECU TUNING FILE SUPPLIER · WORKSHOPS',
    heading: 'ECU tuning files for workshops.',
    accent: 'A supplier workflow designed around real jobs.',
    intro: 'AK Cloud is designed for professional workshops and tuners that need a clear ECU tuning file supply workflow. Send the original ECU read with vehicle identification, ECU details, read method and calibration requirements, then keep the technical exchange and delivered file connected to the job.',
  },
  'remap-files-for-tuners': {
    title: 'ECU Remap Files for Tuners | Professional File Service',
    description: 'ECU remap files for professional tuners. Upload original ECU reads and calibration requirements through the AK Cloud online file service workflow.',
    kicker: 'ECU REMAP FILES · TUNERS',
    heading: 'ECU remap files for tuners.',
    accent: 'A professional workflow from ORI to delivery.',
    intro: 'AK Cloud provides professional tuners with a clear workflow for ECU remap file requests. Submit the original ECU read, identify the vehicle and control unit, include the read method and requested calibration, and keep the complete technical exchange connected to the job.',
  },
  'custom-tuning-files': {
    title: 'Custom ECU Tuning Files for Professionals',
    description: 'Custom ECU tuning files for professional workshops and tuners. Upload the original ECU read and job requirements through the AK Cloud file service.',
    kicker: 'CUSTOM ECU TUNING FILES · PROFESSIONALS',
    heading: 'Custom ECU tuning files.',
    accent: 'Built around the vehicle and the job.',
    intro: 'AK Cloud gives professional workshops and tuners a structured way to request custom ECU tuning files. Upload the original ECU read with vehicle, ECU, software, read method and calibration requirements so each request arrives with the technical context needed for the job.',
  },
} satisfies Record<string, Topic>

type TopicKey = keyof typeof topics

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(topics).map((topic) => ({ topic }))
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params
  const item = topics[topic as TopicKey]
  if (!item) return {}

  const url = `/en/ecu-file-service/${topic}`
  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: url, languages: { en: url, 'x-default': url } },
    openGraph: {
      type: 'website',
      title: item.title,
      description: item.description,
      url,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `${item.title} · AK Cloud` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: item.description,
      images: ['/og-image.png'],
    },
  }
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params
  const item = topics[topic as TopicKey]
  if (!item) notFound()

  return (
    <main className="ak-v5-bg min-h-screen text-white">
      <header className="ak-v5-topbar sticky top-0 z-50">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link>
          <Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Create account <ArrowRight size={15}/></Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1180px] px-5 py-24 lg:px-8">
        <div className="ak-v5-pill inline-flex"><Gauge size={14}/> {item.kicker}</div>
        <h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">{item.heading}<br/><span className="text-[#ff425a]">{item.accent}</span></h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">{item.intro}</p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/register" className="ak-v5-button">Request professional access <ArrowRight size={18}/></Link>
          <Link href="/en/ecu-file-service" className="ak-v5-button-secondary">ECU File Service</Link>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="ak-v5-card p-6"><FileUp className="text-[#67e8d1]"/><h2 className="mt-4 text-lg font-bold">Upload the original ECU read</h2><p className="mt-3 leading-7 text-white/45">Keep the ORI together with vehicle, ECU, software and read-method information required for the request.</p></div>
          <div className="ak-v5-card p-6"><Workflow className="text-[#67e8d1]"/><h2 className="mt-4 text-lg font-bold">One job, one workflow</h2><p className="mt-3 leading-7 text-white/45">Vehicle data, calibration requirements and technical communication remain linked to the same order.</p></div>
          <div className="ak-v5-card p-6"><CheckCircle2 className="text-[#67e8d1]"/><h2 className="mt-4 text-lg font-bold">Professional MOD delivery</h2><p className="mt-3 leading-7 text-white/45">The delivered modified file stays associated with the original request for clear workshop traceability.</p></div>
        </div>
      </section>

      <section className="border-y border-white/[.06] bg-white/[.018]">
        <div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8">
          <div className="ak-v5-kicker">PROFESSIONAL FILE SERVICE</div>
          <h2 className="ak-v5-title mt-4 max-w-4xl text-4xl">Accurate ECU identification and job data matter.</h2>
          <p className="mt-6 max-w-3xl leading-7 text-white/45">Availability and calibration scope depend on the exact vehicle, ECU hardware and software, reading method and information supplied with the request. AK Cloud organises the workflow; the professional workshop performs reading and writing with its own compatible tool.</p>
        </div>
      </section>
    </main>
  )
}
