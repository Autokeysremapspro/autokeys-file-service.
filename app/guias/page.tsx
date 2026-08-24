import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, Cpu, FileCheck2, Gauge, GitCompareArrows, TriangleAlert } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Guías de File Service ECU para talleres',
  description: 'Guías técnicas de AK Cloud para talleres y preparadores: ORI, OBD, Bench, Boot, Stage 1/2/3, EDC17, MD1, MG1 y herramientas de programación.',
  alternates: { canonical: '/guias' },
  openGraph: {
    title: 'Guías de File Service ECU | AK Cloud',
    description: 'Contenido técnico para profesionales que trabajan con lectura, escritura y calibración de ECU.',
    url: '/guias',
    type: 'website',
  },
}

const guides = [
  {
    href: '/guias/que-es-ecu-file-service',
    icon: Cpu,
    title: 'Qué es un ECU File Service y cómo funciona',
    text: 'Del archivo original ORI al MOD: qué aporta el taller, qué procesa el File Service y cómo mantener cada trabajo trazable.',
  },
  {
    href: '/guias/como-preparar-archivo-ori',
    icon: FileCheck2,
    title: 'Cómo preparar correctamente un archivo ORI',
    text: 'HW, SW, referencia ECU, tipo de lectura, diagnosis previa y datos que conviene adjuntar antes de solicitar una calibración.',
  },
  {
    href: '/guias/obd-vs-bench-vs-boot',
    icon: GitCompareArrows,
    title: 'OBD vs Bench vs Boot: diferencias reales',
    text: 'Qué cambia entre los métodos de acceso a una ECU y por qué el protocolo utilizado importa para el File Service.',
  },
  {
    href: '/guias/stage-1-vs-stage-2-vs-stage-3',
    icon: Gauge,
    title: 'Stage 1 vs Stage 2 vs Stage 3',
    text: 'Qué significa cada nivel, qué depende del hardware y por qué una etiqueta Stage no sustituye el análisis del vehículo.',
  },
  {
    href: '/guias/errores-al-enviar-archivos-file-service',
    icon: TriangleAlert,
    title: 'Errores al enviar archivos a un File Service',
    text: 'ORI incorrecto, archivos ya modificados, datos incompletos, lecturas dudosas y problemas mecánicos confundidos con software.',
  },
] as const

const technicalGuides = [
  { href: '/guias/file-service/edc17', title: 'Bosch EDC17', text: 'Identificación HW/SW, tipo de lectura, diagnosis y datos que debe llevar el pedido.' },
  { href: '/guias/file-service/md1', title: 'Bosch MD1', text: 'Cómo relacionar ORI, referencia, software y protocolo antes de solicitar un archivo.' },
  { href: '/guias/file-service/mg1', title: 'Bosch MG1', text: 'Buenas prácticas para unidades gasolina modernas y trazabilidad del trabajo.' },
  { href: '/guias/file-service/kess3', title: 'KESS3', text: 'Flujo recomendado desde identificación y lectura hasta la entrega del MOD.' },
  { href: '/guias/file-service/flex', title: 'FLEX', text: 'Qué datos conservar de la herramienta y cómo preparar una solicitud clara.' },
  { href: '/guias/file-service/autotuner', title: 'AutoTuner', text: 'Checklist profesional para mantener ORI, identificación y pedido bien documentados.' },
] as const

export default function GuidesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Guías de File Service ECU para talleres',
    url: 'https://www.akcloud.es/guias',
    isPartOf: { '@type': 'WebSite', name: 'AK Cloud', url: 'https://www.akcloud.es' },
    about: ['ECU File Service', 'ECU tuning files', 'OBD Bench Boot', 'ORI ECU', 'Stage 1 Stage 2 Stage 3', 'Bosch EDC17', 'Bosch MD1', 'Bosch MG1', 'KESS3', 'FLEX', 'AutoTuner'],
  }

  return (
    <main className="ak-v5-bg min-h-screen text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="ak-v5-topbar sticky top-0 z-50">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></Link>
          <Link href="/file-service-ecu" className="ak-v5-button-secondary !px-4 !py-2.5 text-xs">ECU File Service</Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1180px] px-5 py-24 lg:px-8">
        <div className="ak-v5-pill inline-flex"><BookOpen size={14}/> CENTRO TÉCNICO · FILE SERVICE</div>
        <h1 className="ak-v5-title mt-7 max-w-5xl text-5xl sm:text-7xl">Guías de File Service ECU.<br/><span className="text-[#ff425a]">Contenido útil para talleres.</span></h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">Documentación pensada para profesionales que ya trabajan con herramientas de lectura y escritura y quieren enviar solicitudes con mejor información, reducir errores y entender mejor el flujo ORI → servicio → MOD.</p>
        <p className="mt-5 max-w-3xl leading-7 text-white/45">El objetivo de este centro técnico no es sustituir la documentación de cada herramienta ni ofrecer recetas universales. Una misma familia de ECU puede incluir distintas referencias, versiones de hardware, software y métodos de acceso. Por eso reunimos criterios prácticos para identificar mejor cada trabajo antes de subirlo.</p>
        <p className="mt-4 max-w-3xl leading-7 text-white/45">Encontrarás contenidos sobre preparación del archivo original, diferencias entre OBD, Bench y Boot, niveles de calibración y errores habituales al trabajar con un File Service. Cada guía enlaza después con el servicio relacionado para que la parte informativa y el flujo profesional permanezcan conectados.</p>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {guides.map(({ href, icon: Icon, title, text }) => (
            <Link key={href} href={href} className="ak-v5-card group p-7 transition hover:border-white/20">
              <Icon size={23} className="text-[#67e8d1]"/>
              <h2 className="mt-5 text-2xl font-black">{title}</h2>
              <p className="mt-4 leading-7 text-white/45">{text}</p>
              <div className="mt-6 flex items-center gap-2 text-xs font-black text-[#ff425a]">Leer guía <ArrowRight size={14} className="transition group-hover:translate-x-1"/></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-white/[.06] bg-white/[.018]">
        <div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8">
          <div className="ak-v5-kicker">ECU Y HERRAMIENTAS</div>
          <h2 className="ak-v5-title mt-4 max-w-4xl text-4xl">Guías específicas para preparar mejor cada trabajo.</h2>
          <p className="mt-5 max-w-3xl leading-7 text-white/45">Estas guías profundizan en las familias ECU y herramientas que ya tienen landing propia en AK Cloud. El objetivo es que la búsqueda informativa y la página comercial se refuercen mutuamente: primero entiendes qué datos debes comprobar y después accedes al servicio correspondiente.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {technicalGuides.map((guide) => (
              <Link key={guide.href} href={guide.href} className="ak-v5-card group p-6 transition hover:border-white/20">
                <div className="text-xs font-black tracking-[.12em] text-[#67e8d1]">GUÍA TÉCNICA</div>
                <h3 className="mt-4 text-2xl font-black">{guide.title}</h3>
                <p className="mt-4 leading-7 text-white/45">{guide.text}</p>
                <div className="mt-6 flex items-center gap-2 text-xs font-black text-[#ff425a]">Abrir guía <ArrowRight size={14} className="transition group-hover:translate-x-1"/></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <div className="ak-v5-kicker">Del conocimiento al trabajo real</div>
            <h2 className="ak-v5-title mt-4 text-4xl">Cuando tengas el ORI listo, el pedido empieza en AK Cloud.</h2>
            <p className="mt-5 max-w-3xl leading-7 text-white/45">Las guías explican buenas prácticas generales. La compatibilidad y la solución disponible dependen siempre del vehículo, ECU, hardware, software, lectura y estado del sistema.</p>
          </div>
          <div className="ak-v5-card p-7">
            <h3 className="text-2xl font-bold">File Service para profesionales</h3>
            <p className="mt-4 leading-7 text-white/45">Consulta el servicio principal, las familias ECU compatibles y el flujo de solicitud desde una cuenta profesional.</p>
            <Link href="/file-service-ecu" className="ak-v5-button mt-7">Ver ECU File Service <ArrowRight size={17}/></Link>
          </div>
        </div>
      </section>
    </main>
  )
}
