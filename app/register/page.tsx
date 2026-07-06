'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowLeft, Building2, CheckCircle2, Cloud, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    password: '',
  })

  function set(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()

    if (form.password.length < 6) {
      toast.error('La contraseña debe tener mínimo 6 caracteres')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          nombre: form.nombre,
          empresa: form.empresa,
          telefono: form.telefono,
          tipo_usuario: 'distribuidor',
        },
      },
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Solicitud creada. Revisa tu email o espera activación de Autokeys.')
    router.push('/login')
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030406] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(217,4,41,.28),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(19,210,106,.13),transparent_28%),linear-gradient(180deg,#090b10,#020305)]" />
      <div className="absolute inset-0 opacity-[0.10] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:64px_64px]" />

      <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-5 py-10 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm font-black text-white/55 hover:text-white">
            <ArrowLeft size={16} /> Volver al login
          </Link>

          <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(135deg,#D90429,#ff3155)] shadow-[0_0_90px_rgba(217,4,41,.38)]">
            <Cloud size={34} />
          </div>

          <h1 className="mt-7 text-5xl font-black leading-[.95] tracking-tight md:text-7xl">
            Únete a la red AK Cloud.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/45">
            Solicita acceso como distribuidor y empieza a enviar trabajos de File Service con créditos, historial, soporte y descargas desde una plataforma premium.
          </p>

          <div className="mt-8 space-y-3">
            {[
              'Workspace profesional para talleres y distribuidores',
              'Pagos con PayPal y créditos automáticos',
              'Garaje, biblioteca, chat y soporte técnico integrado',
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 text-sm font-bold text-white/60">
                <CheckCircle2 size={18} className="text-[var(--ak-green,#13D26A)]" /> {text}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="rounded-[2.4rem] border border-white/12 bg-white/[0.065] p-6 shadow-[0_40px_160px_rgba(0,0,0,.48)] backdrop-blur-2xl md:p-8">
          <div className="mb-7 flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">Distributor Access</p>
              <h2 className="mt-2 text-3xl font-black">Registro</h2>
              <p className="mt-2 text-sm text-white/40">Crea tu cuenta para solicitar acceso a AK Cloud.</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ak-green,#13D26A)]/12 text-[var(--ak-green,#13D26A)]">
              <ShieldCheck size={24} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field icon={UserRound} label="Nombre" value={form.nombre} onChange={(v) => set('nombre', v)} required />
            <Field icon={Building2} label="Empresa / taller" value={form.empresa} onChange={(v) => set('empresa', v)} required />
            <Field icon={Mail} label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} required />
            <Field icon={Phone} label="Teléfono" value={form.telefono} onChange={(v) => set('telefono', v)} />
            <div className="md:col-span-2">
              <Field icon={ShieldCheck} label="Contraseña" type="password" value={form.password} onChange={(v) => set('password', v)} required />
            </div>
          </div>

          <button disabled={loading} className="mt-6 w-full rounded-2xl bg-[linear-gradient(135deg,#D90429,#ff3155)] px-5 py-4 text-sm font-black text-white shadow-[0_0_70px_rgba(217,4,41,.35)] disabled:opacity-55">
            {loading ? 'Creando solicitud...' : 'Solicitar acceso'}
          </button>

          <p className="mt-5 text-center text-xs leading-5 text-white/35">
            El acceso puede requerir validación por Autokeys Lab para proteger la plataforma y la red de distribuidores.
          </p>
        </form>
      </section>
    </main>
  )
}

function Field({ icon: Icon, label, value, onChange, type = 'text', required = false }: { icon: any; label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/35"><Icon size={14} /> {label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-white outline-none transition placeholder:text-white/20 focus:border-red-500/60"
      />
    </label>
  )
}
