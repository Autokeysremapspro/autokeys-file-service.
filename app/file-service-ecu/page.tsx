import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock3, Euro, FileUp, ShieldCheck, Wrench } from 'lucide-react'

export const metadata: Metadata = {
  title: 'ECU File Service profesional para talleres',
  description: 'File Service ECU para talleres y preparadores. Sube tu ORI, selecciona el servicio, conoce el precio y recibe tu MOD con soporte técnico.',
  alternates: { canonical: '/file-service-ecu', languages: { es: '/file-service-ecu', en: '/en/ecu-file-service', 'x-default': '/file-service-ecu' } },
  openGraph: { title: 'ECU File Service profesional | AK Cloud', description: 'Archivos ECU para profesionales con precio por trabajo, soporte técnico e historial de versiones.', url: '/file-service-ecu' },
}

const services = ['Stage 1 y Stage 2', 'Calibraciones personalizadas', 'Revisiones del archivo entregado', 'Soporte vinculado al pedido', 'Historial ORI y MOD', 'ECU y TCU según cobertura']
const cluster = [
  ['/stage-1-file-service','Stage 1 File Service','Solicitudes Stage 1 para profesionales con herramienta propia.'],
  ['/ecu-file-service/edc17','Bosch EDC17','File service orientado a la familia Bosch EDC17.'],
  ['/ecu-file-service/md1','Bosch MD1','Flujo profesional de archivos para Bosch MD1.'],
  ['/ecu-file-service/mg1','Bosch MG1','Solicitudes de archivo para la familia Bosch MG1.'],
  ['/file-service-herramientas/kess3','KESS3 File Service','Para profesionales que obtienen sus ORI con KESS3.'],
  ['/file-service-herramientas/flex','FLEX File Service','File service para usuarios profesionales de FLEX.'],
  ['/file-service-herramientas/autotuner','AutoTuner File Service','Flujo ORI/MOD para profesionales que trabajan con AutoTuner.'],
] as const

export default function EcuFileServicePage() {
  const jsonLd = {
    '@context':'https://schema.org',
    '@type':'Service',
    name:'AK Cloud ECU File Service',
    serviceType:'Professional ECU and TCU tuning file service',
    provider:{
      '@type':'Organization',
      name:'AK Cloud',
      url:'https://www.akcloud.es',
      parentOrganization:{ '@type':'Organization', name:'Autokeys Remaps Pro', url:'https://www.autokeysremapspro.es/' },
    },
    areaServed:{ '@type':'Country', name:'España' },
    audience:{'@type':'BusinessAudience',audienceType:'Automotive workshops and professional tuners'},
    url:'https://www.akcloud.es/file-service-ecu',
  }
  return (
    <main className="ak-v5-bg min-h-screen text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="ak-v5-topbar sticky top-0 z-50"><div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 lg:px-8"><Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link><div className="flex gap-2"><Link href="/login" className="ak-v5-button-secondary !px-4 !py-2.5 text-xs">Acceder</Link><Link href="/register" className="ak-v5-button !px-4 !py-2.5 text-xs">Crear cuenta <ArrowRight size={15}/></Link></div></div></header>
      <section className="mx-auto grid max-w-[1280px] gap-12 px-5 py-24 lg:grid-cols-[1.1fr_.9fr] lg:px-8"><div><div className="ak-v5-pill inline-flex">ECU FILE SERVICE · PARA PROFESIONALES</div><h1 className="ak-v5-title mt-7 text-5xl sm:text-7xl">Tu archivo ECU.<br/><span className="text-[#ff425a]">Sin comprar créditos.</span></h1><p className="mt-7 max-w-2xl text-lg leading-8 text-white/50">AK Cloud es un file service profesional para talleres y preparadores que ya disponen de herramienta de lectura y escritura. Sube el ORI, indica el vehículo y la ECU, selecciona el trabajo y conoce el precio antes de pagar.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="ak-v5-button">Solicitar acceso profesional <ArrowRight size={18}/></Link><Link href="/stage-1-file-service" className="ak-v5-button-secondary">Stage 1 File Service</Link></div><div className="mt-8 flex flex-wrap gap-4 text-xs font-bold text-white/45">{['Pago por archivo','Sin suscripción','Soporte técnico real','Historial de versiones'].map(x => <span key={x} className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#67e8d1]"/>{x}</span>)}</div></div><div className="ak-v5-card p-7 sm:p-9"><div className="text-xs font-black uppercase tracking-[.18em] text-[#ff425a]">Cómo funciona</div>{[['01','Lee y sube el ORI',FileUp],['02','Selecciona la solución',Wrench],['03','Comprueba el precio',Euro],['04','Recibe y prueba tu MOD',ShieldCheck]].map(([n,t,I]: any) => <div key={n} className="mt-6 flex items-center gap-4 border-b border-white/[.06] pb-6"><div className="text-xs font-black text-white/25">{n}</div><div className="grid h-11 w-11 place-items-center rounded-xl bg-white/[.05]"><I size={19}/></div><div className="font-bold">{t}</div></div>)}</div></section>
      <section className="border-y border-white/[.06] bg-white/[.018]"><div className="mx-auto max-w-[1280px] px-5 py-20 lg:px-8"><div className="ak-v5-kicker">File service para el trabajo diario</div><h2 className="ak-v5-title mt-4 text-4xl sm:text-5xl">Un pedido. Un precio. Un historial.</h2><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{services.map(x => <div key={x} className="ak-v5-card flex items-center gap-3 p-5"><CheckCircle2 size={18} className="text-[#67e8d1]"/><span className="font-semibold">{x}</span></div>)}</div></div></section>
      <section className="mx-auto max-w-[1280px] px-5 py-20 lg:px-8"><div className="ak-v5-kicker">Explora el file service</div><h2 className="ak-v5-title mt-4 text-4xl sm:text-5xl">ECUs, herramientas y servicios.</h2><p className="mt-5 max-w-3xl leading-7 text-white/45">Accede a la sección más cercana a tu forma de trabajo. Estas páginas forman parte del mismo servicio profesional de AK Cloud.</p><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{cluster.map(([href,title,text]) => <Link key={href} href={href} className="ak-v5-card group p-6 transition hover:border-white/20"><div className="text-lg font-black">{title}</div><p className="mt-3 text-sm leading-6 text-white/45">{text}</p><div className="mt-5 flex items-center gap-2 text-xs font-black text-[#ff425a]">Ver servicio <ArrowRight size={14} className="transition group-hover:translate-x-1"/></div></Link>)}</div></section>
      <section className="border-t border-white/[.06]"><div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-20 lg:grid-cols-2 lg:px-8"><div><div className="ak-v5-kicker">Compatibilidad profesional</div><h2 className="ak-v5-title mt-4 text-4xl">Trabaja con tu equipo habitual.</h2><p className="mt-5 leading-7 text-white/45">El servicio está dirigido a profesionales capaces de obtener y escribir correctamente el archivo de la ECU o TCU. La compatibilidad concreta depende del vehículo, ECU, protocolo y tipo de lectura.</p></div><div className="ak-v5-card p-7"><Clock3 className="text-[#ff425a]"/><h3 className="mt-5 text-2xl font-bold">¿Ya tienes el archivo original?</h3><p className="mt-3 leading-7 text-white/45">Crea tu cuenta profesional y utiliza AK Cloud como canal de trabajo: pedido, archivo, mensajes, versiones y entrega en el mismo workspace.</p><Link href="/register" className="ak-v5-button mt-7">Empezar con AK Cloud <ArrowRight size={17}/></Link></div></div></section>
    </main>
  )
}
