import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Información legal',
  description: 'Información legal, privacidad, cookies y condiciones de uso de AK Cloud by Autokeys Remaps Pro.',
  robots: { index: false, follow: true },
}

export default function LegalSectionLayout({ children }: { children: React.ReactNode }) {
  return children
}
