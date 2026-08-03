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
    <main className="ak-v5-bg min-h-screen text-white">
      <section className="relative z-10 grid min-h-screen lg:grid-cols-[1.25fr_.75fr]">
        <div className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-[url('/images/login/ak-login-hero.webp')] bg-cover bg-center opacity-70" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,10,.35),rgba(5,7,10,.55)_55%,#05070a_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_45%,transparent,rgba(5,7,10,.58)_72%)]" />
          <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
            <div className="flex items-center gap-3"><img src="/images/brand/autokeys-logo-small-transparent.webp" className="h-11 w-auto" alt="Autokeys"/><div><div className="font-black tracking-[.18em]">AK CLOUD</div><div className="text-[9px] uppercase tracking-[.24em] text-white/35">Secure professional access</div></div></div>
            <div className="max-w-2xl"><div className="ak-v5-pill"><span className="ak-v5-dot"/> System operational</div><h1 className="ak-v5-title mt-7 text-6xl xl:text-7xl">Tu laboratorio.<br/>Siempre conectado.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-white/48">Pedidos, versiones, pagos y soporte técnico en un workspace diseñado para trabajar sin perder tiempo.</p><div className="mt-9 grid grid-cols-3 gap-3"><div className="ak-v5-stat"><ShieldCheck className="text-[#53e6a8]"/><div className="mt-4 text-sm font-bold">Acceso seguro</div></div><div className="ak-v5-stat"><Zap className="text-[#67e8d1]"/><div className="mt-4 text-sm font-bold">Flujo directo</div></div><div className="ak-v5-stat"><Settings className="text-[#e5a05d]"/><div className="mt-4 text-sm font-bold">Soporte real</div></div></div></div>
          </div>
        </div>
        <div className="relative flex items-center justify-center px-5 py-10 lg:px-10">
          <form onSubmit={login} className="ak-v5-glass w-full max-w-[500px] rounded-[32px] p-7 sm:p-10">
            <div className="lg:hidden"><img src="/images/brand/autokeys-logo-wide-transparent.webp" className="mb-8 h-auto w-48" alt="Autokeys"/></div>
            <div className="ak-v5-kicker">Acceso distribuidores</div><h2 className="ak-v5-title mt-4 text-5xl">Bienvenido.</h2><p className="mt-4 text-sm leading-6 text-white/38">Introduce tus credenciales para acceder al workspace profesional.</p>
            <div className="mt-9 space-y-5"><label className="block"><span className="mb-2 block text-xs font-bold text-white/45">Email</span><div className="relative"><Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/28"/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="usuario@taller.com" className="ak-v5-input !pl-12"/></div></label><label className="block"><span className="mb-2 block text-xs font-bold text-white/45">Contraseña</span><div className="relative"><Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/28"/><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••••••" className="ak-v5-input !pl-12 !pr-12"/><button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35"><Eye size={18}/></button></div></label></div>
            <div className="mt-5 flex items-center justify-between text-xs"><label className="flex items-center gap-2 text-white/38"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/> Recordarme</label><button type="button" disabled={sendingReset} onClick={recuperarContrasena} className="font-bold text-[#e5a05d]">{sendingReset?'Enviando...':'Recuperar acceso'}</button></div>
            <button disabled={loading} type="submit" className="ak-v5-button mt-8 w-full !py-4">{loading?'Verificando...':'Acceder a AK Cloud'} <ArrowRight size={19}/></button>
            <div className="mt-7 border-t border-white/[.07] pt-6 text-center text-sm text-white/35">¿No tienes acceso? <button type="button" onClick={()=>router.push('/register')} className="font-bold text-[#ffd09a]">Solicitar cuenta profesional</button></div>
          </form>
        </div>
      </section>
    </main>
  )
}
