import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileUp, Gauge, ShieldCheck, Wrench } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Stage 1 File Service para profesionales | AK Cloud',
  description: 'Stage 1 tuning file service para talleres y preparadores. Sube tu ORI, identifica vehículo y ECU y solicita tu calibración desde AK Cloud. Pago por archivo.',
  alternates: { canonical: '/stage-1-file-service', languages: { es: '/stage-1-file-service', en: '/en/stage-1-file-service', 'x-default': '/stage-1-file-service' } },
}

export default function Stage1FileServicePage() {
  const steps = [
    ['01', 'Lee el archivo original', FileUp],
    ['02', 'Identifica vehículo, motor y ECU', Wrench],
    ['03', 'Solicita Stage 1', Gauge],
    ['04', 'Recibe el MOD en tu pedido', ShieldCheck],
  ]
  return (
    <main className="ak-v5-bg min-h-screen text-white">
      <header className="ak-v5-topbar sticky top-0 z-50"><div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 lg:px-8"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Crear cuenta <ArrowRight size={15}/></Link></div></header>
      <section className="mx-auto max-w-[1100px] px-5 py-24 lg:px-8">
        <div className="ak-v5-pill inline-flex">STAGE 1 FILE SERVICE · B2B</div>
        <h1 className="ak-v5-title mt-7 max-w-4xl text-5xl sm:text-7xl">Stage 1 para tu taller.<br/><span className="text-[#ff425a]">Tú lees. AK Cloud gestiona el archivo.</span></h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">Servicio orientado a profesionales que disponen de herramienta de lectura y escritura. Centraliza el ORI, los datos del vehículo, la solicitud, los mensajes y la entrega del archivo modificado dentro del mismo pedido.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="ak-v5-button">Solicitar acceso profesional <ArrowRight size={18}/></Link><Link href="/file-service-ecu" className="ak-v5-button-secondary">Ver ECU File Service</Link></div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">{steps.map(([n,t,I]: any) => <div key={n} className="ak-v5-card flex items-center gap-4 p-6"><div className="text-xs font-black text-white/25">{n}</div><I size={20} className="text-[#67e8d1]"/><div className="font-bold">{t}</div></div>)}</div>
      </section>
      <section className="border-y border-white/[.06] bg-white/[.018]"><div className="mx-auto max-w-[1100px] px-5 py-20 lg:px-8"><div className="ak-v5-kicker">Pensado para profesionales</div><h2 className="ak-v5-title mt-4 text-4xl">Sin packs de créditos para empezar.</h2><div className="mt-8 grid gap-4 md:grid-cols-3">{['Pago por archivo','Historial ORI / MOD','Soporte ligado al pedido'].map(x => <div key={x} className="ak-v5-card flex items-center gap-3 p-5"><CheckCircle2 size={18} className="text-[#67e8d1]"/><span className="font-semibold">{x}</span></div>)}</div><p className="mt-8 max-w-3xl leading-7 text-white/45">La calibración adecuada depende del vehículo, configuración mecánica, ECU, combustible, estado del vehículo y calidad de la lectura. AK Cloud no sustituye la diagnosis ni las comprobaciones previas del profesional.</p></div></section>
      <section className="mx-auto max-w-[1100px] px-5 py-20 lg:px-8"><div className="ak-v5-card p-8 sm:p-10"><h2 className="ak-v5-title text-4xl">¿Tienes el ORI preparado?</h2><p className="mt-4 max-w-2xl leading-7 text-white/45">Crea tu cuenta profesional y empieza a gestionar tus solicitudes de archivos desde AK Cloud.</p><Link href="/register" className="ak-v5-button mt-7">Crear cuenta profesional <ArrowRight size={17}/></Link></div></section>
    </main>
  )
}
