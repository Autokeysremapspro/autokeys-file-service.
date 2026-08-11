'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Bike, Car, Check, ChevronDown, Cog, FileUp, Gauge, ScanLine, Send, Sparkles, Truck, Wrench, ShieldCheck, CheckCircle2, X } from 'lucide-react'
import AKPageShell from '@/components/ak/AKPageShell'
import AKUploader from '@/components/ak/AKUploader'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import AKServiceCard, { type AKService } from '@/components/ak/AKServiceCard'
import { crearPedidoFileService } from '@/lib/services/pedidos'
import {
  FALLBACK_SERVICIOS,
  FAMILIAS,
  familiaDeCategoria,
  getServiciosActivos,
  groupServicios,
  type AkCloudServicio,
  type ServicioConPrecioReal,
} from '@/lib/services/akCloudConfig'

const initialVehicle = { marca: '', modelo: '', motor: '', anio: '', cv: '', cambio: '', ecu: '', hw: '', sw: '', lectura: '' }
type VehicleForm = typeof initialVehicle

const FAMILIA_ICONS: Record<string, any> = {
  coches: Car,
  motos: Bike,
  agricola: Cog,
  camion: Truck,
  especiales: ShieldCheck,
}

function serviceToCard(service: ServicioConPrecioReal): AKService {
  return {
    id: service.slug,
    name: service.nombre,
    description: service.descripcion || 'Servicio configurable desde Autokeys Core.',
    price: service.precio_final,
    icon: service.icono || '⚙️',
    compatible: service.activo !== false,
    category: service.categoria,
  }
}

export default function NuevoPedidoPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [familia, setFamilia] = useState<string>(FAMILIAS[0].slug)
  const [vehicle, setVehicle] = useState<VehicleForm>(initialVehicle)
  const [observaciones, setObservaciones] = useState('')
  const [dtcCodes, setDtcCodes] = useState('')
  const [servicios, setServicios] = useState<AkCloudServicio[]>(FALLBACK_SERVICIOS)
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [sending, setSending] = useState(false)
  const [legalOpen, setLegalOpen] = useState(false)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detecting, setDetecting] = useState(false)
  const [detection, setDetection] = useState<null | {
    identified: boolean
    method: string
    confidence: number
    sha256: string
    vehiculo?: string | null
    marca?: string | null
    modelo?: string | null
    motor?: string | null
    ecu?: string | null
    hw?: string | null
    sw?: string | null
    message?: string | null
    missing_information?: string[]
    evidence?: string[]
    confirmations?: number
  }>(null)

  useEffect(() => {
    async function loadConfig() {
      setLoadingConfig(true)
      try {
        const serviciosData = await getServiciosActivos()
        setServicios(serviciosData)
      } finally {
        setLoadingConfig(false)
      }
    }
    loadConfig()
  }, [])

  useEffect(() => {
    try {
      const handoff = sessionStorage.getItem('ak-intel-handoff')
      if (handoff) {
        setDetection(JSON.parse(handoff))
        sessionStorage.removeItem('ak-intel-handoff')
      }
    } catch {
      // handoff opcional — si falla, el cliente simplemente sube el archivo aquí
    }
  }, [])

  function updateVehicle(key: keyof VehicleForm, value: string) {
    setVehicle((current) => ({ ...current, [key]: value }))
  }

  function handleFile(nextFile: File) {
    setFile(nextFile)
    setFileName(nextFile.name)
    setError(null)
    setDetection(null)
    detectarEcu(nextFile)
  }

  async function detectarEcu(nextFile: File) {
    setDetecting(true)
    try {
      const formData = new FormData()
      formData.append('file', nextFile)
      const res = await fetch('/api/ecu/detect', { method: 'POST', body: formData })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error)
      setDetection(payload)
    } catch {
      setDetection(null)
    } finally {
      setDetecting(false)
    }
  }

  function aplicarDeteccion() {
    if (!detection) return
    setVehicle((current) => ({
      ...current,
      marca: detection.marca || current.marca,
      modelo: detection.modelo || current.modelo,
      motor: detection.motor || current.motor,
      ecu: detection.ecu || current.ecu,
      hw: detection.hw || current.hw,
      sw: detection.sw || current.sw,
    }))
  }

  function toggle(slug: string) {
    setSelected((current) => current.includes(slug) ? current.filter((x) => x !== slug) : [...current, slug])
  }

  const serviciosConPrecioReal: ServicioConPrecioReal[] = useMemo(
    () => servicios.map((s) => ({ ...s, precio_final: Number(s.precio ?? 0), incluido_en_plan: false })),
    [servicios],
  )
  const grupos = useMemo(() => groupServicios(serviciosConPrecioReal), [serviciosConPrecioReal])
  const serviciosDeFamilia = useMemo(() => grupos[familia] || [], [grupos, familia])
  const selectedFueraDeFamilia = useMemo(
    () => serviciosConPrecioReal.filter((s) => selected.includes(s.slug) && familiaDeCategoria(s.categoria) !== familia),
    [serviciosConPrecioReal, selected, familia],
  )
  const selectedServices = serviciosConPrecioReal.filter((service) => selected.includes(service.slug))
  const total = useMemo(() => selectedServices.reduce((sum, item) => sum + Number(item.precio_final || 0), 0), [selectedServices])
  const dtcOffSelected = selected.includes('dtc-off')

  const stepsDone = {
    archivo: Boolean(file),
    vehiculo: Boolean(vehicle.marca.trim() && vehicle.modelo.trim()),
    ecu: Boolean(vehicle.ecu.trim()),
    servicios: selected.length > 0,
  }
  const steps = [
    { label: 'Archivo', done: stepsDone.archivo },
    { label: 'Vehículo', done: stepsDone.vehiculo },
    { label: 'ECU', done: stepsDone.ecu },
    { label: 'Servicios', done: stepsDone.servicios },
    { label: 'Revisar y enviar', done: stepsDone.archivo && stepsDone.vehiculo && stepsDone.ecu && stepsDone.servicios && legalAccepted },
  ]

  async function enviarPedido() {
    if (!legalAccepted) { setLegalOpen(true); return }
    if (!file) return setError('Sube primero el archivo ORI.')
    if (!vehicle.marca.trim() || !vehicle.modelo.trim()) return setError('Añade al menos marca y modelo del vehículo.')
    if (!vehicle.ecu.trim()) return setError('Añade la ECU. Si no la sabes, escribe “No sé / revisar”.')
    if (selected.length === 0) return setError('Selecciona al menos un servicio.')
    if (dtcOffSelected) {
      const matches = dtcCodes.toUpperCase().match(/\b[PCBU][0-9A-F]{4,5}\b/g) || []
      if (matches.length === 0) return setError('Para DTC OFF indica los códigos a eliminar separados por comas, por ejemplo P0401, P2002.')
    }

    setSending(true)
    setError(null)
    try {
      const result = await crearPedidoFileService({
        ori: file,
        servicios: selectedServices.map((service) => service.nombre),
        serviciosSlugs: selected,
        observaciones,
        dtcCodes: dtcOffSelected ? dtcCodes : undefined,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        motor: vehicle.motor,
        anio: vehicle.anio,
        ecu: vehicle.ecu,
        hw: vehicle.hw,
        sw: vehicle.sw,
        cv: vehicle.cv,
        cambio: vehicle.cambio,
        legalAccepted: true,
        legalVersion: 'AKCLOUD-LEGAL-2026-07-17',
      })

      if (result.requierePago && result.approveUrl) {
        window.location.href = result.approveUrl
        return
      }

      if (result.pedido) {
        router.push(`/pedidos/${result.pedido.id}`)
      }
    } catch (err: any) {
      setError(err?.message || 'No se pudo crear el pedido')
    } finally {
      setSending(false)
    }
  }

  return (
    <AKPageShell
      title="Nuevo pedido"
      subtitle="Sube el ORI, añade los datos técnicos manualmente y elige los servicios por vehículo. Pagas solo lo que pidas."
      eyebrow="File Service"
    >
      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {steps.map((step, index) => (
          <div
            key={step.label}
            className={`flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              step.done
                ? 'border-red-400/35 bg-red-400/[.09] text-red-300'
                : 'border-white/10 bg-black/25 text-white/45'
            }`}
          >
            <span className={`ak-mono grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] ${step.done ? 'bg-red-400 text-[#0a0d12]' : 'bg-white/10 text-white/50'}`}>
              {step.done ? <Check size={13} /> : index + 1}
            </span>
            <span className="truncate">{step.label}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1fr_430px]">
        <div className="space-y-6">
          <AKCard className="p-5 md:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/25 bg-red-400/10 text-red-300"><FileUp size={24} /></div>
                <div>
                  <h2 className="text-2xl font-bold">Archivo ORI</h2>
                  <p className="text-sm text-white/40">Formatos recomendados: .bin, .ori, .hex, .mod, .zip.</p>
                </div>
              </div>
              <Link href="/intelligence" className="hidden shrink-0 items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-cyan-300 transition hover:bg-cyan-400/20 sm:flex">
                <Sparkles size={14}/> Analizar antes con AK Intelligence
              </Link>
            </div>
            <AKUploader fileName={fileName} onFile={handleFile} compact />

            {detecting && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/60">
                <ScanLine size={18} className="animate-pulse text-[#5eead4]" /> Analizando archivo (huella + patrones)...
              </div>
            )}

            {!detecting && detection && (
              <div className={`mt-4 rounded-2xl border p-4 ${detection.identified ? 'border-emerald-500/25 bg-emerald-500/[.06]' : 'border-amber-500/25 bg-amber-500/[.06]'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    {detection.identified ? <Sparkles size={16} className="text-emerald-300" /> : <AlertCircle size={16} className="text-amber-300" />}
                    {detection.identified ? 'ECU identificada con evidencia verificada' : 'ECU NO IDENTIFICADA — añadir información faltante'}
                  </div>
                  <span className="ak-mono rounded-full border border-white/10 bg-white/[.04] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/50">
                    {detection.method === 'huella_exacta_confirmada' ? 'Huella exacta confirmada' : detection.method === 'firma_verificada' ? 'Firma verificada' : 'Sin identificación'}
                  </span>
                </div>
                {detection.identified ? (
                  <>
                    <p className="mt-3 text-sm text-white/60">
                      {[detection.marca, detection.modelo, detection.motor].filter(Boolean).join(' ') || 'Vehículo pendiente'}
                      {detection.ecu ? ` · ECU: ${detection.ecu}` : ''}
                    </p>
                    {detection.evidence?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {detection.evidence.map((item) => <span key={item} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-200">{item}</span>)}
                      </div>
                    ) : null}
                    <button type="button" onClick={aplicarDeteccion} className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/20">
                      Usar datos verificados
                    </button>
                  </>
                ) : (
                  <>
                    <p className="mt-3 text-sm text-white/55">El sistema no asignará otra ECU por aproximación. Completa los datos técnicos para que el laboratorio pueda validarla correctamente.</p>
                    {(detection.hw || detection.sw) && <p className="mt-2 text-xs text-white/40">Extraído del archivo: {detection.hw ? `HW ${detection.hw}` : ''}{detection.hw && detection.sw ? ' · ' : ''}{detection.sw ? `SW ${detection.sw}` : ''}</p>}
                    {detection.missing_information?.length ? (
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {detection.missing_information.map((item) => <div key={item} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/55"><AlertCircle size={14} className="text-amber-300" />{item}</div>)}
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            )}
          </AKCard>

          <AKCard className="p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/25 bg-red-400/10 text-red-300"><Car size={24} /></div>
              <div>
                <h2 className="text-2xl font-bold">Datos del vehículo</h2>
                <p className="text-sm text-white/40">Estos datos los introduce el cliente manualmente. Nada de detección automática forzada.</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Marca *" value={vehicle.marca} onChange={(v) => updateVehicle('marca', v)} placeholder="BMW, Audi, VW..." />
              <Field label="Modelo *" value={vehicle.modelo} onChange={(v) => updateVehicle('modelo', v)} placeholder="320d, A4, Golf 7..." />
              <Field label="Motor" value={vehicle.motor} onChange={(v) => updateVehicle('motor', v)} placeholder="2.0 TDI, 3.0d..." />
              <Field label="Año" value={vehicle.anio} onChange={(v) => updateVehicle('anio', v)} placeholder="2017" />
              <Field label="Potencia" value={vehicle.cv} onChange={(v) => updateVehicle('cv', v)} placeholder="150 cv" />
              <Field label="Cambio" value={vehicle.cambio} onChange={(v) => updateVehicle('cambio', v)} placeholder="Manual, DSG, ZF..." />
            </div>
          </AKCard>

          <AKCard className="p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/25 bg-red-400/10 text-red-300"><Gauge size={24} /></div>
              <div>
                <h2 className="text-2xl font-bold">Datos ECU</h2>
                <p className="text-sm text-white/40">El cliente rellena ECU / HW / SW manualmente. Si no lo sabe, puede escribir “revisar”.</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="ECU *" value={vehicle.ecu} onChange={(v) => updateVehicle('ecu', v)} placeholder="EDC17C64, MD1CS003..." />
              <Field label="Hardware" value={vehicle.hw} onChange={(v) => updateVehicle('hw', v)} placeholder="HW / Bosch / referencia" />
              <Field label="Software" value={vehicle.sw} onChange={(v) => updateVehicle('sw', v)} placeholder="SW / versión" />
              <Field label="Herramienta lectura" value={vehicle.lectura} onChange={(v) => updateVehicle('lectura', v)} placeholder="KESS3, FLEX, Autotuner..." />
            </div>
          </AKCard>

          <AKCard className="p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/25 bg-red-400/10 text-red-300"><Wrench size={24} /></div>
              <div>
                <h2 className="text-2xl font-bold">Servicios</h2>
                <p className="text-sm text-white/40">Elige el tipo de vehículo y selecciona los servicios — el precio de cada uno se cobra por archivo.</p>
              </div>
            </div>

            {loadingConfig ? (
              <div className="rounded-2xl border border-white/10 bg-black/25 p-5 text-sm text-white/45">Cargando catálogo desde Core...</div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {FAMILIAS.map((f) => {
                    const Icon = FAMILIA_ICONS[f.slug] || Wrench
                    const activa = familia === f.slug
                    const count = (grupos[f.slug] || []).length
                    return (
                      <button
                        key={f.slug}
                        type="button"
                        onClick={() => setFamilia(f.slug)}
                        className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                          activa
                            ? 'border-red-400/45 bg-red-400/[.12] text-white shadow-[0_0_28px_rgba(255,66,90,.18)]'
                            : 'border-white/10 bg-black/20 text-white/55 hover:border-white/25 hover:text-white'
                        }`}
                      >
                        <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${activa ? 'bg-red-400/20 text-red-300' : 'bg-white/5 text-white/45'}`}>
                          <Icon size={16} />
                        </span>
                        {f.nombre}
                        <span className={`ak-mono rounded-full px-1.5 py-0.5 text-[10px] ${activa ? 'bg-red-400/25 text-red-300' : 'bg-white/5 text-white/30'}`}>{count}</span>
                        <ChevronDown size={14} className={`transition-transform ${activa ? 'rotate-180 text-red-300' : 'text-white/30'}`} />
                      </button>
                    )
                  })}
                </div>

                {selectedFueraDeFamilia.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
                    <span className="font-bold">También en tu pedido, de otra categoría:</span>
                    {selectedFueraDeFamilia.map((s) => (
                      <button
                        key={s.slug}
                        type="button"
                        onClick={() => toggle(s.slug)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-500/10 px-2.5 py-1 font-semibold hover:bg-amber-500/20"
                      >
                        {s.nombre} <X size={12} />
                      </button>
                    ))}
                  </div>
                )}

                <div key={familia} className="ak-expand-in rounded-[1.6rem] border border-white/10 bg-black/20 p-4 sm:p-5">
                  {serviciosDeFamilia.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-white/40">
                      Todavía no hay servicios publicados en esta categoría.
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {serviciosDeFamilia.map((service) => (
                        <AKServiceCard key={service.slug} service={serviceToCard(service)} selected={selected.includes(service.slug)} onToggle={() => toggle(service.slug)} />
                      ))}
                    </div>
                  )}
                </div>

                {dtcOffSelected && (
                  <div className="rounded-[1.6rem] border border-amber-400/30 bg-amber-500/[.07] p-4 sm:p-5">
                    <label className="block">
                      <span className="ak-mono mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-amber-300">DTC a eliminar *</span>
                      <input
                        value={dtcCodes}
                        onChange={(e) => setDtcCodes(e.target.value.toUpperCase())}
                        placeholder="P0401, P2002, U0100"
                        className="w-full rounded-2xl border border-amber-400/25 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/70"
                      />
                    </label>
                    <p className="mt-2 text-xs leading-5 text-white/45">Introduce únicamente los códigos DTC que deseas solicitar, separados por comas. Ejemplo: P0401, P2002, P2453.</p>
                  </div>
                )}
              </div>
            )}
          </AKCard>
        </div>

        <aside className="space-y-6 2xl:sticky 2xl:top-24 2xl:self-start">
          <AKCard className="p-6">
            <p className="ak-mono text-xs font-bold uppercase tracking-[0.22em] text-red-300">Resumen</p>
            <h2 className="mt-2 text-3xl font-bold">Pedido</h2>
            <div className="mt-5 space-y-3 text-sm">
              <SummaryRow label="Archivo" value={fileName || 'Sin archivo'} />
              <SummaryRow label="Vehículo" value={[vehicle.marca, vehicle.modelo, vehicle.motor].filter(Boolean).join(' ') || 'Pendiente'} />
              <SummaryRow label="ECU" value={vehicle.ecu || 'Pendiente'} />
              {dtcOffSelected && <SummaryRow label="DTC OFF" value={dtcCodes.trim() || 'Pendiente'} />}
            </div>
            <div className="mt-5 space-y-2">
              {selectedServices.length === 0 ? <p className="text-sm text-white/35">Sin servicios seleccionados.</p> : selectedServices.map((service) => (
                <div key={service.slug} className="flex items-center justify-between gap-3 rounded-2xl bg-black/25 px-4 py-3 text-sm">
                  <span className="truncate">{service.icono || '⚙️'} {service.nombre}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <strong className="ak-mono text-white">{Number(service.precio_final).toFixed(2)} €</strong>
                    <button type="button" onClick={() => toggle(service.slug)} aria-label={`Quitar ${service.nombre}`} className="text-white/30 hover:text-white/70"><X size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-[1.6rem] border border-red-400/25 bg-red-400/[.08] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Total a pagar</span>
                <strong className="ak-mono text-4xl font-bold text-white">{total.toFixed(2)} €</strong>
              </div>
            </div>
            {error && <div className="mt-4 flex gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"><AlertCircle size={18} /> {error}</div>}
            <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="mt-4 min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-red-400/60" placeholder="Observaciones para el técnico..." />
            <button type="button" onClick={()=>setLegalOpen(true)} className={`mt-4 flex w-full items-center gap-3 rounded-2xl border p-4 text-left ${legalAccepted ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-amber-500/30 bg-amber-500/10'}`}>
              {legalAccepted ? <CheckCircle2 className="text-emerald-300"/> : <ShieldCheck className="text-amber-300"/>}
              <div><div className="font-bold">{legalAccepted ? 'Condiciones aceptadas' : 'Debes aceptar las condiciones'}</div><div className="text-xs text-white/45">Uso legal, responsabilidad del cliente y posible restricción en vía pública.</div></div>
            </button>
            <AKButton onClick={enviarPedido} disabled={sending || !legalAccepted} className="mt-4 w-full">
              <Send size={18} /> {sending ? 'Enviando...' : total > 0 ? `Pagar ${total.toFixed(2)} € con PayPal` : 'Enviar pedido (sin coste)'}
            </AKButton>
            {total > 0 && !sending && (
              <p className="mt-2 text-center text-xs text-white/35">Te llevaremos a PayPal para completar el pago — el pedido se crea en cuanto se confirme.</p>
            )}
          </AKCard>
        </aside>
      </div>
      {legalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-[2rem] border border-white/10 bg-[#0b0e14] p-6 shadow-2xl md:p-8">
            <div className="flex items-start gap-4"><div className="rounded-2xl bg-amber-500/10 p-3 text-amber-300"><ShieldCheck size={28}/></div><div><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">Aviso obligatorio</p><h2 className="mt-1 text-3xl font-bold">Condiciones de uso del servicio</h2></div></div>
            <div className="mt-6 space-y-4 text-sm leading-7 text-white/65">
              <p>Las soluciones suministradas se destinan exclusivamente a usos permitidos por la legislación aplicable, como competición, investigación, desarrollo, diagnóstico, exportación o utilización fuera de vías públicas cuando corresponda.</p>
              <p>El cliente declara que dispone de autorización para solicitar el servicio y que verificará la legalidad de la instalación y del uso en su país o jurisdicción.</p>
              <p>Determinadas modificaciones pueden ser ilegales en vehículos que circulen por vías públicas o estén sujetos a normativa de emisiones, seguridad, homologación o inspección técnica.</p>
              <p>El cliente asume la responsabilidad exclusiva por el uso, instalación, comercialización y consecuencias de los archivos entregados. Autokeys Remaps Pro actúa únicamente como proveedor técnico del servicio solicitado.</p>
            </div>
            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/25 p-4"><input type="checkbox" checked={legalAccepted} onChange={(e)=>setLegalAccepted(e.target.checked)} className="mt-1 h-5 w-5"/><span className="font-semibold">He leído, comprendo y acepto estas condiciones y asumo la responsabilidad del uso solicitado.</span></label>
            <div className="mt-6 flex gap-3">
              <button onClick={()=>setLegalOpen(false)} className="flex-1 rounded-2xl border border-white/10 px-4 py-3 font-bold">Cancelar</button>
              <button disabled={!legalAccepted} onClick={()=>setLegalOpen(false)} className="flex-1 rounded-2xl bg-gradient-to-r from-[#c9102b] to-[#ff425a] px-4 py-3 font-bold text-white disabled:opacity-40">Aceptar y continuar</button>
            </div>
          </div>
        </div>
      )}
    </AKPageShell>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="ak-mono mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/35">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-red-400/60" />
    </label>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><span className="text-white/35">{label}</span><strong className="max-w-[220px] truncate text-right text-white/75">{value}</strong></div>
}
