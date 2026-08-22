'use client'

import { useEffect, useState } from 'react'
import { X, Wrench } from 'lucide-react'

type TechMeta = {
  metodoLectura: string
  archivoOrigen: string
  modificacionesHardware: string
}

const EMPTY: TechMeta = { metodoLectura: '', archivoOrigen: 'ORI', modificacionesHardware: '' }
const KEY = 'ak-order-tech'

export default function AKOrderTechnicalMetadata() {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<TechMeta>(EMPTY)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY)
      if (raw) setData({ ...EMPTY, ...JSON.parse(raw) })
    } catch {}
  }, [])

  function update<K extends keyof TechMeta>(key: K, value: TechMeta[K]) {
    const next = { ...data, [key]: value }
    setData(next)
    try { sessionStorage.setItem(KEY, JSON.stringify(next)) } catch {}
  }

  const complete = Boolean(data.metodoLectura && data.archivoOrigen)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[70] flex items-center gap-2 rounded-2xl border border-red-400/30 bg-[#11151d]/95 px-4 py-3 text-sm font-bold text-white shadow-2xl backdrop-blur hover:border-red-400/60"
      >
        <Wrench size={17} className="text-red-300" />
        Datos de lectura
        <span className={`h-2 w-2 rounded-full ${complete ? 'bg-emerald-400' : 'bg-amber-400'}`} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#0a0b0d] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[.2em] text-red-300">Información técnica</p>
                <h2 className="mt-1 text-2xl font-bold text-white">Datos de lectura del archivo</h2>
                <p className="mt-2 text-sm text-white/45">La herramienta se indica en “Datos ECU”. Completa aquí el método, el origen del archivo y cualquier modificación del vehículo.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-white/10 p-2 text-white/50 hover:text-white"><X size={18}/></button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/40">Método de lectura</span>
                <select value={data.metodoLectura} onChange={(e) => update('metodoLectura', e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-red-400/60">
                  <option value="">Seleccionar…</option>
                  <option value="OBD">OBD</option>
                  <option value="BENCH">Bench</option>
                  <option value="BOOT">Boot</option>
                  <option value="BDM">BDM</option>
                  <option value="JTAG">JTAG</option>
                  <option value="OTRO">Otro</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/40">Archivo enviado</span>
                <select value={data.archivoOrigen} onChange={(e) => update('archivoOrigen', e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-red-400/60">
                  <option value="ORI">Original (ORI)</option>
                  <option value="MODIFICADO">Ya modificado</option>
                  <option value="DESCONOCIDO">No estoy seguro</option>
                </select>
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/40">Modificaciones de hardware</span>
              <textarea value={data.modificacionesHardware} onChange={(e) => update('modificacionesHardware', e.target.value)} placeholder="Ej.: turbo híbrido, downpipe, inyectores, admisión…" className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-red-400/60" />
            </label>

            {data.archivoOrigen === 'MODIFICADO' && !data.modificacionesHardware.trim() && (
              <div className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">Indica qué cambios contiene el archivo o qué hardware monta el vehículo para que el laboratorio pueda valorarlo correctamente.</div>
            )}

            <button type="button" onClick={() => setOpen(false)} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#b8090f] to-[#ef1018] px-4 py-3 font-bold text-white">Guardar datos</button>
          </div>
        </div>
      )}
    </>
  )
}
