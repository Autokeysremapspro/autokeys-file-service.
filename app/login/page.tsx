'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowRight, Eye, Lock, Mail, ShieldCheck, Zap, Settings, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Acceso correcto')
    router.push('/dashboard')
  }

  async function recuperarContrasena() {
    if (!email) {
      toast.error('Escribe primero tu email arriba, para saber a quién mandarlo')
      return
    }
    setSendingReset(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/restablecer-contrasena`,
    })
    setSendingReset(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(`Te hemos enviado un email a ${email} para restablecer tu contraseña.`)
  }

  return (
    <main className="ak-noise relative min-h-screen overflow-hidden bg-[#05060a] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_45%,rgba(226,149,77,.15),transparent_34%),radial-gradient(circle_at_80%_50%,rgba(94,234,212,.06),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:90px_90px]" />

      <section className="relative z-10 grid min-h-screen lg:grid-cols-[1.15fr_.85fr]">
        <div className="relative hidden min-h-screen overflow-hidden lg:block">
          <div className="absolute inset-0 bg-[url('/images/login/ak-login-hero.webp')] bg-cover bg-left-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-black/10 to-[#05060a]" />
          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-72 bg-gradient-to-l from-[#05060a] via-[#05060a]/70 to-transparent" />
        </div>

        <div className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="absolute inset-0 lg:hidden">
            <div className="absolute inset-0 bg-[url('/images/login/ak-login-hero.webp')] bg-cover bg-center opacity-45" />
            <div className="absolute inset-0 bg-black/75" />
          </div>

          <form
            onSubmit={login}
            className="relative w-full max-w-[520px] overflow-hidden rounded-[30px] border border-white/[.11] bg-[#0a0d12]/90 p-6 shadow-[0_50px_160px_rgba(0,0,0,.82),0_0_110px_rgba(226,149,77,.10),inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-2xl sm:p-9 xl:p-11"
          >
            <div className="pointer-events-none absolute inset-0 rounded-[34px] bg-[radial-gradient(circle_at_18%_0%,rgba(226,149,77,.16),transparent_33%),linear-gradient(180deg,rgba(255,255,255,.065),transparent_42%)]" />
            <div className="pointer-events-none absolute -right-px top-20 h-72 w-px bg-gradient-to-b from-transparent via-[#e2954d]/50 to-transparent" />
            <div className="ak-pinrow pointer-events-none absolute left-1/2 top-6 w-40 -translate-x-1/2" style={{ ['--ak-pin-pos' as any]: '55%' }} />

            <div className="relative">
              <div className="mx-auto mb-8 flex justify-center">
                <img
                  src="/images/brand/autokeys-logo-small-transparent.webp"
                  alt="Autokeys Remaps Pro"
                  className="h-auto w-[210px] object-contain opacity-95"
                />
              </div>

              <div className="text-center">
                <h1 className="ak-premium-heading text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
                  Bienvenido <span className="text-[#ffb870]">de nuevo</span>
                </h1>
                <p className="mt-4 text-sm text-zinc-400 sm:text-base">Acceso para distribuidores y administración.</p>
              </div>

              <div className="mt-9 space-y-5">
                <label className="block">
                  <span className="ak-mono mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">Usuario / Email</span>
                  <div className="group flex h-16 items-center overflow-hidden rounded-[15px] border border-white/[.09] bg-white/[.025] shadow-[inset_0_1px_0_rgba(255,255,255,.025)] transition hover:border-white/[.14] focus-within:border-[#e2954d]/55 focus-within:shadow-[0_0_40px_rgba(226,149,77,.12)]">
                    <div className="grid h-full w-16 place-items-center border-r border-white/10 text-zinc-500 group-focus-within:text-[#ffb870]">
                      <User size={22} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@tuexperiencia.com"
                      required
                      className="h-full w-full border-0 bg-transparent px-5 text-base text-white outline-none placeholder:text-zinc-600"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="ak-mono mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">Contraseña</span>
                  <div className="group flex h-16 items-center overflow-hidden rounded-[15px] border border-white/[.09] bg-white/[.025] shadow-[inset_0_1px_0_rgba(255,255,255,.025)] transition hover:border-white/[.14] focus-within:border-[#e2954d]/55 focus-within:shadow-[0_0_40px_rgba(226,149,77,.12)]">
                    <div className="grid h-full w-16 place-items-center border-r border-white/10 text-zinc-500 group-focus-within:text-[#ffb870]">
                      <Lock size={22} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••••"
                      required
                      className="h-full w-full border-0 bg-transparent px-5 text-base text-white outline-none placeholder:text-zinc-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="grid h-full w-14 place-items-center text-zinc-500 transition hover:text-white"
                      aria-label="Mostrar contraseña"
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                </label>
              </div>

              <div className="mt-6 flex flex-col gap-3 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex cursor-pointer items-center gap-3">
                  <span className="grid h-5 w-5 place-items-center rounded border border-[#e2954d]/55 bg-[#e2954d]/10">
                    {remember && <span className="h-2.5 w-2.5 rounded-sm bg-[#e2954d]" />}
                  </span>
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="sr-only" />
                  Recordar mi sesión
                </label>
                <button type="button" disabled={sendingReset} onClick={recuperarContrasena} className="font-bold text-[#ffb870] transition hover:text-[#f2d4a6] disabled:opacity-50">
                  {sendingReset ? 'Enviando...' : '¿Olvidaste tu contraseña?'}
                </button>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="mt-8 flex h-16 w-full items-center justify-center gap-3 rounded-[15px] border border-[#ffb870]/30 bg-gradient-to-r from-[#8a4a1f] to-[#e2954d] text-base font-bold uppercase tracking-wide text-[#0a0d12] shadow-[0_20px_60px_rgba(226,149,77,.28)] transition hover:scale-[1.01] hover:shadow-[0_28px_80px_rgba(226,149,77,.36)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Accediendo...' : 'Acceder al portal'}
                <ArrowRight size={22} />
              </button>

              <p className="mt-8 text-center text-sm text-zinc-400">
                ¿Aún no tienes cuenta?{' '}
                <button type="button" onClick={() => router.push('/register')} className="font-bold text-[#ffb870] transition hover:text-[#f2d4a6]">
                  Solicitar cuenta
                </button>
              </p>
            </div>
          </form>
        </div>
      </section>

      <div className="pointer-events-none fixed bottom-4 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-8 rounded-2xl border border-white/10 bg-black/50 px-8 py-4 text-xs text-zinc-300 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-3"><ShieldCheck className="text-[#ffb870]" size={22} /><div><b className="block text-white">SEGURIDAD TOTAL</b><span>Datos y archivos protegidos</span></div></div>
        <div className="h-9 w-px bg-white/10" />
        <div className="flex items-center gap-3"><Zap className="text-[#5eead4]" size={22} /><div><b className="block text-white">ENTREGA RÁPIDA</b><span>Flujo directo con Autokeys</span></div></div>
        <div className="h-9 w-px bg-white/10" />
        <div className="flex items-center gap-3"><Settings className="text-[#ffb870]" size={22} /><div><b className="block text-white">EXPERIENCIA REAL</b><span>Especialistas en electrónica</span></div></div>
      </div>
    </main>
  )
}
