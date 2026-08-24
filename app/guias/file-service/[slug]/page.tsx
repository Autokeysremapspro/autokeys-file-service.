import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react'

type Topic = {
  title: string
  meta: string
  kicker: string
  intro: string
  serviceHref: string
  serviceLabel: string
  sections: Array<{ title: string; paragraphs: string[]; bullets?: string[] }>
}

const topics: Record<string, Topic> = {
  edc17: {
    title: 'Bosch EDC17: guía antes de enviar un archivo',
    meta: 'Guía profesional sobre Bosch EDC17: identificación HW/SW, tipo de lectura, datos del vehículo y comprobaciones antes de solicitar un File Service.',
    kicker: 'BOSCH EDC17 · GUÍA PROFESIONAL',
    intro: 'Bosch EDC17 es una familia muy extendida, pero el nombre EDC17 por sí solo no identifica una ECU concreta. Dentro de la familia existen múltiples variantes, revisiones de hardware y versiones de software. Para que un File Service trabaje con una base clara, el taller debe asociar el ORI a la unidad real, al vehículo y al método con el que se obtuvo la lectura.',
    serviceHref: '/ecu-file-service/edc17',
    serviceLabel: 'Ver Bosch EDC17 File Service',
    sections: [
      {
        title: 'No te quedes solo con “EDC17”',
        paragraphs: [
          'La identificación útil empieza por la referencia concreta de la ECU. Siempre que la herramienta lo muestre, conviene guardar HW, SW, número Bosch o referencia OEM, además de marca, modelo, motor y año. Esa información ayuda a distinguir unidades físicamente similares que no comparten necesariamente el mismo contenido o estrategia.',
          'También es importante conservar una captura o informe de identificación. Si el archivo llega separado de los datos del vehículo, aumenta el riesgo de tratar como equivalentes versiones que no lo son. El objetivo es que cada ORI pueda relacionarse de forma inequívoca con una unidad y un trabajo.',
        ],
      },
      {
        title: 'Indica cómo se obtuvo el archivo',
        paragraphs: [
          'Una EDC17 puede ser accesible por OBD, Bench o Boot según la variante, la herramienta y el protocolo disponible. El método utilizado forma parte de la información técnica del pedido porque no todas las lecturas contienen exactamente las mismas áreas ni se obtienen del mismo modo.',
          'Si la herramienta realiza una lectura virtual, indícalo. Si la lectura es Bench o Boot, anota también el protocolo y conserva el archivo original sin sobrescribirlo. El File Service necesita saber qué tipo de material está recibiendo antes de valorar o preparar una modificación.',
        ],
      },
      {
        title: 'Diagnosis y estado del vehículo antes del software',
        paragraphs: [
          'Un archivo modificado no sustituye una diagnosis. Antes de solicitar una calibración, el profesional debería revisar DTC, alimentación, estado mecánico y cualquier síntoma previo. Fallos de presión, sensores, inyección, turbo, cableado o alimentación no se corrigen por el simple hecho de escribir un MOD.',
        ],
        bullets: ['Guardar identificación HW/SW', 'Conservar el ORI intacto', 'Anotar herramienta y protocolo', 'Leer DTC antes del trabajo', 'Documentar modificaciones mecánicas', 'Comprobar tensión y estabilidad durante lectura/escritura'],
      },
      {
        title: 'Cómo encaja AK Cloud en el flujo EDC17',
        paragraphs: [
          'AK Cloud centraliza el ORI, los datos técnicos, el servicio solicitado, los mensajes asociados y el archivo final. La lectura y la escritura siguen siendo responsabilidad del taller con su propia herramienta; la plataforma organiza la parte de File Service y mantiene cada versión ligada al pedido correspondiente.',
          'Ese enfoque permite volver a un trabajo meses después y saber qué unidad se identificó, qué archivo se subió y qué versión se entregó, algo especialmente útil cuando se gestionan muchas ECUs o varios vehículos con familias similares.',
        ],
      },
    ],
  },
  md1: {
    title: 'Bosch MD1: identificación y preparación del ORI',
    meta: 'Qué debe revisar un taller antes de enviar un archivo Bosch MD1 a un File Service: identificación, método de lectura, diagnosis y datos técnicos.',
    kicker: 'BOSCH MD1 · GUÍA PROFESIONAL',
    intro: 'Bosch MD1 pertenece a una generación moderna de control diésel y agrupa variantes con arquitecturas, protecciones y métodos de acceso diferentes. Para trabajar de forma ordenada no basta con conocer la familia: hay que relacionar el archivo con la referencia exacta, el software, el vehículo y el protocolo utilizado por la herramienta.',
    serviceHref: '/ecu-file-service/md1',
    serviceLabel: 'Ver Bosch MD1 File Service',
    sections: [
      {
        title: 'La identificación exacta es parte del trabajo',
        paragraphs: [
          'En MD1 conviene registrar la identificación que devuelve la herramienta antes de leer. HW, SW, referencia del fabricante y datos del vehículo forman un conjunto. Guardar esa información junto al ORI ayuda a evitar comparaciones incorrectas entre variantes que comparten nombre de familia pero no necesariamente estrategia o contenido.',
          'Si el vehículo tiene historial de reprogramación, actualización o sustitución de ECU, conviene indicarlo. Un archivo que parece original puede haber sido modificado previamente y esa información cambia la forma de evaluar el trabajo.',
        ],
      },
      {
        title: 'Lectura real, virtual y método de acceso',
        paragraphs: [
          'Dependiendo de la herramienta y del protocolo, el archivo puede obtenerse mediante OBD, Bench, Boot o lectura virtual. El taller debe anotar cómo se obtuvo y conservar la identificación del protocolo. No es recomendable asumir que dos archivos del mismo tamaño contienen exactamente las mismas áreas.',
          'Antes de escribir el MOD, confirma que el método previsto de escritura es compatible con esa unidad y con el tipo de archivo recibido. El objetivo no es solo obtener un fichero, sino mantener coherencia entre identificación, lectura y escritura.',
        ],
      },
      {
        title: 'Qué datos ayudan al File Service',
        paragraphs: [
          'Una solicitud bien documentada reduce intercambios innecesarios y permite valorar mejor el trabajo. Además del ORI, aporta motor, combustible, transmisión, DTC relevantes y modificaciones de hardware cuando existan.',
        ],
        bullets: ['Referencia ECU y HW/SW', 'Marca, modelo y motor', 'Herramienta utilizada', 'OBD, Bench o Boot', 'DTC y estado previo', 'Cambios de turbo, inyección, admisión o escape cuando afecten a la calibración'],
      },
      {
        title: 'Trazabilidad del pedido MD1',
        paragraphs: [
          'En AK Cloud cada solicitud mantiene juntos el ORI, los datos aportados, el servicio solicitado y el MOD entregado. Esta trazabilidad resulta especialmente útil en unidades modernas, donde una diferencia de software puede ser tan importante como la referencia física de la ECU.',
          'La plataforma no sustituye la herramienta de programación ni la comprobación del vehículo. Su función es ordenar el File Service para que el taller pueda documentar el trabajo y recuperar fácilmente la información asociada a cada archivo.',
        ],
      },
    ],
  },
  mg1: {
    title: 'Bosch MG1: datos clave antes del File Service',
    meta: 'Guía para talleres sobre Bosch MG1: referencia ECU, HW/SW, método de lectura, estado del vehículo y datos necesarios antes de solicitar un archivo.',
    kicker: 'BOSCH MG1 · GUÍA PROFESIONAL',
    intro: 'Bosch MG1 aparece en numerosas aplicaciones gasolina modernas y existe en múltiples variantes. El primer paso de un buen File Service no es elegir una modificación: es identificar correctamente la unidad y comprobar que el ORI, el software y el vehículo corresponden entre sí.',
    serviceHref: '/ecu-file-service/mg1',
    serviceLabel: 'Ver Bosch MG1 File Service',
    sections: [
      {
        title: 'Identificación antes de tocar el archivo',
        paragraphs: [
          'Guarda la identificación completa que ofrece tu herramienta: referencia, HW, SW y cualquier dato adicional útil. Añade vehículo, motor, combustible y transmisión. Una misma familia puede abarcar aplicaciones distintas, por lo que el nombre MG1 no debería utilizarse como único criterio para clasificar un archivo.',
          'Si el coche ha sido modificado o reprogramado previamente, anótalo. Conocer el historial evita tratar como base original un archivo que ya contiene cambios desconocidos.',
        ],
      },
      {
        title: 'El método de lectura importa',
        paragraphs: [
          'OBD, Bench y Boot pueden producir flujos de trabajo diferentes. Algunas herramientas utilizan lectura virtual en determinados protocolos; otras obtienen contenido directamente de la unidad. El tipo de acceso debe acompañar al archivo para que la solicitud tenga contexto.',
          'Conserva siempre el ORI sin editar y separa claramente las versiones modificadas. Si el proveedor de la herramienta genera copias o recuperaciones automáticas, mantenlas identificadas para no confundirlas con el archivo que se utilizó realmente en el pedido.',
        ],
      },
      {
        title: 'Comprueba el vehículo antes de solicitar potencia',
        paragraphs: [
          'Las aplicaciones gasolina modernas pueden ser sensibles a combustible, temperatura, encendido, presión y estado mecánico. Antes de solicitar una calibración, conviene revisar diagnosis y confirmar que el vehículo funciona correctamente en configuración actual.',
        ],
        bullets: ['Leer y guardar DTC', 'Confirmar combustible utilizado', 'Documentar cambios mecánicos', 'Registrar HW/SW', 'Anotar herramienta y protocolo', 'Mantener una copia intacta del ORI'],
      },
      {
        title: 'AK Cloud como registro del trabajo',
        paragraphs: [
          'AK Cloud reúne la identificación, el archivo original, la solicitud, la conversación técnica y el MOD. Para un taller que gestiona distintos vehículos, esta estructura reduce el riesgo de mezclar versiones y facilita recuperar la información del trabajo cuando el vehículo vuelve más adelante.',
          'La plataforma está pensada para profesionales que ya disponen de equipo de diagnosis, lectura y escritura. El File Service se centra en el tratamiento del archivo dentro de un pedido trazable.',
        ],
      },
    ],
  },
  kess3: {
    title: 'KESS3 y File Service: flujo recomendado',
    meta: 'Cómo organizar un File Service cuando trabajas con KESS3: identificación, ORI, método de lectura, datos del vehículo y entrega del MOD.',
    kicker: 'KESS3 · FLUJO DE FILE SERVICE',
    intro: 'KESS3 es la herramienta con la que el profesional identifica, lee o escribe una unidad cuando existe un protocolo compatible. AK Cloud no sustituye esa herramienta: recibe el material del trabajo y centraliza ORI, información técnica, solicitud, soporte y entrega del archivo modificado.',
    serviceHref: '/file-service-herramientas/kess3',
    serviceLabel: 'Ver KESS3 File Service',
    sections: [
      {
        title: 'Empieza por la identificación, no por el nombre del archivo',
        paragraphs: [
          'Antes de leer, guarda la identificación que muestra KESS3 y relaciónala con el vehículo. Un nombre de archivo creado manualmente no es una fuente suficiente para confirmar HW, SW o variante de ECU. La identificación original de la herramienta aporta contexto al File Service.',
          'Cuando sea posible, conserva también una captura del protocolo utilizado. Esto ayuda a documentar si el acceso se realizó por OBD, Bench o Boot y evita dudas posteriores sobre el origen del ORI.',
        ],
      },
      {
        title: 'Mantén ORI y MOD separados',
        paragraphs: [
          'El archivo original debe conservarse intacto. No lo sobrescribas al recibir el MOD ni lo renombres de forma que pueda confundirse con una versión modificada. Una estructura simple de nombres y carpetas evita errores cuando se gestionan varios vehículos el mismo día.',
          'En AK Cloud el ORI y el archivo entregado permanecen ligados al pedido, junto con los datos técnicos y la conversación. Así el taller puede volver al trabajo y confirmar qué versión se utilizó.',
        ],
      },
      {
        title: 'Datos que deberías incluir en la solicitud',
        paragraphs: ['Cuanto más claro llega el contexto, menos intercambios son necesarios antes de preparar el archivo.'],
        bullets: ['Vehículo y motor', 'ECU y referencias HW/SW', 'Método de acceso con KESS3', 'Tipo de lectura cuando sea relevante', 'DTC previos', 'Modificaciones mecánicas', 'Objetivo solicitado'],
      },
      {
        title: 'La herramienta y el File Service cumplen funciones distintas',
        paragraphs: [
          'KESS3 gestiona la comunicación con la unidad dentro de sus protocolos; el File Service trabaja sobre el archivo recibido. Separar ambas funciones es importante: un problema de conexión, alimentación o protocolo no se resuelve modificando el contenido del archivo.',
          'Del mismo modo, una lectura válida no garantiza por sí sola que el vehículo esté mecánicamente preparado para la modificación solicitada. Diagnosis y comprobación del coche siguen siendo responsabilidad del profesional que tiene el vehículo delante.',
        ],
      },
    ],
  },
  flex: {
    title: 'FLEX y File Service: cómo preparar una solicitud',
    meta: 'Guía profesional para trabajar con FLEX y un File Service: identificación, ORI, protocolo, Bench/Boot/OBD, datos técnicos y trazabilidad.',
    kicker: 'FLEX · FLUJO DE FILE SERVICE',
    intro: 'FLEX permite al profesional acceder a distintas ECUs y TCUs mediante los protocolos disponibles para cada unidad. Para que el File Service pueda trabajar con contexto, el archivo debe llegar acompañado de identificación, método de lectura y datos reales del vehículo. AK Cloud centraliza esa información en un único pedido.',
    serviceHref: '/file-service-herramientas/flex',
    serviceLabel: 'Ver FLEX File Service',
    sections: [
      {
        title: 'Documenta la identificación antes de leer',
        paragraphs: [
          'Guarda HW, SW, referencia y protocolo siempre que estén disponibles. La herramienta puede mostrar información que después no aparece en el nombre del fichero, por lo que conviene conservarla junto al ORI y no depender únicamente de cómo se haya renombrado el archivo.',
          'Si el acceso se realiza en Bench o Boot, documenta también el método utilizado. Si es OBD, indica si la lectura fue directa o virtual cuando la herramienta lo especifique.',
        ],
      },
      {
        title: 'Revisa la coherencia entre lectura y escritura',
        paragraphs: [
          'Antes de iniciar un pedido, confirma qué tipo de archivo has obtenido y qué método de escritura tienes previsto. El objetivo es evitar que un archivo válido para análisis se trate automáticamente como si cualquier protocolo de escritura fuera equivalente.',
          'Conserva copias del ORI y de cualquier backup relevante que genere el procedimiento. La trazabilidad es especialmente útil cuando se trabaja con varias unidades o cuando un vehículo vuelve tiempo después.',
        ],
      },
      {
        title: 'Qué debe acompañar al ORI',
        paragraphs: ['Una solicitud completa permite revisar el archivo con mayor contexto y reduce preguntas posteriores.'],
        bullets: ['Marca, modelo, motor y año', 'ECU o TCU concreta', 'HW/SW o referencias disponibles', 'Protocolo FLEX utilizado', 'OBD, Bench o Boot', 'DTC y síntomas previos', 'Cambios de hardware relevantes'],
      },
      {
        title: 'Centraliza el trabajo en AK Cloud',
        paragraphs: [
          'AK Cloud no controla FLEX ni interviene en la conexión física con la unidad. Su función es mantener juntos el archivo original, el contexto técnico, el servicio solicitado y el MOD entregado para que el taller tenga un historial claro de cada trabajo.',
          'Ese historial ayuda a evitar archivos sueltos por distintos canales y facilita volver a una solicitud sin depender de conversaciones dispersas o nombres de archivo ambiguos.',
        ],
      },
    ],
  },
  autotuner: {
    title: 'AutoTuner y File Service: guía para talleres',
    meta: 'Cómo trabajar con AutoTuner y un File Service: identificación, archivo original, método de lectura, datos del vehículo y gestión del MOD.',
    kicker: 'AUTOTUNER · FLUJO DE FILE SERVICE',
    intro: 'AutoTuner es una herramienta de lectura y escritura utilizada por profesionales para acceder a unidades compatibles. El trabajo del File Service comienza cuando el taller ya dispone de un archivo correctamente identificado y del contexto técnico del vehículo. AK Cloud organiza ese intercambio para que ORI, solicitud y MOD permanezcan asociados.',
    serviceHref: '/file-service-herramientas/autotuner',
    serviceLabel: 'Ver AutoTuner File Service',
    sections: [
      {
        title: 'Conserva la identificación junto al archivo',
        paragraphs: [
          'Antes de enviar un ORI, guarda la información de identificación que muestra la herramienta y confirma que coincide con el vehículo real. La familia de ECU no sustituye a HW, SW, referencias y motorización; esos datos son los que permiten contextualizar el archivo.',
          'Si la lectura utilizada es virtual o depende de un protocolo concreto, indícalo. El File Service necesita saber cómo se obtuvo el material con el que va a trabajar.',
        ],
      },
      {
        title: 'El ORI debe seguir siendo el punto de referencia',
        paragraphs: [
          'No sobrescribas el original al recibir el archivo modificado. Mantener ORI y MOD separados permite volver atrás, comparar versiones y saber exactamente qué se escribió en el vehículo. Si existen varias revisiones, numéralas o asócialas claramente al pedido correspondiente.',
          'AK Cloud mantiene esa relación dentro del mismo trabajo, reduciendo la dependencia de archivos enviados por canales diferentes.',
        ],
      },
      {
        title: 'Checklist para crear el pedido',
        paragraphs: ['Antes de subir el archivo, revisa que la solicitud pueda entenderse sin tener el vehículo delante.'],
        bullets: ['Vehículo y motor correctos', 'ECU y HW/SW', 'Método de lectura AutoTuner', 'DTC antes de modificar', 'Estado mecánico comprobado', 'Modificaciones de hardware declaradas', 'Objetivo del servicio claramente descrito'],
      },
      {
        title: 'Qué resuelve AK Cloud y qué sigue dependiendo del taller',
        paragraphs: [
          'AK Cloud organiza el File Service, pero la diagnosis, la conexión con la unidad, la estabilidad de alimentación, la lectura y la escritura siguen siendo responsabilidad del profesional que trabaja físicamente con el vehículo.',
          'Mantener esa separación clara mejora el diagnóstico de incidencias: si un problema aparece durante comunicación o escritura, se revisa el proceso de herramienta y vehículo; si afecta al contenido solicitado, se revisa el archivo y el pedido.',
        ],
      },
    ],
  },
}

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(topics).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const topic = topics[slug]
  if (!topic) return {}
  const url = `/guias/file-service/${slug}`
  return {
    title: topic.title,
    description: topic.meta,
    alternates: { canonical: url },
    openGraph: { type: 'article', title: `${topic.title} | AK Cloud`, description: topic.meta, url },
    twitter: { card: 'summary_large_image', title: `${topic.title} | AK Cloud`, description: topic.meta },
  }
}

export default async function TechnicalGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const topic = topics[slug]
  if (!topic) notFound()

  const canonical = `https://www.akcloud.es/guias/file-service/${slug}`
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: topic.title,
    description: topic.meta,
    url: canonical,
    inLanguage: 'es-ES',
    datePublished: '2026-08-25',
    dateModified: '2026-08-25',
    author: { '@type': 'Organization', name: 'AK Cloud', url: 'https://www.akcloud.es' },
    publisher: {
      '@type': 'Organization',
      name: 'AK Cloud',
      url: 'https://www.akcloud.es',
      parentOrganization: { '@type': 'Organization', name: 'Autokeys Remaps Pro', url: 'https://www.autokeysremapspro.es/' },
    },
    mainEntityOfPage: canonical,
    audience: { '@type': 'BusinessAudience', audienceType: 'Talleres, preparadores y profesionales de electrónica del automóvil' },
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'AK Cloud', item: 'https://www.akcloud.es/' },
      { '@type': 'ListItem', position: 2, name: 'Guías', item: 'https://www.akcloud.es/guias' },
      { '@type': 'ListItem', position: 3, name: topic.title, item: canonical },
    ],
  }
  const related = Object.entries(topics).filter(([key]) => key !== slug).slice(0, 3)

  return (
    <main className="ak-v5-bg min-h-screen text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <header className="ak-v5-topbar sticky top-0 z-50">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/guias" className="flex items-center gap-2 text-xs font-bold text-white/55 transition hover:text-white"><ArrowLeft size={15}/> Todas las guías</Link>
          <Link href={topic.serviceHref} className="ak-v5-button-secondary !px-4 !py-2.5 text-xs">Servicio relacionado</Link>
        </div>
      </header>

      <article className="mx-auto max-w-[960px] px-5 py-20 lg:px-8">
        <div className="ak-v5-pill inline-flex"><BookOpen size={14}/> {topic.kicker}</div>
        <h1 className="ak-v5-title mt-7 text-4xl sm:text-6xl">{topic.title}</h1>
        <p className="mt-7 text-lg leading-8 text-white/55">{topic.intro}</p>
        <div className="mt-8 flex flex-wrap gap-3 text-xs font-bold text-white/35"><span>Actualizado: 25/08/2026</span><span>•</span><span>Contenido técnico profesional</span><span>•</span><span>AK Cloud</span></div>

        <div className="mt-14 space-y-10">
          {topic.sections.map((section) => (
            <section key={section.title} className="ak-v5-card p-7 sm:p-9">
              <h2 className="text-2xl font-black sm:text-3xl">{section.title}</h2>
              <div className="mt-5 space-y-4">{section.paragraphs.map((p) => <p key={p} className="leading-8 text-white/50">{p}</p>)}</div>
              {section.bullets && <ul className="mt-6 grid gap-3 sm:grid-cols-2">{section.bullets.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-white/55"><CheckCircle2 size={17} className="mt-1 shrink-0 text-[#67e8d1]"/><span>{item}</span></li>)}</ul>}
            </section>
          ))}
        </div>

        <section className="mt-12 rounded-[28px] border border-[#ff425a]/20 bg-[#ff425a]/[.06] p-8 sm:p-10">
          <div className="ak-v5-kicker">Siguiente paso</div>
          <h2 className="ak-v5-title mt-4 text-3xl">¿Ya tienes el ORI y la identificación?</h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/50">Consulta la landing específica y crea tu pedido profesional con el archivo original, los datos técnicos y el servicio solicitado.</p>
          <Link href={topic.serviceHref} className="ak-v5-button mt-7">{topic.serviceLabel} <ArrowRight size={17}/></Link>
        </section>

        <section className="mt-14">
          <div className="ak-v5-kicker">Contenido relacionado</div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">{related.map(([relatedSlug, item]) => <Link key={relatedSlug} href={`/guias/file-service/${relatedSlug}`} className="ak-v5-card group p-6 transition hover:border-white/20"><h2 className="text-lg font-black">{item.title}</h2><div className="mt-5 flex items-center gap-2 text-xs font-black text-[#ff425a]">Leer guía <ArrowRight size={14} className="transition group-hover:translate-x-1"/></div></Link>)}</div>
        </section>
      </article>
    </main>
  )
}
