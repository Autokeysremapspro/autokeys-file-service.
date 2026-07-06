'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowRight, Cloud, Lock, Mail, ShieldCheck } from 'lucide-react'
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
    <main className="min-h-screen overflow-hidden bg-[#030406] text-white lg:grid lg:grid-cols-[1fr_.82fr]">
      <section className="relative hidden min-h-screen p-10 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(220,38,38,.28),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(29,78,216,.12),transparent_35%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between rounded-[2rem] border border-white/10 bg-white/[0.035] p-10 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-red-500/30 bg-red-600/15"><Cloud className="text-red-300" /></div>
            <div>
              <div className="text-2xl font-black">AK <span className="text-red-500">CLOUD</span></div>
              <div className="text-[11px] font-black uppercase tracking-[0.28em] text-zinc-500">by Autokeys Lab</div>
            </div>
          </Link>

          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-red-300">
              Professional File Service
            </div>
            <h1 className="max-w-xl text-6xl font-black leading-[.95] tracking-tight">Accede a tu workspace técnico.</h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-zinc-400">Pedidos, créditos, descargas, soporte y todo tu historial de archivos en una sola plataforma.</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {['PayPal automático', 'Storage seguro', 'Core Sync'].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-black/25 p-4 text-sm font-bold text-zinc-300">
                <ShieldCheck className="mb-3 text-emerald-400" size={18} /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid min-h-screen place-items-center p-6">
        <form onSubmit={login} className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#090c12]/90 p-7 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <div className="mb-8 text-center">
            <Link href="/" className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl border border-red-500/30 bg-red-600/15 shadow-lg shadow-red-950/40">
              <Cloud size={31} className="text-red-300" />
            </Link>
            <h1 className="text-3xl font-black">Bienvenido de nuevo</h1>
            <p className="mt-2 text-sm text-zinc-500">Acceso para distribuidores y administración.</p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-500">Email</span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 focus-within:border-red-500/50">
                <Mail size={18} className="text-zinc-500" />
                <input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border-0 bg-transparent p-0 outline-none" />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-500">Contraseña</span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 focus-within:border-red-500/50">
                <Lock size={18} className="text-zinc-500" />
                <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border-0 bg-transparent p-0 outline-none" />
              </div>
            </label>

            <button disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-red-950/40 transition hover:bg-red-500 disabled:opacity-60">
              {loading ? 'Entrando...' : 'Iniciar sesión'} <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-zinc-500">
            ¿Aún no tienes acceso? <Link href="/register" className="font-black text-red-300 hover:text-red-200">Solicitar cuenta</Link>
          </div>
        </form>
      </section>
    </main>
  )
}
