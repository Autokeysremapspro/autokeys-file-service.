'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowRight, Eye, Lock, Mail } from 'lucide-react'
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
    <main className="ak-v5-bg min-h-screen text-white">
      <section className="relative z-10 grid min-h-screen lg:grid-cols-[1.2fr_.8fr]">
        <div className="relative hidden overflow-hidden lg:block">
          <img src="/images/login/ak-login-hero.webp" alt="Autokeys Remaps Pro" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-[#05070a]" />
        </div>
        <div className="relative flex items-center justify-center px-5 py-10 lg:px-10">
          <form onSubmit={login} className="w-full max-w-[460px]">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <img src="/images/brand/autokeys-logo-small-transparent.webp" className="h-10 w-auto" alt="Autokeys" />
              <div className="font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></div>
            </div>

            <div className="ak-v5-kicker">Acceso distribuidores</div>
            <h1 className="ak-v5-title mt-4 text-5xl">Bienvenido de<br />vuelta.</h1>
            <p className="mt-4 text-sm leading-6 text-white/38">Introduce tus credenciales para entrar a tu workspace.</p>

            <div className="mt-8 space-y-5">
              <label className="block"><span className="mb-2 block text-xs font-bold text-white/45">Email</span><div className="relative"><Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/28" /><input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="usuario@taller.com" className="ak-v5-input !pl-12" /></div></label>
              <label className="block"><span className="mb-2 block text-xs font-bold text-white/45">Contraseña</span><div className="relative"><Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/28" /><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••••••" className="ak-v5-input !pl-12 !pr-12" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35"><Eye size={18} /></button></div></label>
            </div>

            <div className="mt-5 flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-white/38"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Recordarme</label>
              <button type="button" disabled={sendingReset} onClick={recuperarContrasena} className="font-bold text-[#ff425a]">{sendingReset ? 'Enviando...' : 'Recuperar acceso'}</button>
            </div>

            <button disabled={loading} type="submit" className="ak-v5-button mt-7 w-full !py-4">{loading ? 'Verificando...' : 'Acceder a AK Cloud'} <ArrowRight size={19} /></button>

            <div className="ak-v5-glass mt-7 rounded-2xl p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-white/35"><i className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Estado del sistema</span>
                <span className="text-[10px] font-bold uppercase text-emerald-300">Operativo</span>
              </div>
              <div className="relative h-9 overflow-hidden rounded-lg border border-[#67e8d1]/15 bg-black/40">
                <svg viewBox="0 0 300 36" preserveAspectRatio="none" className="h-full w-full opacity-80">
                  <path d="M0,18 L10,18 L15,7 L20,29 L27,18 L60,18 L65,10 L70,26 L75,18 L130,18 L135,6 L140,30 L146,18 L200,18 L205,8 L210,28 L216,18 L260,18 L265,7 L270,29 L276,18 L300,18" fill="none" stroke="#67e8d1" strokeWidth="1.4" />
                </svg>
              </div>
            </div>

            <div className="mt-7 border-t border-white/[.07] pt-6 text-center text-sm text-white/35">¿No tienes acceso? <button type="button" onClick={() => router.push('/register')} className="font-bold text-[#ff8095]">Solicitar cuenta profesional</button></div>
          </form>
        </div>
      </section>
    </main>
  )
}
