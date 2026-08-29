import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono, Inter } from 'next/font/google'
import './globals.css'
import './titan-v5.css'
import './phase2-responsive.css'
import { Toaster } from 'react-hot-toast'
import HomePricingPortal from '@/components/landing/HomePricingPortal'

const display = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-display' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-mono' })
const body = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' })

const SITE_URL = 'https://www.akcloud.es'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'File Service ECU Profesional para Talleres | AK Cloud',
    template: '%s | AK Cloud',
  },
  description:
    'File Service ECU online para talleres y profesionales. Stage 1 y Stage 2, soluciones ECU, IMMO, Airbag, TCU y MD1/MG1 con soporte técnico y tarifas desde 29,90 €.',
  keywords: [
    'file service ECU',
    'ECU file service',
    'file service España',
    'tuning files',
    'ECU tuning files',
    'archivos ECU online',
    'Stage 1 file service',
    'Stage 2 file service',
    'IMMO file service',
    'MD1 MG1 file service',
    'TCU tuning files',
    'airbag crash data reset',
    'file service talleres',
    'Autokeys Remaps Pro',
    'AK Cloud',
  ],
  authors: [{ name: 'Autokeys Remaps Pro' }],
  creator: 'Autokeys Remaps Pro',
  publisher: 'Autokeys Remaps Pro',
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
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
    url: '/',
    siteName: 'AK Cloud',
    title: 'File Service ECU Profesional para Talleres | AK Cloud',
    description:
      'Plataforma profesional de archivos ECU: Stage 1/2, IMMO, Airbag, TCU, MD1/MG1 y soluciones ECU con soporte técnico de Autokeys Remaps Pro.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AK Cloud by Autokeys Remaps Pro — File Service ECU profesional' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'File Service ECU Profesional para Talleres | AK Cloud',
    description: 'Archivos ECU profesionales para talleres: Stage 1/2, IMMO, Airbag, TCU y MD1/MG1 con soporte técnico.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${mono.variable} ${body.variable}`}>
      <body>
        <Toaster position="top-right" />
        {children}
        <HomePricingPortal />
      </body>
    </html>
  )
}
