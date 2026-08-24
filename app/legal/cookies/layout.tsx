import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de cookies',
  description: 'Política de cookies y tecnologías necesarias para el funcionamiento de AK Cloud.',
  alternates: { canonical: '/legal/cookies' },
  robots: { index: false, follow: true },
}

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return children
}
