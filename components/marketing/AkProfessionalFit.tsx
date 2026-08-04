'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, Building2, Check, CircleAlert, Wrench } from 'lucide-react'

const options = [
  { id: 'taller', label: 'Taller mecánico', icon: Wrench },
  { id: 'distribuidor', label: 'Distribuidor / reprogramador', icon: Building2 },
  { id: 'particular', label: 'Cliente particular', icon: CircleAlert },
]

const needs = [
  'Quiero pagar por cada archivo, sin comprar créditos',
  'Necesito conservar ORI, MOD y revisiones ordenadas',
  'Valoro el soporte técnico dentro del propio pedido',
  'Trabajo habitualmente con vehículos de clientes',
]

export default function AkProfessionalFit() {
  const [profile, setProfile] = useState('taller')
  const [checked, setChecked] = useState<string[]>(needs.slice(0, 3))
  const professional = profile !== 'particular'
  const score = useMemo(() => checked.length, [checked])

  function toggle(item: string) {
    setChecked(current => current.includes(item) ? current.filter(x => x !== item) : [...current, item])
  }

  return (
    <div className="ak-v5-glass overflow-hidden rounded-[34px]">
      <div className="grid lg:grid-cols-[1fr_.88fr]">
        <div className="p-7 sm:p-10">
          <div className="ak-v5-kicker">Acceso profesional</div>
          <h3 className="ak-v5-title mt-4 text-4xl sm:text-5xl">Comprueba si AK Cloud encaja contigo.</h3>
          <p className="mt-4 max-w-2xl leading-7 text-white/42">La plataforma está enfocada a talleres y distribuidores que necesitan un flujo técnico recurrente, trazable y ordenado.</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {options.map(({ id, label, icon: Icon }) => {
              const active = profile === id
              return <button key={id} type="button" onClick={() => setProfile(id)} className={`rounded-2xl border p-4 text-left transition ${active ? 'border-[#e5a05d]/45 bg-[#e5a05d]/10' : 'border-white/[.07] bg-black/20 hover:border-white/15'}`}>
                <Icon size={20} className={active ? 'text-[#ffd09a]' : 'text-white/35'} />
                <span className="mt-3 block text-sm font-bold">{label}</span>
              </button>
            })}
          </div>

          <div className="mt-7 space-y-3">
            {needs.map(item => {
              const active = checked.includes(item)
              return <button key={item} type="button" onClick={() => toggle(item)} className="flex w-full items-center gap-3 rounded-2xl border border-white/[.07] bg-black/20 p-4 text-left text-sm text-white/65 transition hover:border-white/15">
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${active ? 'border-[#67e8d1]/30 bg-[#67e8d1]/10 text-[#67e8d1]' : 'border-white/10 text-transparent'}`}><Check size={14} /></span>
                {item}
              </button>
            })}
          </div>
        </div>

        <div className="border-t border-white/[.07] bg-black/25 p-7 sm:p-10 lg:border-l lg:border-t-0">
          <div className={`rounded-[28px] border p-7 ${professional ? 'border-[#67e8d1]/20 bg-[#67e8d1]/[.06]' : 'border-amber-400/20 bg-amber-400/[.06]'}`}>
            <BadgeCheck size={32} className={professional ? 'text-[#67e8d1]' : 'text-amber-300'} />
            <div className="mt-6 text-[10px] font-black uppercase tracking-[.2em] text-white/30">Resultado orientativo</div>
            <div className="mt-2 text-3xl font-black">{professional ? (score >= 3 ? 'Encaje alto' : 'Encaje profesional') : 'Acceso no orientado a particulares'}</div>
            <p className="mt-4 leading-7 text-white/42">{professional ? 'Tu perfil coincide con el tipo de profesional para el que se ha diseñado AK Cloud. El alta se revisa antes de activarse.' : 'AK Cloud es un servicio B2B. Para trabajos particulares, el contacto debe realizarse directamente con Autokeys Remaps Pro.'}</p>
            {professional ? <Link href={`/register?profile=${profile}`} className="ak-v5-button mt-7 w-full justify-center">Solicitar acceso como profesional <ArrowRight size={18} /></Link> : <a href="https://wa.me/34632982646" target="_blank" rel="noreferrer" className="ak-v5-button-secondary mt-7 w-full justify-center">Contactar con Autokeys</a>}
          </div>
          <div className="mt-4 rounded-2xl border border-white/[.07] bg-white/[.025] p-4 text-xs leading-6 text-white/32">La comprobación es informativa. La aprobación definitiva depende de la revisión del registro profesional.</div>
        </div>
      </div>
    </div>
  )
}
