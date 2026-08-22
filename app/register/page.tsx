import type { Metadata } from 'next'
import RegisterClient from './RegisterClient'

export const metadata: Metadata = {
  title: 'Solicitar cuenta',
  description: 'Solicita acceso profesional a AK Cloud, el portal de File Service de Autokeys Remaps Pro para talleres y distribuidores. Alta revisada por nuestro equipo.',
  alternates: { canonical: '/register' },
  openGraph: {
    type: 'website',
    title: 'Solicitar cuenta | AK Cloud',
    description: 'Solicita acceso profesional a AK Cloud, el portal de File Service de Autokeys Remaps Pro para talleres y distribuidores.',
    url: '/register',
  },
}

export default function RegisterPage() {
  return <RegisterClient />
}
