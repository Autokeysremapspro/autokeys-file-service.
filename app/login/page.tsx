'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowRight, Cloud, Eye, Lock, ShieldCheck, UserRound, Zap, Cog } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
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

    toast.success('Bienvenido a AK Cloud')
    router.push('/dashboard')
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020305] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(220,0,35,.30),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(255,255,255,.08),transparent_28%),linear-gradient(90deg,rgba(0,0,0,.15),rgba(0,0,0,.88))]" />
      <div className="pointer-events-none absolute inset-0 opacity-[.09] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:radial-gradient(circle_at_50%_40%,black,transparent_72%)]" />

      <section className="relative z-10 grid min-h-screen grid-cols-1 xl:grid-cols-[1.15fr_.85fr]">
        <div className="relative hidden min-h-screen overflow-hidden xl:block">
          <div className="absolute inset-0 bg-[url('/images/ak-login-racing.png')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-black/15 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25" />

          <div className="absolute bottom-10 left-10 right-10">
            <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-black/35 backdrop-blur-xl">
              <Feature icon={<ShieldCheck size={28} />} title="Seguridad total" text="Datos y archivos protegidos" />
              <Feature icon={<Zap size={28} />} title="Entrega rápida" text="Flujo directo con Autokeys" />
              <Feature icon={<Cog size={28} />} title="Experiencia real" text="Especialistas en electrónica" />
            </div>
          </div>
        </div>

        <div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[560px]">
            <div className="mb-7 flex justify-center xl:hidden">
              <BrandMark />
            </div>

            <form
              onSubmit={login}
              className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#080b10]/85 p-7 shadow-[0_40px_130px_rgba(0,0,0,.65)] backdrop-blur-2xl sm:p-10"
            >
              <div className="pointer-events-none absolute inset-y-8 right-0 w-px bg-gradient-to-b from-transparent via-red-500/80 to-transparent shadow-[0_0_40px_rgba(239,35,60,.9)]" />
              <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-red-600/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 right-8 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />

              <div className="relative">
                <div className="mb-8 flex justify-center">
                  <BrandMark />
                </div>

                <div className="text-center">
                  <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                    Bienvenido <span className="text-red-500">de nuevo</span>
                  </h1>
                  <p className="mt-4 text-sm text-zinc-400 sm:text-base">
                    Acceso para distribuidores y administración.
                  </p>
                </div>

                <div className="mt-10 space-y-5">
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[.18em] text-zinc-500">Usuario / Email</span>
                    <div className="group flex items-center rounded-2xl border border-white/15 bg-white/[.035] transition focus-within:border-red-500/60 focus-within:bg-white/[.055] focus-within:shadow-[0_0_32px_rgba(220,38,38,.16)]">
                      <div className="flex h-16 w-16 items-center justify-center border-r border-white/10 text-zinc-500 group-focus-within:text-red-400">
                        <UserRound size={22} />
                      </div>
                      <input
                        type="email"
                        placeholder="usuario@tuexperiencia.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-16 flex-1 border-0 bg-transparent px-5 text-base text-white outline-none placeholder:text-zinc-600"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[.18em] text-zinc-500">Contraseña</span>
                    <div className="group flex items-center rounded-2xl border border-white/15 bg-white/[.035] transition focus-within:border-red-500/60 focus-within:bg-white/[.055] focus-within:shadow-[0_0_32px_rgba(220,38,38,.16)]">
                      <div className="flex h-16 w-16 items-center justify-center border-r border-white/10 text-zinc-500 group-focus-within:text-red-400">
                        <Lock size={22} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-16 flex-1 border-0 bg-transparent px-5 text-base text-white outline-none placeholder:text-zinc-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="mr-4 rounded-xl p-2 text-zinc-500 transition hover:bg-white/10 hover:text-white"
                        aria-label="Mostrar contraseña"
                      >
                        <Eye size={21} />
                      </button>
                    </div>
                  </label>
                </div>

                <div className="mt-6 flex flex-col gap-4 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" onClick={() => setRemember(!remember)} className="inline-flex items-center gap-3 text-left">
                    <span className={`grid h-5 w-5 place-items-center rounded-md border ${remember ? 'border-red-500 bg-red-500/15 text-red-400' : 'border-white/20 text-transparent'}`}>✓</span>
                    Recordar mi sesión
                  </button>
                  <button type="button" onClick={() => toast('Contacta con Autokeys para recuperar el acceso')} className="font-bold text-red-400 transition hover:text-red-300">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <button
                  disabled={loading}
                  className="mt-8 flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-red-700 via-red-600 to-red-500 text-sm font-black uppercase tracking-wide text-white shadow-[0_20px_70px_rgba(220,38,38,.38)] transition hover:scale-[1.01] hover:shadow-[0_24px_90px_rgba(220,38,38,.55)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Accediendo...' : 'Acceder al portal'}
                  <ArrowRight size={20} />
                </button>

                <div className="my-8 flex items-center gap-4 text-sm text-zinc-500">
                  <div className="h-px flex-1 bg-white/10" />
                  <span>o continúa con</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <button
                  type="button"
                  onClick={() => toast('El acceso con PayPal se activará más adelante')}
                  className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-black/20 text-base font-bold text-white transition hover:border-white/35 hover:bg-white/5"
                >
                  <span className="text-3xl font-black italic">P</span>
                  Acceder con PayPal
                </button>

                <p className="mt-8 text-center text-sm text-zinc-400">
                  ¿Aún no tienes cuenta?{' '}
                  <a href="/register" className="font-black text-red-400 hover:text-red-300">
                    Solicitar cuenta
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}

function BrandMark() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-red-500/35 bg-red-500/10 text-red-400 shadow-[0_0_35px_rgba(220,38,38,.25)]">
          <Cloud size={22} />
        </div>
        <div>
          <div className="text-2xl font-black italic leading-none tracking-tight">
            AUTOKEYS
          </div>
          <div className="text-sm font-black italic leading-none text-red-500">REMAPS PRO</div>
        </div>
      </div>
      <div className="mt-2 text-[10px] font-black uppercase tracking-[.55em] text-zinc-500">Electronic Solutions</div>
    </div>
  )
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-center gap-4 border-r border-white/10 px-7 py-5 last:border-r-0">
      <div className="text-red-500">{icon}</div>
      <div>
        <div className="text-sm font-black uppercase tracking-wide text-white">{title}</div>
        <div className="mt-1 text-sm text-zinc-400">{text}</div>
      </div>
    </div>
  )
}
