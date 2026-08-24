import type { MetadataRoute } from 'next'

const SITE_URL = 'https://www.akcloud.es'

const EN_TUNING_TOPICS = [
  'diesel-tuning',
  'petrol-tuning',
  'turbo-diesel-tuning',
  'turbo-petrol-tuning',
  'chiptuning',
  'ecu-remap',
  'online-tuning',
  'tuning-files',
  'car-tuning',
  'remapping-files',
  'professional-remapping',
  'tuning-for-tuners',
  'ecu-calibration',
  'garages',
  'tuning-file-provider',
  'tuning-file-supplier',
  'remap-files-for-tuners',
  'custom-tuning-files',
]

const ES_GUIDES = [
  'que-es-ecu-file-service',
  'como-preparar-archivo-ori',
  'obd-vs-bench-vs-boot',
  'stage-1-vs-stage-2-vs-stage-3',
  'errores-al-enviar-archivos-file-service',
]

const ES_TECH_GUIDES = ['edc17', 'md1', 'mg1', 'kess3', 'flex', 'autotuner']

function entry(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'weekly'): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const tuningLandings: MetadataRoute.Sitemap = EN_TUNING_TOPICS.map((topic) =>
    entry(`/en/ecu-file-service/${topic}`, 0.78),
  )
  const guides: MetadataRoute.Sitemap = ES_GUIDES.map((slug) =>
    entry(`/guias/${slug}`, 0.82, 'monthly'),
  )
  const technicalGuides: MetadataRoute.Sitemap = ES_TECH_GUIDES.map((slug) =>
    entry(`/guias/file-service/${slug}`, 0.82, 'monthly'),
  )

  return [
    entry('/', 1),
    entry('/file-service-ecu', 0.95),
    entry('/stage-1-file-service', 0.9),
    entry('/ecu-file-service/edc17', 0.85),
    entry('/ecu-file-service/md1', 0.85),
    entry('/ecu-file-service/mg1', 0.85),
    entry('/file-service-herramientas/kess3', 0.8),
    entry('/file-service-herramientas/flex', 0.8),
    entry('/file-service-herramientas/autotuner', 0.8),
    entry('/guias', 0.86, 'weekly'),
    ...guides,
    ...technicalGuides,
    entry('/en/ecu-file-service', 0.95),
    entry('/en/stage-1-file-service', 0.9),
    entry('/en/ecu-file-service/edc17', 0.85),
    entry('/en/ecu-file-service/md1', 0.85),
    entry('/en/ecu-file-service/mg1', 0.85),
    entry('/en/file-service-tools/kess3', 0.8),
    entry('/en/file-service-tools/flex', 0.8),
    ...tuningLandings,
  ]
}
