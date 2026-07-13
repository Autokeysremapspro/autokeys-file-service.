import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const SITE_URL = 'https://akcloud.es'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'AK Cloud — Reprogramación ECU para talleres y distribuidores | Autokeys',
    template: '%s | AK Cloud',
  },
  description:
    'Portal profesional de Autokeys Remaps Pro para talleres y distribuidores: Stage 1, Stage 2, EGR/DPF/AdBlue OFF y más soluciones ECU. Sube tu archivo, nosotros lo optimizamos — pago seguro y seguimiento en tiempo real.',
  keywords: [
    'reprogramación ECU',
    'remap online',
    'Stage 1',
    'Stage 2',
    'EGR OFF',
    'DPF OFF',
    'AdBlue OFF',
    'archivo ECU',
    'portal distribuidores tuning',
    'Autokeys',
    'AK Cloud',
    'file service ECU',
  ],
  authors: [{ name: 'Autokeys Remaps Pro' }],
  alternates: { canonical: SITE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/favicon-180.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: SITE_URL,
    siteName: 'AK Cloud',
    title: 'AK Cloud — Reprogramación ECU para talleres y distribuidores',
    description:
      'Stage 1, Stage 2, EGR/DPF/AdBlue OFF y más soluciones ECU profesionales. Sube tu archivo, nosotros lo optimizamos.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AK Cloud — Autokeys Remaps Pro' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AK Cloud — Reprogramación ECU para talleres y distribuidores',
    description: 'Stage 1, Stage 2, EGR/DPF/AdBlue OFF y más soluciones ECU profesionales.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  )
}
