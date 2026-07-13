'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowRight, Building2, CheckCircle2, Cloud, Mail, Phone, ShieldCheck, Sparkles, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const specialities = ['File Service', 'Llaves', 'Electrónica ECU', 'Taller mecánico', 'Reprogramación', 'Diagnosis']
const tools = ['KESS3', 'Magic FLEX', 'Autotuner', 'CMDFlash', 'PCMFlash', 'Autel', 'Xhorse', 'Otro']

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [form, setForm] = useState({
    empresa: '',
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    nif: '',
    ciudad: '',
    especialidad: '',
    herramientas: [] as string[],
  })

  const progress = useMemo(() => Math.round((step / 3) * 100), [step])

  function toggleTool(tool: string) {
    setForm((current) => ({
      ...current,
      herramientas: current.herramientas.includes(tool)
        ? current.herramientas.filter((item) => item !== tool)
        : [...current.herramientas, tool],
    }))
  }

  function next() {
    if (step === 1 && (!form.empresa.trim() || !form.nombre.trim() || !form.email.trim())) {
      toast.error('Completa empresa, nombre y email')
      return
    }
    if (step === 2 && !form.password.trim()) {
      toast.error('Introduce una contraseña')
      return
    }
    setStep((s) => Math.min(3, s + 1))
  }

  async function submit() {
    if (!aceptaTerminos) {
      toast.error('Tienes que aceptar los Términos y la Política de Privacidad para crear la cuenta.')
      return
    }
    setLoading(true)
    const { data: signUp, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          empresa: form.empresa,
          nombre: form.nombre,
          telefono: form.telefono,
          nif: form.nif,
          ciudad: form.ciudad,
          especialidad: form.especialidad,
          herramientas: form.herramientas,
          tipo_usuario: 'distribuidor',
          estado_acceso: 'pendiente',
        },
      },
    })

    if (error) {
      setLoading(false)
      if (error.message?.toLowerCase().includes('rate limit')) {
        toast.error('Estamos recibiendo muchos registros ahora mismo. Espera unos minutos y vuelve a intentarlo.')
      } else {
        toast.error(error.message)
      }
      return
    }

    if (!signUp.user) {
      setLoading(false)
      toast.error('No se pudo crear la solicitud de acceso')
      return
    }

    // La solicitud se registra mediante una ruta de servidor con service role.
    // Así no depende de la sesión del navegador, de RLS ni de la confirmación de email.
    const solicitudResponse = await fetch('/api/register-distributor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_user_id: signUp.user.id,
        email: form.email,
        empresa: form.empresa,
        nombre: form.nombre,
        telefono: form.telefono,
        nif: form.nif,
        ciudad: form.ciudad,
        especialidad: form.especialidad,
        herramientas: form.herramientas,
      }),
    })
    const solicitudPayload = await solicitudResponse.json()

    setLoading(false)

    if (!solicitudResponse.ok) {
      toast.error(solicitudPayload.error || 'La cuenta se creó, pero no se pudo enviar la solicitud a Core.')
      return
    }

    toast.success('Solicitud enviada a Autokeys Core. Te avisaremos cuando esté aprobada.')
    router.push('/pendiente-aprobacion')
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#030406] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(29,78,216,.12),transparent_30%)]" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[.8fr_1fr] lg:px-8">
        <section className="hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 backdrop-blur-xl lg:flex lg:flex-col lg:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-red-500/30 bg-red-600/15"><Cloud className="text-red-300" /></div>
            <div>
              <div className="text-2xl font-black">AK <span className="text-red-500">CLOUD</span></div>
              <div className="text-[11px] font-black uppercase tracking-[0.28em] text-zinc-500">Distribuidor onboarding</div>
            </div>
          </Link>

          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-red-300">
              <Sparkles size={15} /> Acceso profesional
            </div>
            <h1 className="text-6xl font-black leading-[.95] tracking-tight">Crea tu cuenta de distribuidor.</h1>
            <p className="mt-6 text-lg leading-8 text-zinc-400">Completa el onboarding y accede al ecosistema AK Cloud para enviar archivos, gestionar créditos y descargar soluciones.</p>
          </div>

          <div className="space-y-3">
            {['File Service premium', 'Pagos PayPal automáticos', 'Historial técnico y descargas'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-zinc-300">
                <CheckCircle2 size={18} className="text-emerald-400" /> {item}
              </div>
            ))}
          </div>
        </section>

        <section className="grid place-items-center">
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#090c12]/90 p-6 shadow-2xl shadow-black/60 backdrop-blur-xl md:p-8">
            <div className="mb-7 flex items-center justify-between gap-5">
              <div>
                <div className="text-sm font-black uppercase tracking-[0.22em] text-red-300">Paso {step} de 3</div>
                <h2 className="mt-2 text-3xl font-black">{step === 1 ? 'Datos de acceso' : step === 2 ? 'Datos fiscales' : 'Especialidad técnica'}</h2>
              </div>
              <div className="h-16 w-16 rounded-full border border-white/10 bg-white/[0.035] p-2">
                <div className="grid h-full w-full place-items-center rounded-full bg-red-600 text-sm font-black">{progress}%</div>
              </div>
            </div>

            <div className="mb-8 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-gradient-to-r from-red-700 to-red-400 transition-all" style={{ width: `${progress}%` }} />
            </div>

            {step === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field icon={Building2} label="Empresa" value={form.empresa} onChange={(v) => setForm({ ...form, empresa: v })} />
                <Field icon={User} label="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} />
                <Field icon={Mail} label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                <Field icon={Phone} label="Teléfono" value={form.telefono} onChange={(v) => setForm({ ...form, telefono: v })} />
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field icon={ShieldCheck} label="Contraseña" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
                <Field icon={Building2} label="NIF/CIF" value={form.nif} onChange={(v) => setForm({ ...form, nif: v })} />
                <Field icon={Building2} label="Ciudad" value={form.ciudad} onChange={(v) => setForm({ ...form, ciudad: v })} />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <div className="mb-3 text-xs font-black uppercase tracking-wider text-zinc-500">Especialidad principal</div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {specialities.map((item) => (
                      <button key={item} onClick={() => setForm({ ...form, especialidad: item })} className={`rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${form.especialidad === item ? 'border-red-500 bg-red-500/15 text-white shadow-lg shadow-red-950/30' : 'border-white/10 bg-white/[0.035] text-zinc-400 hover:text-white'}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-3 text-xs font-black uppercase tracking-wider text-zinc-500">Herramientas usadas</div>
                  <div className="flex flex-wrap gap-2">
                    {tools.map((tool) => (
                      <button key={tool} onClick={() => toggleTool(tool)} className={`rounded-full border px-4 py-2 text-sm font-black transition ${form.herramientas.includes(tool) ? 'border-red-500 bg-red-500/15 text-white' : 'border-white/10 bg-white/[0.035] text-zinc-400 hover:text-white'}`}>
                        {tool}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm text-zinc-400">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-red-600"
                />
                <span>
                  He leído y acepto los <a href="/legal/terminos" target="_blank" className="font-bold text-red-400 underline">Términos y Condiciones</a>, la{' '}
                  <a href="/legal/privacidad" target="_blank" className="font-bold text-red-400 underline">Política de Privacidad</a> y el{' '}
                  <a href="/legal/aviso-legal" target="_blank" className="font-bold text-red-400 underline">Aviso Legal</a> de AK Cloud.
                </span>
              </label>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} className="rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-3 text-sm font-black text-zinc-300 disabled:opacity-40">
                Atrás
              </button>
              {step < 3 ? (
                <button onClick={next} className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-950/40 hover:bg-red-500">
                  Continuar <ArrowRight size={18} />
                </button>
              ) : (
                <button onClick={submit} disabled={loading || !aceptaTerminos} className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-950/40 hover:bg-red-500 disabled:opacity-40">
                  {loading ? 'Creando...' : 'Crear cuenta'} <ArrowRight size={18} />
                </button>
              )}
            </div>

            <div className="mt-6 text-center text-sm text-zinc-500">
              ¿Ya tienes cuenta? <Link href="/login" className="font-black text-red-300 hover:text-red-200">Inicia sesión</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function Field({ icon: Icon, label, value, onChange, type = 'text' }: { icon: any; label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-500">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 focus-within:border-red-500/50">
        <Icon size={18} className="text-zinc-500" />
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border-0 bg-transparent p-0 outline-none" />
      </div>
    </label>
  )
}
