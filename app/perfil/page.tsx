'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Building2, Globe2, Mail, MapPin, Phone, Save, ShieldCheck, UserCircle, Wrench } from 'lucide-react'
import AKPageShell from '@/components/ak/AKPageShell'
import AKCard from '@/components/ak/AKCard'
import { supabase } from '@/lib/supabase'

type Profile = {
  empresa: string
  nif: string
  telefono: string
  email: string
  direccion: string
  codigo_postal: string
  poblacion: string
  provincia: string
  web: string
  herramientas: string[]
}

const emptyProfile: Profile = {
  empresa: '', nif: '', telefono: '', email: '', direccion: '', codigo_postal: '', poblacion: '', provincia: '', web: '', herramientas: [],
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile)
  const [tools, setTools] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [{ data: auth }, { data, error }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.rpc('get_my_akcloud_profile'),
    ])
    setLoginEmail(auth.user?.email || '')
    if (error) toast.error(error.message)
    if (data) {
      const next: Profile = {
        empresa: data.empresa || '', nif: data.nif || '', telefono: data.telefono || '', email: data.email || '',
        direccion: data.direccion || '', codigo_postal: data.codigo_postal || '', poblacion: data.poblacion || '', provincia: data.provincia || '',
        web: data.web || '', herramientas: Array.isArray(data.herramientas) ? data.herramientas : [],
      }
      setProfile(next)
      setTools(next.herramientas.join(', '))
    }
    setLoading(false)
  }

  function field(key: keyof Profile, value: string) { setProfile(p => ({ ...p, [key]: value })) }

  async function save() {
    setSaving(true)
    const herramientas = tools.split(',').map(v => v.trim()).filter(Boolean)
    const { data, error } = await supabase.rpc('update_my_akcloud_profile', {
      p_empresa: profile.empresa,
      p_nif: profile.nif,
      p_telefono: profile.telefono,
      p_email: profile.email,
      p_direccion: profile.direccion,
      p_codigo_postal: profile.codigo_postal,
      p_poblacion: profile.poblacion,
      p_provincia: profile.provincia,
      p_web: profile.web,
      p_herramientas: herramientas,
    })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    if (data) {
      setProfile(p => ({ ...p, herramientas: Array.isArray(data.herramientas) ? data.herramientas : herramientas }))
      setTools((Array.isArray(data.herramientas) ? data.herramientas : herramientas).join(', '))
    }
    toast.success('Perfil actualizado y sincronizado con AK Core')
  }

  return (
    <AKPageShell title="Mi cuenta" subtitle="Datos fiscales, contacto y herramientas del taller. Se sincronizan con tu ficha de cliente en AK Core." eyebrow="Account">
      <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <AKCard className="p-4 sm:p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-300 sm:h-16 sm:w-16 sm:rounded-3xl"><UserCircle size={32} /></div>
            <div className="min-w-0"><h2 className="break-words text-2xl font-black">Perfil del taller</h2><p className="mt-1 text-sm leading-6 text-white/40">Solo puedes modificar datos de empresa, contacto y herramientas.</p></div>
          </div>

          {loading ? <div className="mt-8 text-sm text-white/35">Cargando perfil...</div> : <>
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <Field icon={<Building2 size={18}/>} label="Razón social / empresa" value={profile.empresa} onChange={v=>field('empresa',v)} />
              <Field label="NIF / CIF" value={profile.nif} onChange={v=>field('nif',v)} />
              <Field icon={<Phone size={18}/>} label="Teléfono" value={profile.telefono} onChange={v=>field('telefono',v)} />
              <Field icon={<Mail size={18}/>} label="Email de contacto / facturación" type="email" value={profile.email} onChange={v=>field('email',v)} />
              <Field icon={<MapPin size={18}/>} label="Dirección fiscal" value={profile.direccion} onChange={v=>field('direccion',v)} className="md:col-span-2" />
              <Field label="Código postal" value={profile.codigo_postal} onChange={v=>field('codigo_postal',v)} />
              <Field label="Población" value={profile.poblacion} onChange={v=>field('poblacion',v)} />
              <Field label="Provincia" value={profile.provincia} onChange={v=>field('provincia',v)} />
              <Field icon={<Globe2 size={18}/>} label="Web" value={profile.web} onChange={v=>field('web',v)} placeholder="https://..." />
              <Field icon={<Wrench size={18}/>} label="Herramientas" value={tools} onChange={setTools} placeholder="Kess3, Flex, Autotuner..." className="md:col-span-2" />
            </div>
            <div className="mt-6 flex justify-stretch sm:justify-end"><button disabled={saving} onClick={save} className="ak5-primary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"><Save size={17}/>{saving?'Guardando...':'Guardar cambios'}</button></div>
          </>}
        </AKCard>

        <div className="space-y-6">
          <AKCard className="p-4 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Seguridad</p>
            <h3 className="mt-2 break-words text-2xl font-black">Acceso protegido</h3>
            <p className="mt-3 text-sm leading-6 text-white/45">La actualización usa una operación segura ligada a tu usuario. No expone precios, descuentos, límites de crédito, notas internas ni ajustes administrativos.</p>
          </AKCard>
          <AKCard className="p-4 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Cuenta de acceso</p>
            <div className="mt-4 flex min-w-0 items-start gap-3 text-sm text-white/65"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-cyan-300"/><span className="min-w-0 break-all">{loginEmail || '—'}</span></div>
            <p className="mt-3 text-xs leading-5 text-white/30">El email de acceso puede ser distinto del email de contacto o facturación.</p>
          </AKCard>
        </div>
      </div>
    </AKPageShell>
  )
}

function Field({label,value,onChange,icon,type='text',placeholder,className=''}:{label:string;value:string;onChange:(value:string)=>void;icon?:React.ReactNode;type?:string;placeholder?:string;className?:string}){
  return <label className={`block min-w-0 ${className}`}><span className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[.16em] text-white/40">{icon}{label}</span><input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/25 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-cyan-400/40" /></label>
}
