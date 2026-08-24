import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react'

type Guide = {
  title: string
  meta: string
  kicker: string
  intro: string
  serviceHref: string
  serviceLabel: string
  sections: Array<{ title: string; paragraphs: string[]; bullets?: string[] }>
}

const guides: Record<string, Guide> = {
  'que-es-ecu-file-service': {
    title: 'Qué es un ECU File Service y cómo funciona',
    meta: 'Qué es un ECU File Service, cómo funciona el flujo ORI a MOD y qué información debe aportar un taller para solicitar archivos ECU correctamente.',
    kicker: 'FUNDAMENTOS · ECU FILE SERVICE',
    intro: 'Un ECU File Service es un servicio profesional orientado a talleres y preparadores que ya disponen de herramientas para leer y escribir unidades de control. El profesional obtiene el archivo original de la ECU, aporta la información técnica del vehículo y solicita una calibración o solución concreta. El File Service trabaja sobre ese material y devuelve un archivo modificado asociado al mismo trabajo.',
    serviceHref: '/file-service-ecu',
    serviceLabel: 'Ver ECU File Service',
    sections: [
      {
        title: 'El flujo básico: ORI → solicitud → MOD',
        paragraphs: [
          'El punto de partida es el archivo original, normalmente identificado como ORI. Ese archivo debe corresponder a la ECU real del vehículo y debe haberse obtenido mediante un protocolo compatible con la herramienta utilizada. Junto al ORI conviene aportar marca, modelo, motor, referencia de ECU, hardware, software, tipo de lectura y cualquier modificación mecánica relevante.',
          'A partir de esa información se evalúa el trabajo solicitado. Una vez preparado el archivo modificado, el taller recibe el MOD y realiza la escritura con su propia herramienta. El File Service no sustituye la diagnosis, la lectura ni la escritura: organiza y ejecuta la parte de calibración o tratamiento del archivo dentro del alcance acordado.',
        ],
      },
      {
        title: 'Qué necesita aportar el taller',
        paragraphs: [
          'Cuanto mejor llega documentado un trabajo, menos margen existe para confundir una referencia, una versión de software o una configuración mecánica. En ECUs modernas no basta con decir “es una EDC17” o “es una MD1”: dentro de una misma familia existen variantes con hardware, software y protocolos diferentes.',
        ],
        bullets: ['Archivo ORI correcto y sin renombrados confusos', 'Vehículo, motor y combustible', 'Referencia ECU, HW y SW cuando estén disponibles', 'Herramienta y método de lectura: OBD, Bench o Boot', 'DTC relevantes y estado mecánico del vehículo', 'Modificaciones de turbo, inyección, escape u otros elementos si afectan a la calibración'],
      },
      {
        title: 'Por qué un flujo centralizado es importante',
        paragraphs: [
          'Cuando archivos, mensajes y versiones se reparten entre correo, WhatsApp y carpetas locales es fácil perder contexto. Un flujo centralizado permite conservar el ORI, la solicitud, las revisiones, la conversación técnica y el MOD dentro del mismo pedido.',
          'AK Cloud está planteado precisamente con esa lógica: cada trabajo mantiene su trazabilidad y el profesional puede volver al pedido para identificar qué archivo se entregó y qué información se facilitó en origen.',
        ],
      },
      {
        title: 'Qué no puede resolver un File Service por sí solo',
        paragraphs: [
          'Una modificación de software no corrige una avería mecánica, una alimentación deficiente, una lectura corrupta ni un sensor defectuoso. Antes de pedir una calibración es responsabilidad del profesional comprobar que el vehículo y la ECU están en condiciones de ser diagnosticados, leídos, escritos y probados correctamente.',
          'La mejor relación entre taller y File Service aparece cuando ambos trabajan con información verificable. El taller controla el vehículo y la operación física; el File Service controla el tratamiento del archivo. Esa separación de responsabilidades reduce errores y hace el trabajo más repetible.',
        ],
      },
    ],
  },
  'como-preparar-archivo-ori': {
    title: 'Cómo preparar correctamente un archivo ORI',
    meta: 'Guía para preparar un archivo ORI antes de enviarlo a un File Service: HW, SW, ECU, método de lectura, diagnosis y comprobaciones esenciales.',
    kicker: 'BUENAS PRÁCTICAS · ARCHIVO ORI',
    intro: 'La calidad de una solicitud de File Service empieza antes de subir el archivo. Un ORI correcto no es únicamente un fichero con extensión .bin: debe corresponder a la ECU real del vehículo, estar obtenido mediante un método válido y llegar acompañado de la identificación técnica necesaria para trabajar con seguridad.',
    serviceHref: '/file-service-ecu',
    serviceLabel: 'Solicitar un archivo ECU',
    sections: [
      {
        title: 'Confirma que realmente es el original',
        paragraphs: [
          'Un error frecuente es presentar como original un archivo que ya ha sido modificado previamente. Si el vehículo ha pasado por otra reprogramación, una reparación o una actualización, conviene verificar el origen del fichero antes de utilizarlo como base.',
          'Trabajar sobre un supuesto ORI que contiene cambios previos puede dificultar la comparación, esconder modificaciones desconocidas y provocar que una nueva calibración parta de una base incorrecta. Si existe duda, indícala expresamente en la solicitud.',
        ],
      },
      {
        title: 'Identifica ECU, hardware y software',
        paragraphs: [
          'La familia de ECU es solo el primer nivel de identificación. Dos unidades Bosch EDC17, MD1 o MG1 pueden compartir aspecto o familia comercial y, sin embargo, utilizar hardware y software diferentes. Siempre que la herramienta los muestre, guarda los identificadores HW y SW junto con la referencia del fabricante.',
          'También es útil conservar una captura o informe de identificación. Esa información ayuda a relacionar el archivo con el vehículo correcto y permite detectar rápidamente inconsistencias entre lo que se ha leído y lo que se ha declarado en el pedido.',
        ],
      },
      {
        title: 'Anota cómo se obtuvo la lectura',
        paragraphs: [
          'OBD, Bench y Boot no describen lo mismo. Dependiendo de la ECU y de la herramienta, una lectura puede contener áreas distintas o estar virtualizada por el proveedor del equipo. Por eso el método de acceso forma parte de los datos del trabajo.',
          'Indicar la herramienta utilizada —por ejemplo KESS3, FLEX o AutoTuner— y el protocolo ayuda a interpretar correctamente el archivo y a planificar la escritura posterior.',
        ],
      },
      {
        title: 'Haz diagnosis antes de pedir la calibración',
        paragraphs: [
          'La diagnosis previa evita atribuir al software síntomas que proceden de una avería. Si el vehículo entra con falta de presión, problemas de inyección, fallos eléctricos o sensores fuera de rango, esos defectos deberían conocerse antes de modificar nada.',
        ],
        bullets: ['Lee y guarda DTC antes del trabajo', 'Comprueba tensión de batería y alimentación', 'Confirma que el motor está mecánicamente en condiciones', 'Documenta modificaciones de hardware', 'No borres información relevante solo para “dejar limpio” el vehículo'],
      },
      {
        title: 'Nombra y conserva los archivos con orden',
        paragraphs: [
          'Un nombre que incluya vehículo, ECU y fecha facilita mucho la trazabilidad. Conserva siempre una copia intacta del ORI y no la sobrescribas con el MOD. El archivo modificado debería identificarse como una versión distinta y quedar asociado al pedido donde se generó.',
          'AK Cloud mantiene ORI, solicitud y MOD dentro del mismo flujo para reducir precisamente los errores de versión y de intercambio de archivos entre trabajos distintos.',
        ],
      },
    ],
  },
  'obd-vs-bench-vs-boot': {
    title: 'OBD vs Bench vs Boot para leer una ECU',
    meta: 'Diferencias entre OBD, Bench y Boot al leer y escribir ECUs: acceso, desmontaje, contenido de lectura y qué debe saber un taller antes del File Service.',
    kicker: 'LECTURA ECU · OBD / BENCH / BOOT',
    intro: 'OBD, Bench y Boot son formas diferentes de acceder a una unidad de control. Ninguna es “siempre mejor” que las otras: la elección depende de la ECU, del protocolo disponible, del estado de la unidad, de la herramienta y del trabajo que se vaya a realizar. Para un File Service, conocer el método utilizado ayuda a interpretar correctamente el archivo recibido.',
    serviceHref: '/file-service-ecu',
    serviceLabel: 'Ver File Service profesional',
    sections: [
      {
        title: 'Lectura por OBD',
        paragraphs: [
          'La lectura OBD se realiza a través del conector de diagnosis del vehículo cuando la ECU y la herramienta lo permiten. Es cómoda porque normalmente no requiere desmontar la unidad y reduce la intervención física sobre el vehículo.',
          'Sin embargo, “lectura OBD” no significa que siempre se obtenga exactamente el mismo contenido. Algunas herramientas realizan lecturas virtuales, otras acceden a zonas concretas y el comportamiento cambia según protocolo y ECU. El profesional debe saber qué tipo de archivo ha generado su equipo.',
        ],
      },
      {
        title: 'Acceso en Bench',
        paragraphs: [
          'Bench implica trabajar directamente sobre la ECU fuera de su comunicación normal con el vehículo, conectando alimentación y líneas de datos según el pinout o adaptador previsto. Suele requerir desmontar la unidad, aunque no necesariamente abrirla.',
          'Este método puede ofrecer acceso cuando OBD no está disponible y resulta habitual en muchas ECUs modernas. La estabilidad de alimentación y la conexión correcta son esenciales; un error de pinout o de fuente puede dañar la unidad.',
        ],
      },
      {
        title: 'Acceso en Boot',
        paragraphs: [
          'Boot suele implicar un acceso de nivel más bajo al microcontrolador o a la memoria y, en muchos casos, requiere abrir la ECU y trabajar sobre puntos específicos de la placa. Puede utilizarse para lecturas completas, recuperación o situaciones donde otros métodos no son posibles.',
          'Precisamente porque la intervención es mayor, exige más cuidado: protección ESD, alimentación estable, puntos de conexión correctos y respeto absoluto por el procedimiento de la herramienta.',
        ],
      },
      {
        title: 'Qué información debe llegar al File Service',
        paragraphs: [
          'El mismo nombre de ECU puede producir archivos diferentes según la herramienta y el protocolo. Por eso, junto al ORI, conviene indicar cómo se obtuvo. Esta información ayuda a distinguir una lectura real de una virtual, una zona de calibración de una lectura completa y a evitar comparaciones incorrectas.',
        ],
        bullets: ['Herramienta utilizada', 'Protocolo o modo de acceso', 'OBD, Bench o Boot', 'Identificación HW/SW', 'Tamaño del archivo', 'Si la lectura fue real, virtual o reconstruida por la herramienta'],
      },
      {
        title: 'El método de lectura no sustituye la verificación',
        paragraphs: [
          'Que una herramienta permita leer una ECU no significa que cualquier archivo sea automáticamente válido para cualquier operación. Antes de escribir el MOD, el taller debe confirmar que el archivo entregado corresponde al mismo trabajo y que la herramienta admite una escritura segura mediante el protocolo elegido.',
        ],
      },
    ],
  },
  'stage-1-vs-stage-2-vs-stage-3': {
    title: 'Stage 1 vs Stage 2 vs Stage 3: diferencias',
    meta: 'Diferencias entre Stage 1, Stage 2 y Stage 3 en una reprogramación ECU y qué debe revisar un taller antes de solicitar cada nivel de calibración.',
    kicker: 'CALIBRACIÓN · STAGE 1 / 2 / 3',
    intro: 'Stage 1, Stage 2 y Stage 3 son etiquetas utilizadas para describir niveles de preparación, pero no son una norma técnica universal. El significado exacto cambia según vehículo, motor, hardware instalado y criterio del calibrador. Por eso una solicitud profesional debería describir el coche real y no limitarse a escribir únicamente “quiero Stage 2”.',
    serviceHref: '/stage-1-file-service',
    serviceLabel: 'Ver Stage 1 File Service',
    sections: [
      {
        title: 'Qué suele entenderse por Stage 1',
        paragraphs: [
          'Stage 1 suele referirse a una calibración orientada a un vehículo con configuración mecánica cercana a serie. El objetivo habitual es optimizar parámetros dentro de un margen compatible con el hardware original y el estado real del motor.',
          'Eso no significa que todos los vehículos puedan recibir el mismo incremento. Turbo, inyección, transmisión, combustible, temperatura, mantenimiento y tolerancias del conjunto condicionan el resultado.',
        ],
      },
      {
        title: 'Qué suele cambiar en Stage 2',
        paragraphs: [
          'Stage 2 suele asociarse a vehículos con determinadas modificaciones de hardware y a una calibración adaptada a ellas. El problema es que el nombre por sí solo no dice qué piezas tiene el coche. Dos talleres pueden llamar Stage 2 a configuraciones completamente diferentes.',
          'Por eso es necesario informar de admisión, escape, intercooler, turbo, inyectores, combustible y cualquier otro cambio que influya en los límites o en el modelo de par.',
        ],
      },
      {
        title: 'Stage 3 exige todavía más contexto',
        paragraphs: [
          'En preparaciones de mayor alcance, el software depende directamente del hardware instalado. Un turbo distinto, cambios de inyección o modificaciones internas del motor convierten la calibración en un trabajo específico. En este escenario no tiene sentido tratar el archivo como una receta genérica.',
        ],
      },
      {
        title: 'Datos que deberían acompañar la solicitud',
        paragraphs: [
          'Una solicitud bien documentada permite definir mejor el alcance y evita expectativas basadas únicamente en una etiqueta comercial.',
        ],
        bullets: ['Motor y versión exacta', 'ECU, HW y SW', 'Combustible utilizado', 'Modificaciones de admisión y escape', 'Turbo e inyección si no son originales', 'Tipo de transmisión', 'DTC o incidencias existentes', 'Objetivo de uso: calle, carga, circuito u otra aplicación'],
      },
      {
        title: 'Primero fiabilidad, después cifra',
        paragraphs: [
          'Una calibración responsable parte de los límites del conjunto. Antes de perseguir una cifra de potencia, el taller debe comprobar que el vehículo puede soportar el trabajo y que no existen problemas previos. Un File Service necesita datos reales para adaptar la solicitud a la configuración descrita.',
          'AK Cloud centraliza esa información dentro del pedido para que el archivo, el contexto técnico y las revisiones permanezcan asociados al mismo vehículo y trabajo.',
        ],
      },
    ],
  },
  'errores-al-enviar-archivos-file-service': {
    title: 'Errores al enviar archivos a un File Service',
    meta: 'Errores frecuentes al solicitar archivos ECU: ORI incorrectos, referencias incompletas, diagnosis insuficiente, lecturas dudosas y mala gestión de versiones.',
    kicker: 'CONTROL DE CALIDAD · FILE SERVICE',
    intro: 'Muchos problemas en un File Service no empiezan en la calibración, sino en la información que acompaña al archivo. Un ORI equivocado, una referencia incompleta o un vehículo con una avería previa pueden convertir una solicitud sencilla en un diagnóstico confuso. Estos son los errores que más conviene evitar antes de subir un trabajo.',
    serviceHref: '/file-service-ecu',
    serviceLabel: 'Abrir ECU File Service',
    sections: [
      {
        title: '1. Enviar un archivo modificado como si fuera ORI',
        paragraphs: [
          'Si el vehículo ya fue reprogramado y el archivo se presenta como original, el File Service puede partir de una base que contiene cambios desconocidos. Esto dificulta comparar versiones y evaluar correctamente qué debe mantenerse o rehacerse.',
          'Cuando no se conoce el historial del coche, es mejor indicarlo. La transparencia técnica es más útil que intentar presentar un archivo dudoso como completamente original.',
        ],
      },
      {
        title: '2. Indicar solo la familia de ECU',
        paragraphs: [
          '“EDC17”, “MD1” o “MG1” no identifican una unidad de forma suficiente. Existen numerosas variantes y revisiones. Siempre que sea posible, acompaña el archivo con referencia, hardware, software, vehículo y motor.',
        ],
      },
      {
        title: '3. No decir cómo se realizó la lectura',
        paragraphs: [
          'La herramienta y el protocolo importan. Un archivo obtenido por OBD virtual no debe tratarse automáticamente como si fuera una lectura completa en Bench o Boot. Informar del método ayuda a interpretar tamaño, contenido y estrategia de escritura.',
        ],
      },
      {
        title: '4. Confundir una avería con un problema de calibración',
        paragraphs: [
          'Un coche que falla antes de modificarlo seguirá teniendo un problema después si la causa es mecánica o eléctrica. Presión de combustible, sensores, fugas, alimentación, cableado o actuadores deben diagnosticarse antes de responsabilizar al software.',
          'Conservar los DTC previos y describir el síntoma evita que el File Service trabaje sin contexto.',
        ],
      },
      {
        title: '5. Mezclar versiones y sobrescribir archivos',
        paragraphs: [
          'Guardar ORI y MOD con el mismo nombre o moverlos entre carpetas sin identificar el pedido es una fuente clásica de errores. Cada archivo debería poder relacionarse con un vehículo, fecha y versión concreta.',
          'Un sistema centralizado reduce este riesgo. En AK Cloud, el archivo original, la solicitud, la comunicación y el MOD permanecen asociados al mismo trabajo, facilitando revisar qué se entregó y por qué.',
        ],
      },
      {
        title: 'Checklist antes de enviar',
        paragraphs: ['Antes de crear el pedido, una comprobación de un minuto puede ahorrar mucho tiempo después.'],
        bullets: ['¿El ORI corresponde a este vehículo?', '¿Sé si el archivo ya fue modificado?', '¿Tengo HW y SW?', '¿He anotado herramienta y método de lectura?', '¿He leído DTC?', '¿He descrito cambios mecánicos?', '¿Conservo una copia intacta del original?'],
      },
    ],
  },
}

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(guides).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const guide = guides[slug]
  if (!guide) return {}
  const url = `/guias/${slug}`
  return {
    title: guide.title,
    description: guide.meta,
    alternates: { canonical: url },
    openGraph: { type: 'article', title: `${guide.title} | AK Cloud`, description: guide.meta, url },
    twitter: { card: 'summary_large_image', title: `${guide.title} | AK Cloud`, description: guide.meta },
  }
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = guides[slug]
  if (!guide) notFound()

  const canonical = `https://www.akcloud.es/guias/${slug}`
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: guide.title,
    description: guide.meta,
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
      { '@type': 'ListItem', position: 3, name: guide.title, item: canonical },
    ],
  }
  const related = Object.entries(guides).filter(([key]) => key !== slug).slice(0, 3)

  return (
    <main className="ak-v5-bg min-h-screen text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <header className="ak-v5-topbar sticky top-0 z-50">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/guias" className="flex items-center gap-2 text-xs font-bold text-white/55 transition hover:text-white"><ArrowLeft size={15}/> Todas las guías</Link>
          <Link href="/file-service-ecu" className="ak-v5-button-secondary !px-4 !py-2.5 text-xs">ECU File Service</Link>
        </div>
      </header>

      <article className="mx-auto max-w-[960px] px-5 py-20 lg:px-8">
        <div className="ak-v5-pill inline-flex"><BookOpen size={14}/> {guide.kicker}</div>
        <h1 className="ak-v5-title mt-7 text-4xl sm:text-6xl">{guide.title}</h1>
        <p className="mt-7 text-lg leading-8 text-white/55">{guide.intro}</p>
        <div className="mt-8 flex flex-wrap gap-3 text-xs font-bold text-white/35">
          <span>Actualizado: 25/08/2026</span><span>•</span><span>Lectura profesional</span><span>•</span><span>AK Cloud</span>
        </div>

        <div className="mt-14 space-y-10">
          {guide.sections.map((section) => (
            <section key={section.title} className="ak-v5-card p-7 sm:p-9">
              <h2 className="text-2xl font-black sm:text-3xl">{section.title}</h2>
              <div className="mt-5 space-y-4">
                {section.paragraphs.map((p) => <p key={p} className="leading-8 text-white/50">{p}</p>)}
              </div>
              {section.bullets && (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {section.bullets.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-white/55"><CheckCircle2 size={17} className="mt-1 shrink-0 text-[#67e8d1]"/><span>{item}</span></li>)}
                </ul>
              )}
            </section>
          ))}
        </div>

        <section className="mt-12 rounded-[28px] border border-[#ff425a]/20 bg-[#ff425a]/[.06] p-8 sm:p-10">
          <div className="ak-v5-kicker">Aplicación práctica</div>
          <h2 className="ak-v5-title mt-4 text-3xl">¿Ya tienes identificado el vehículo y el ORI?</h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/50">Utiliza AK Cloud para centralizar el archivo original, la información técnica, el servicio solicitado, el soporte y la entrega del MOD dentro del mismo pedido.</p>
          <Link href={guide.serviceHref} className="ak-v5-button mt-7">{guide.serviceLabel} <ArrowRight size={17}/></Link>
        </section>

        <section className="mt-14">
          <div className="ak-v5-kicker">Sigue aprendiendo</div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {related.map(([relatedSlug, item]) => (
              <Link key={relatedSlug} href={`/guias/${relatedSlug}`} className="ak-v5-card group p-6 transition hover:border-white/20">
                <h2 className="text-lg font-black">{item.title}</h2>
                <div className="mt-5 flex items-center gap-2 text-xs font-black text-[#ff425a]">Leer guía <ArrowRight size={14} className="transition group-hover:translate-x-1"/></div>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </main>
  )
}
