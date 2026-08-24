import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Política de privacidad y protección de datos de AK Cloud by Autokeys Remaps Pro.',
  alternates: { canonical: '/legal/privacidad' },
  robots: { index: false, follow: true },
}

export default function PrivacidadLayout({ children }: { children: React.ReactNode }) {
  return children
}
