import type { Metadata } from 'next'
import RegisterClient from './RegisterClient'

export const metadata: Metadata = {
  title: 'Crear cuenta profesional',
  description: 'Crea tu cuenta profesional en AK Cloud y accede al portal de File Service de Autokeys Remaps Pro tras confirmar tu email.',
  alternates: { canonical: '/register' },
  openGraph: {
    type: 'website',
    title: 'Crear cuenta profesional | AK Cloud',
    description: 'Registro profesional con acceso inmediato tras confirmar el email.',
    url: '/register',
  },
}

export default function RegisterPage() {
  return <RegisterClient />
}
