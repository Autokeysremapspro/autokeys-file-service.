import type { MetadataRoute } from 'next'

const SITE_URL = 'https://www.akcloud.es'

const ES_GUIDES = [
  'que-es-ecu-file-service',
  'como-preparar-archivo-ori',
  'obd-vs-bench-vs-boot',
  'stage-1-vs-stage-2-vs-stage-3',
  'errores-al-enviar-archivos-file-service',
]

const ES_TECH_GUIDES = ['edc17', 'md1', 'mg1', 'kess3', 'flex', 'autotuner']

const EN_COMMERCIAL = [
  '/en/ecu-file-service',
  '/en/stage-1-file-service',
  '/en/ecu-file-service/stage-2',
  '/en/ecu-file-service/stage-3',
  '/en/ecu-file-service/edc17',
  '/en/ecu-file-service/md1',
  '/en/ecu-file-service/mg1',
  '/en/ecu-file-service/diesel-ecu-tuning-files',
  '/en/ecu-file-service/petrol-tuning-files',
  '/en/ecu-file-service/performance-tuning',
  '/en/ecu-file-service/custom-tuning',
  '/en/ecu-file-service/remote',
  '/en/ecu-file-service/tuning-files-online',
  '/en/ecu-file-service/workshops',
  '/en/ecu-file-service/tuners',
  '/en/ecu-file-service/autotuner',
  '/en/file-service-tools/kess3',
  '/en/file-service-tools/flex',
]

function entry(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'weekly'): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const guides: MetadataRoute.Sitemap = ES_GUIDES.map((slug) =>
    entry(`/guias/${slug}`, 0.78, 'monthly'),
  )
  const technicalGuides: MetadataRoute.Sitemap = ES_TECH_GUIDES.map((slug) =>
    entry(`/guias/file-service/${slug}`, 0.8, 'monthly'),
  )
  const englishCommercial: MetadataRoute.Sitemap = EN_COMMERCIAL.map((path) =>
    entry(path, path === '/en/ecu-file-service' ? 0.95 : 0.84),
  )

  return [
    entry('/', 1),
    entry('/file-service-ecu', 0.98),
    entry('/stage-1-file-service', 0.93),
    entry('/file-service-tcu', 0.9),
    entry('/immo-file-service', 0.9),
    entry('/airbag-crash-data-file-service', 0.88),
    entry('/ecu-file-service/edc17', 0.9),
    entry('/ecu-file-service/md1', 0.9),
    entry('/ecu-file-service/mg1', 0.9),
    entry('/file-service-herramientas/kess3', 0.84),
    entry('/file-service-herramientas/flex', 0.84),
    entry('/file-service-herramientas/autotuner', 0.84),
    entry('/guias', 0.82, 'weekly'),
    ...guides,
    ...technicalGuides,
    ...englishCommercial,
  ]
}
