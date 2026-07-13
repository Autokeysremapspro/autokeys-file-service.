import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/register', '/legal', '/embed'],
        disallow: [
          '/dashboard',
          '/nuevo-pedido',
          '/pedidos',
          '/garage',
          '/biblioteca',
          '/soporte',
          '/creditos',
          '/comprar-creditos',
          '/admin',
          '/pendiente-aprobacion',
          '/restablecer-contrasena',
          '/paypal',
          '/api',
        ],
      },
    ],
    sitemap: 'https://akcloud.es/sitemap.xml',
  }
}
