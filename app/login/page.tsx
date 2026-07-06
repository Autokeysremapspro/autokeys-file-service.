'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowRight, Cloud, LockKeyhole, Mail, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <main className="relative min-h-screen overflow-hidden bg-[#030406] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(217,4,41,.34),transparent_34%),radial-gradient(circle_at_82%_14%,rgba(28,141,255,.16),transparent_32%),linear-gradient(180deg,#080a0f,#020305)]" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:58px_58px]" />
      <div className="absolute -left-24 top-28 h-72 w-72 rounded-full bg-[var(--ak-red,#D90429)]/20 blur-3xl" />
      <div className="absolute -bottom-24 right-20 h-96 w-96 rounded-full bg-red-600/20 blur-3xl" />

      <section className="relative z-10 grid min-h-screen items-center gap-10 px-5 py-10 lg:grid-cols-[1.05fr_.95fr] lg:px-14">
        <div className="mx-auto max-w-3xl lg:mx-0">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-white/55 backdrop-blur-xl">
            <Sparkles size={15} className="text-red-400" /> Professional File Service Platform
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(135deg,#D90429,#ff3155)] shadow-[0_0_90px_rgba(217,4,41,.45)]">
              <Cloud size={34} />
            </div>
            <div>
              <div className="text-5xl font-black italic leading-none tracking-tight">AK <span className="text-red-500">CLOUD</span></div>
              <div className="mt-1 text-[11px] font-black uppercase tracking-[0.35em] text-white/38">by Autokeys Lab</div>
            </div>
          </div>

          <h1 className="mt-9 max-w-3xl text-5xl font-black leading-[0.94] tracking-tight md:text-7xl">
            File Service con experiencia de software premium.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/45">
            Sube ORI, compra créditos, consulta tu garaje, descarga MOD y habla con Autokeys desde un workspace moderno, rápido y conectado con Autokeys Core.
          </p>

          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Zap, title: 'Pedidos rápidos', text: 'Menos de 60s' },
              { icon: ShieldCheck, title: 'Pagos seguros', text: 'PayPal + créditos' },
              { icon: Cloud, title: 'Historial cloud', text: 'ORI / MOD siempre' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
                    <Icon size={21} />
                  </div>
                  <div className="mt-4 text-sm font-black">{item.title}</div>
                  <div className="mt-1 text-xs text-white/35">{item.text}</div>
                </div>
              )
            })}
          </div>
        </div>

        <form onSubmit={login} className="mx-auto w-full max-w-md rounded-[2.4rem] border border-white/12 bg-white/[0.065] p-6 shadow-[0_40px_160px_rgba(0,0,0,.48)] backdrop-blur-2xl md:p-8">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">Secure access</p>
            <h2 className="mt-2 text-3xl font-black">Iniciar sesión</h2>
            <p className="mt-2 text-sm leading-6 text-white/40">Accede al workspace de distribuidores AK Cloud.</p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/35"><Mail size={14} /> Email</span>
              <input
                type="email"
                placeholder="distribuidor@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-white outline-none transition placeholder:text-white/20 focus:border-red-500/60"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/35"><LockKeyhole size={14} /> Contraseña</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-white outline-none transition placeholder:text-white/20 focus:border-red-500/60"
              />
            </label>

            <button
              disabled={loading}
              className="group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#D90429,#ff3155)] px-5 py-4 text-sm font-black text-white shadow-[0_0_70px_rgba(217,4,41,.35)] transition hover:shadow-[0_0_90px_rgba(217,4,41,.48)] disabled:opacity-55"
            >
              {loading ? 'Entrando...' : 'Entrar en AK Cloud'}
              <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/22 p-4 text-center text-sm text-white/42">
            ¿Todavía no tienes acceso?{' '}
            <Link href="/register" className="font-black text-red-300 hover:text-red-200">Solicitar cuenta de distribuidor</Link>
          </div>
        </form>
      </section>
    </main>
  )
}
