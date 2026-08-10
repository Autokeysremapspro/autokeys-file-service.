import type { MetadataRoute } from 'next'

const SITE_URL = 'https://akcloud.es'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const commercialEn = [
    'car-tuning', 'chiptuning', 'custom-tuning-files', 'diesel-ecu-tuning-files',
    'diesel-tuning', 'ecu-calibration', 'ecu-remap-files', 'ecu-remap', 'garages',
    'online-tuning', 'performance-tuning-files', 'petrol-tuning-files', 'petrol-tuning',
    'professional-remapping', 'remap-files-for-tuners', 'remapping-files',
    'stage-1-tuning-files', 'stage-2-tuning-files', 'stage-3-tuning-files',
    'tuning-file-provider', 'tuning-file-supplier', 'tuning-files-online',
    'tuning-files', 'tuning-for-tuners', 'turbo-diesel-tuning', 'turbo-petrol-tuning',
  ]

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/file-service-ecu`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${SITE_URL}/stage-1-file-service`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/ecu-file-service/edc17`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/ecu-file-service/md1`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/ecu-file-service/mg1`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/file-service-herramientas/kess3`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/file-service-herramientas/flex`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/file-service-herramientas/autotuner`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/en/ecu-file-service`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${SITE_URL}/en/stage-1-file-service`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/en/ecu-file-service/edc17`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/en/ecu-file-service/md1`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/en/ecu-file-service/mg1`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/en/ecu-file-service/autotuner`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/en/ecu-file-service/remote`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/en/ecu-file-service/tuners`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/en/ecu-file-service/workshops`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/en/ecu-file-service/custom-tuning`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/en/ecu-file-service/performance-tuning`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/en/ecu-file-service/stage-2`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/en/ecu-file-service/stage-3`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ...commercialEn.map((slug) => ({ url: `${SITE_URL}/en/ecu-file-service/${slug}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.75 })),
    { url: `${SITE_URL}/en/file-service-tools/kess3`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/en/file-service-tools/flex`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/legal/terminos`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/legal/privacidad`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/legal/aviso-legal`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/legal/cookies`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
