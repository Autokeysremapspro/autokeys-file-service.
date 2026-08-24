import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aviso legal',
  description: 'Aviso legal y datos del titular de AK Cloud by Autokeys Remaps Pro.',
  alternates: { canonical: '/legal/aviso-legal' },
  robots: { index: false, follow: true },
}

export default function AvisoLegalLayout({ children }: { children: React.ReactNode }) {
  return children
}
