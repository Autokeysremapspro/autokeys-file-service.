'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock3, FileUp, Gauge, Wrench } from 'lucide-react'

const services = [
  { id: 'stage1', label: 'Stage 1', price: 35 },
  { id: 'egr', label: 'EGR OFF', price: 20 },
  { id: 'dpf', label: 'DPF OFF', price: 25 },
  { id: 'adblue', label: 'AdBlue OFF', price: 30 },
]

export default function AkOrderSimulator() {
  const [selected, setSelected] = useState<string[]>(['stage1'])
  const total = useMemo(() => services.filter(item => selected.includes(item.id)).reduce((sum, item) => sum + item.price, 0), [selected])

  function toggle(id: string) {
    setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])
  }

  return (
    <div className="ak-v5-glass overflow-hidden rounded-[34px]">
      <div className="grid lg:grid-cols-[1.05fr_.95fr]">
        <div className="p-7 sm:p-10">
          <div className="ak-v5-kicker">Simulador de pedido</div>
          <h3 className="ak-v5-title mt-4 text-4xl sm:text-5xl">Comprueba lo sencillo que es.</h3>
          <p className="mt-4 max-w-xl leading-7 text-white/42">Ejemplo orientativo para visualizar el flujo. Los precios reales se muestran dentro de cada pedido según vehículo, ECU y solución.</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {services.map(service => {
              const active = selected.includes(service.id)
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggle(service.id)}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${active ? 'border-[#e5a05d]/45 bg-[#e5a05d]/10' : 'border-white/[.07] bg-black/20 hover:border-white/15'}`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`grid h-9 w-9 place-items-center rounded-xl border ${active ? 'border-[#e5a05d]/30 bg-[#e5a05d]/10 text-[#ffd09a]' : 'border-white/[.08] text-white/35'}`}><Wrench size={17} /></span>
                    <span>
                      <span className="block font-bold">{service.label}</span>
                      <span className="text-xs text-white/30">Desde {service.price} €</span>
                    </span>
                  </span>
                  <span className={`grid h-6 w-6 place-items-center rounded-full border ${active ? 'border-[#67e8d1]/30 bg-[#67e8d1]/10 text-[#67e8d1]' : 'border-white/10 text-transparent'}`}><CheckCircle2 size={15} /></span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-t border-white/[.07] bg-black/25 p-7 sm:p-10 lg:border-l lg:border-t-0">
          <div className="rounded-3xl border border-white/[.08] bg-[#0a0d13] p-5">
            <div className="flex items-center justify-between border-b border-white/[.06] pb-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[.2em] text-white/30">Pedido de ejemplo</div>
                <div className="mt-1 font-bold">Volkswagen Golf · Bosch EDC17</div>
              </div>
              <FileUp className="text-[#e5a05d]" />
            </div>
            <div className="mt-5 space-y-3">
              {selected.length === 0 ? <p className="text-sm text-white/35">Selecciona al menos una solución.</p> : services.filter(item => selected.includes(item.id)).map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm"><span className="text-white/55">{item.label}</span><span className="font-bold">{item.price.toFixed(2)} €</span></div>
              ))}
            </div>
            <div className="mt-6 border-t border-white/[.08] pt-5">
              <div className="flex items-end justify-between">
                <div><div className="text-[10px] uppercase tracking-[.18em] text-white/30">Total orientativo</div><div className="mt-1 text-xs text-white/25">Sin comprar créditos</div></div>
                <div className="text-4xl font-black text-[#ffd09a]">{total.toFixed(2)} €</div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4"><Clock3 size={18} className="text-[#67e8d1]" /><div className="mt-3 text-xs font-bold">Seguimiento</div><div className="mt-1 text-[11px] text-white/30">Estado y versiones</div></div>
            <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4"><Gauge size={18} className="text-[#e5a05d]" /><div className="mt-3 text-xs font-bold">Precio real</div><div className="mt-1 text-[11px] text-white/30">Visible antes de enviar</div></div>
          </div>

          <Link href="/register" className="ak-v5-button mt-5 w-full justify-center">Crear cuenta profesional <ArrowRight size={18} /></Link>
        </div>
      </div>
    </div>
  )
}
