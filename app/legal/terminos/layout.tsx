import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description: 'Términos y condiciones de uso del servicio profesional AK Cloud by Autokeys Remaps Pro.',
  alternates: { canonical: '/legal/terminos' },
  robots: { index: false, follow: true },
}

export default function TerminosLayout({ children }: { children: React.ReactNode }) {
  return children
}
