import type { Metadata } from 'next'
import LoginClient from './LoginClient'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description: 'Accede a tu cuenta profesional de AK Cloud, el portal de File Service para talleres y distribuidores de Autokeys Remaps Pro.',
  alternates: { canonical: '/login' },
  robots: { index: false, follow: true },
  openGraph: {
    type: 'website',
    title: 'Iniciar sesión | AK Cloud',
    description: 'Accede a tu cuenta profesional de AK Cloud, el portal de File Service para talleres y distribuidores.',
    url: '/login',
  },
}

export default function LoginPage() {
  return <LoginClient />
}
