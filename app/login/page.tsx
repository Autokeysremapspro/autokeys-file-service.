'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[url('/akcloud/login-racing-reference.png')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-black/5" />

      <section className="relative z-10 min-h-screen">
        <form
          onSubmit={login}
          className="login-hitbox absolute right-[8.25%] top-[9.1%] h-[81.1%] w-[32.85%] min-w-[420px]"
          aria-label="Iniciar sesión en AK Cloud"
        >
          <label className="sr-only" htmlFor="email">
            Usuario o email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="ak-input absolute left-[8.2%] top-[31.8%] h-[7.1%] w-[75.8%]"
          />

          <label className="sr-only" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="ak-input absolute left-[8.2%] top-[47.15%] h-[7.1%] w-[75.8%]"
          />

          <button
            type="button"
            onClick={() => setRemember((value) => !value)}
            className="absolute left-[7.9%] top-[59.4%] h-[4.2%] w-[33%] cursor-pointer bg-transparent"
            aria-pressed={remember}
            aria-label="Recordar mi sesión"
          />

          <button
            type="button"
            onClick={() => toast('Recuperación de contraseña pendiente de activar')}
            className="absolute right-[7.3%] top-[60.15%] h-[3.4%] w-[29%] cursor-pointer bg-transparent"
            aria-label="Olvidaste tu contraseña"
          />

          <button
            type="submit"
            disabled={loading}
            className="absolute left-[8.2%] top-[67.4%] h-[8.4%] w-[83.7%] cursor-pointer rounded-[13px] bg-transparent text-transparent disabled:cursor-wait"
            aria-label="Acceder al portal"
          >
            {loading ? 'Entrando...' : 'Acceder al portal'}
          </button>

          <button
            type="button"
            onClick={() => toast('Acceso con PayPal reservado para futuras versiones')}
            className="absolute left-[8.2%] top-[84.7%] h-[7.2%] w-[83.7%] cursor-pointer rounded-[13px] bg-transparent text-transparent"
            aria-label="Acceder con PayPal"
          >
            Acceder con PayPal
          </button>

          <button
            type="button"
            onClick={() => router.push('/register')}
            className="absolute left-[44.5%] top-[96.7%] h-[3%] w-[25%] cursor-pointer bg-transparent text-transparent"
            aria-label="Solicitar cuenta"
          >
            Solicitar cuenta
          </button>
        </form>
      </section>

      <style jsx global>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .ak-input {
          border: 0;
          outline: 0;
          background: transparent !important;
          color: rgba(255, 255, 255, 0.9);
          font-size: clamp(14px, 1.05vw, 18px);
          font-weight: 500;
          letter-spacing: 0.01em;
          padding: 0 18px;
          caret-color: #ef1d2d;
          box-shadow: none !important;
        }

        .ak-input::placeholder {
          color: rgba(255, 255, 255, 0.48);
        }

        .ak-input:-webkit-autofill,
        .ak-input:-webkit-autofill:hover,
        .ak-input:-webkit-autofill:focus,
        .ak-input:-webkit-autofill:active {
          -webkit-text-fill-color: rgba(255, 255, 255, 0.92) !important;
          transition: background-color 999999s ease-in-out 0s;
          box-shadow: 0 0 0 1000px transparent inset !important;
        }

        @media (max-width: 1100px) {
          main {
            min-height: 100svh;
            background-image: url('/akcloud/login-racing-reference.png');
            background-size: cover;
            background-position: 62% center;
          }

          main > div:first-child {
            opacity: 0.55;
            background-position: 35% center;
          }

          .login-hitbox {
            position: relative !important;
            inset: auto !important;
            width: min(92vw, 460px) !important;
            min-width: 0 !important;
            height: 650px !important;
            margin: 10vh auto 0 !important;
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 30px;
            background: linear-gradient(145deg, rgba(10, 12, 16, 0.92), rgba(20, 5, 10, 0.92));
            box-shadow: 0 0 80px rgba(239, 29, 45, 0.18);
            backdrop-filter: blur(18px);
          }

          .login-hitbox::before {
            content: 'AUTOKEYS\\A REMAPS PRO';
            white-space: pre;
            position: absolute;
            left: 0;
            right: 0;
            top: 42px;
            text-align: center;
            font-weight: 950;
            font-size: 28px;
            line-height: 0.9;
            letter-spacing: -0.04em;
          }

          .login-hitbox::after {
            content: 'Bienvenido de nuevo';
            position: absolute;
            left: 0;
            right: 0;
            top: 140px;
            text-align: center;
            font-weight: 950;
            font-size: 32px;
            letter-spacing: -0.04em;
          }

          .ak-input:nth-of-type(1) {
            top: 240px !important;
            left: 10% !important;
            width: 80% !important;
            height: 58px !important;
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.04) !important;
          }

          .ak-input:nth-of-type(2) {
            top: 340px !important;
            left: 10% !important;
            width: 80% !important;
            height: 58px !important;
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.04) !important;
          }

          button[type='submit'] {
            top: 455px !important;
            left: 10% !important;
            width: 80% !important;
            height: 64px !important;
            background: linear-gradient(135deg, #e11d2e, #ff333f) !important;
            color: white !important;
            font-weight: 900;
            text-transform: uppercase;
          }
        }
      `}</style>
    </main>
  )
}
