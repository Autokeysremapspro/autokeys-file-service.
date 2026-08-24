'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthCard, { AuthButton } from '@/components/auth/AuthCard'
import { AuthInput } from '@/components/auth/AuthInput'

const PASSWORD_RESET_URL = 'https://www.akcloud.es/restablecer-contrasena'

export default function LoginClient() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (params.get('confirmado') === '1') {
      toast.success('Email confirmado correctamente. Tu solicitud está pendiente de aprobación.')
    } else if (params.get('confirmacion_error') === '1') {
      toast.error('El enlace de confirmación no es válido o ha caducado. Solicita uno nuevo si lo necesitas.')
    } else if (params.get('recovery_error') === '1') {
      toast.error('El enlace de recuperación no es válido o ha caducado. Solicita uno nuevo.')
    }

    // Compatibilidad con enlaces de recuperación antiguos que puedan seguir
    // llegando a /login con el token en el hash.
    if (window.location.hash.includes('type=recovery')) {
      window.location.replace(`/restablecer-contrasena${window.location.hash}`)
      return
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        window.location.replace('/restablecer-contrasena')
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { toast.error(error.message); return }

    const requested = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('next') || '/dashboard'
      : '/dashboard'
    const safeNext = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/dashboard'
    toast.success('Acceso correcto')
    router.replace(safeNext)
  }

  async function recuperarContrasena() {
    if (!email) { toast.error('Escribe primero tu email arriba, para saber a quién mandarlo'); return }
    setSendingReset(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: PASSWORD_RESET_URL })
    setSendingReset(false)
    if (error) { toast.error(error.message); return }
    toast.success(`Te hemos enviado un email a ${email} para restablecer tu contraseña.`)
  }

  function oauthProximamente(provider: string) {
    toast(`El acceso con ${provider} todavía no está disponible. Usa tu email y contraseña.`)
  }

  return (
    <AuthLayout>
      <AuthCard>
        <h2 className="text-[28px] font-bold text-white">Iniciar sesión</h2>
        <p className="mt-2 text-[15px] text-[#92939a]">Accede a tu cuenta de AK Cloud</p>

        <form onSubmit={login} className="mt-8 space-y-5">
          <AuthInput
            icon={Mail}
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            autoComplete="email"
          />
          <AuthInput
            icon={Lock}
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            autoComplete="current-password"
            rightSlot={
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-[#85868c] transition hover:text-white" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          <div className="flex justify-end text-sm">
            <button type="button" disabled={sendingReset} onClick={recuperarContrasena} className="font-medium text-[#ef1018] transition hover:text-[#ff1c25] disabled:opacity-60">
              {sendingReset ? 'Enviando...' : '¿Olvidaste tu contraseña?'}
            </button>
          </div>

          <AuthButton type="submit" loading={loading}>
            {loading ? 'Verificando...' : 'Iniciar sesión'} <ArrowRight size={19} />
          </AuthButton>
        </form>

        <div className="my-7 flex items-center gap-4 text-xs text-[#85868c]">
          <span className="h-px flex-1 bg-white/[.1]" /> o continúa con <span className="h-px flex-1 bg-white/[.1]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => oauthProximamente('Google')} className="flex h-[50px] items-center justify-center gap-2 rounded-lg border border-white/[.13] bg-[#0e1013] text-sm font-medium text-white/85 transition hover:border-white/25">
            <GoogleIcon /> Google
          </button>
          <button type="button" onClick={() => oauthProximamente('Microsoft')} className="flex h-[50px] items-center justify-center gap-2 rounded-lg border border-white/[.13] bg-[#0e1013] text-sm font-medium text-white/85 transition hover:border-white/25">
            <MicrosoftIcon /> Microsoft
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-[#92939a]">
          ¿No tienes cuenta? <Link href="/register" className="font-medium text-[#ef1018] transition hover:text-[#ff1c25]">Solicitar cuenta</Link>
        </p>
      </AuthCard>
    </AuthLayout>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.66-.22-2.44H12v4.62h6.47c-.28 1.5-1.13 2.77-2.41 3.62v3.01h3.9c2.28-2.1 3.56-5.2 3.56-8.81z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.9-3.01c-1.08.73-2.46 1.16-4.05 1.16-3.11 0-5.75-2.1-6.69-4.92H1.28v3.1C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.31 14.31A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.58.4-2.31v-3.1H1.28A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.28 5.41l4.03-3.1z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.59l4.03 3.1C6.25 6.87 8.89 4.77 12 4.77z" />
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 23 23" aria-hidden="true">
      <path fill="#f35325" d="M1 1h10v10H1z" />
      <path fill="#81bc06" d="M12 1h10v10H12z" />
      <path fill="#05a6f0" d="M1 12h10v10H1z" />
      <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
  )
}
