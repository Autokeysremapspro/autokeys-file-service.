'use client'

import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowRight, Building2, CheckCircle2, Eye, EyeOff, Info, Lock, Mail, MapPin, MessageSquare, Phone, User } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthCard, { AuthButton } from '@/components/auth/AuthCard'
import { AuthInput, AuthTextarea } from '@/components/auth/AuthInput'

type FormState = {
  nombre: string
  email: string
  password: string
  confirmPassword: string
  telefono: string
  empresa: string
  ciudad: string
  mensaje: string
}

const initialForm: FormState = {
  nombre: '',
  email: '',
  password: '',
  confirmPassword: '',
  telefono: '',
  empresa: '',
  ciudad: '',
  mensaje: '',
}

export default function RegisterClient() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [aceptaLegal, setAceptaLegal] = useState(false)
  const [legalError, setLegalError] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  function setField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validar() {
    const nextErrors: Partial<Record<keyof FormState, string>> = {}
    if (!form.nombre.trim()) nextErrors.nombre = 'Indica tu nombre completo'
    if (!form.email.trim()) nextErrors.email = 'Indica tu email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Introduce un email válido'
    if (!form.password) nextErrors.password = 'Crea una contraseña'
    else if (form.password.length < 8) nextErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    if (!form.confirmPassword) nextErrors.confirmPassword = 'Repite tu contraseña'
    else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Las contraseñas no coinciden'
    if (!form.telefono.trim()) nextErrors.telefono = 'Indica un teléfono de contacto'
    if (!form.empresa.trim()) nextErrors.empresa = 'Indica el nombre de tu taller o empresa'
    if (!form.ciudad.trim()) nextErrors.ciudad = 'Indica tu localidad o país'
    if (!form.mensaje.trim()) nextErrors.mensaje = 'Cuéntanos brevemente qué necesitas'

    setErrors(nextErrors)
    const legalOk = aceptaLegal
    setLegalError(legalOk ? '' : 'Tienes que aceptar la política de privacidad y las condiciones de uso')
    return Object.keys(nextErrors).length === 0 && legalOk
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!validar()) return

    setLoading(true)
    try {
      const response = await fetch('/api/register-distributor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          empresa: form.empresa.trim(),
          nombre: form.nombre.trim(),
          telefono: form.telefono.trim(),
          ciudad: form.ciudad.trim(),
          mensaje: form.mensaje.trim(),
        }),
      })
      const result = await response.json().catch(() => null)

      if (!response.ok || !result?.ok || !result?.requestId) {
        const message = result?.error || 'No se pudo registrar la solicitud en AK Core'
        if (message.toLowerCase().includes('rate limit')) {
          toast.error('Estamos recibiendo muchas solicitudes ahora mismo. Espera unos minutos y vuelve a intentarlo.')
        } else {
          toast.error(message)
        }
        return
      }

      setEnviado(true)
    } catch {
      toast.error('No se pudo conectar con AK Core. La solicitud no se ha confirmado; inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <AuthLayout>
        <AuthCard className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 size={34} className="text-emerald-400" />
          </div>
          <h2 className="mt-6 text-[28px] font-bold text-white">Solicitud registrada</h2>
          <p className="mt-3 text-[15px] leading-[1.65] text-[#a1a1a6]">
            Tu solicitud ya está pendiente de revisión en AK Cloud. Revisa ahora tu correo y confirma tu dirección de email. Cuando Autokeys Remaps Pro apruebe la cuenta podrás acceder con el email y la contraseña que acabas de crear.
          </p>
          <Link href="/login" className="mt-8 block">
            <AuthButton type="button">Volver al inicio de sesión <ArrowRight size={19} /></AuthButton>
          </Link>
          <p className="mt-6 text-sm text-[#92939a]">
            ¿Necesitas ayuda? <Link href="/soporte" className="font-medium text-[#ef1018] transition hover:text-[#ff1c25]">Contáctanos</Link>
          </p>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthCard>
        <h2 className="text-[26px] font-bold text-white">Solicitar cuenta</h2>
        <p className="mt-2 text-[15px] text-[#92939a]">Completa el formulario para solicitar acceso a AK Cloud.</p>

        <div className="mt-5 flex items-start gap-2.5 border-y border-white/[.08] py-3 text-[13px] leading-relaxed text-[#a1a1a6]">
          <Info size={16} className="mt-0.5 shrink-0 text-[#ef1018]" />
          <p>Todos los nuevos usuarios requieren aprobación por <span className="text-[#ef1018]">Autokeys Remaps Pro.</span></p>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <AuthInput icon={User} label="Nombre completo" value={form.nombre} onChange={(e) => setField('nombre', e.target.value)} placeholder="Tu nombre completo" error={errors.nombre} className="h-[52px]" autoComplete="name" />
          <AuthInput icon={Mail} label="Correo electrónico" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="tu@email.com" error={errors.email} className="h-[52px]" autoComplete="email" />
          <AuthInput
            icon={Lock}
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            placeholder="Mínimo 8 caracteres"
            error={errors.password}
            className="h-[52px]"
            autoComplete="new-password"
            rightSlot={
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-[#85868c] transition hover:text-white" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
          <AuthInput
            icon={Lock}
            label="Repetir contraseña"
            type={showConfirmPassword ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={(e) => setField('confirmPassword', e.target.value)}
            placeholder="Repite tu contraseña"
            error={errors.confirmPassword}
            className="h-[52px]"
            autoComplete="new-password"
            rightSlot={
              <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="text-[#85868c] transition hover:text-white" aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
          <AuthInput icon={Phone} label="Teléfono / WhatsApp" value={form.telefono} onChange={(e) => setField('telefono', e.target.value)} placeholder="+34 600 123 456" error={errors.telefono} className="h-[52px]" autoComplete="tel" />
          <AuthInput icon={Building2} label="Nombre del taller o empresa" value={form.empresa} onChange={(e) => setField('empresa', e.target.value)} placeholder="Nombre de tu taller o empresa" error={errors.empresa} className="h-[52px]" autoComplete="organization" />
          <AuthInput icon={MapPin} label="Localidad / País" value={form.ciudad} onChange={(e) => setField('ciudad', e.target.value)} placeholder="Tu localidad o país" error={errors.ciudad} className="h-[52px]" autoComplete="address-level2" />
          <AuthTextarea
            icon={MessageSquare}
            label="Cuéntanos brevemente tu actividad o los servicios que necesitas"
            value={form.mensaje}
            onChange={(e) => setField('mensaje', e.target.value)}
            placeholder="Escribe aquí…"
            error={errors.mensaje}
          />

          <label className="flex items-start gap-2.5 pt-1 text-sm text-[#92939a]">
            <input type="checkbox" checked={aceptaLegal} onChange={(e) => { setAceptaLegal(e.target.checked); if (e.target.checked) setLegalError('') }} className="mt-0.5 h-4 w-4 shrink-0 accent-[#ef1018]" />
            <span>
              Acepto la <Link href="/legal/privacidad" target="_blank" className="text-[#ef1018] hover:text-[#ff1c25]">política de privacidad</Link> y las{' '}
              <Link href="/legal/terminos" target="_blank" className="text-[#ef1018] hover:text-[#ff1c25]">condiciones de uso</Link>.
            </span>
          </label>
          {legalError && <p className="text-xs text-[#ff4d4d]">{legalError}</p>}

          <AuthButton type="submit" loading={loading} className="mt-2">
            {loading ? 'Enviando solicitud…' : 'Enviar solicitud'} <ArrowRight size={19} />
          </AuthButton>
        </form>

        <p className="mt-6 text-center text-sm text-[#92939a]">
          ¿Ya tienes cuenta? <Link href="/login" className="font-medium text-[#ef1018] transition hover:text-[#ff1c25]">Iniciar sesión</Link>
        </p>
      </AuthCard>
    </AuthLayout>
  )
}
