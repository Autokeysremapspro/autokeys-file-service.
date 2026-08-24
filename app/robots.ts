import type { MetadataRoute } from 'next'

const SITE_URL = 'https://www.akcloud.es'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/login',
          '/register',
          '/legal',
          '/embed',
          '/file-service-ecu',
          '/stage-1-file-service',
          '/ecu-file-service',
          '/file-service-herramientas',
          '/en',
        ],
        disallow: [
          '/dashboard',
          '/nuevo-pedido',
          '/pedidos',
          '/garage',
          '/biblioteca',
          '/soporte',
          '/admin',
          '/ak-cloud',
          '/analitica',
          '/intelligence',
          '/descargas',
          '/notificaciones',
          '/perfil',
          '/pendiente-aprobacion',
          '/restablecer-contrasena',
          '/paypal',
          '/sumup',
          '/auth',
          '/api',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
