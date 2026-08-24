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
  'diesel-ecu-tuning-files',
  'ecu-remap-files',
  'performance-tuning-files',
  'petrol-tuning-files',
  'stage-1-tuning-files',
  'stage-2-tuning-files',
  'stage-3-tuning-files',
  'tuning-files-online',
]

function entry(path: string, priority: number): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    changeFrequency: 'weekly',
    priority,
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const tuningLandings: MetadataRoute.Sitemap = EN_TUNING_TOPICS.map((topic) =>
    entry(`/en/ecu-file-service/${topic}`, 0.78),
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
    entry('/en/ecu-file-service', 0.95),
    entry('/en/stage-1-file-service', 0.9),
    entry('/en/ecu-file-service/edc17', 0.85),
    entry('/en/ecu-file-service/md1', 0.85),
    entry('/en/ecu-file-service/mg1', 0.85),
    entry('/en/ecu-file-service/autotuner', 0.8),
    entry('/en/ecu-file-service/remote', 0.8),
    entry('/en/ecu-file-service/tuners', 0.8),
    entry('/en/ecu-file-service/workshops', 0.8),
    entry('/en/ecu-file-service/custom-tuning', 0.8),
    entry('/en/ecu-file-service/performance-tuning', 0.8),
    entry('/en/ecu-file-service/stage-2', 0.8),
    entry('/en/ecu-file-service/stage-3', 0.8),
    entry('/en/file-service-tools/kess3', 0.8),
    entry('/en/file-service-tools/flex', 0.8),
    ...tuningLandings,
  ]
}
