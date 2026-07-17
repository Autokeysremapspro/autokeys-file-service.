'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Car, Cog, FileUp, Gauge, ScanLine, Send, Sparkles, Truck, Wrench } from 'lucide-react'
import AKPageShell from '@/components/ak/AKPageShell'
import AKUploader from '@/components/ak/AKUploader'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import AKServiceCard, { type AKService } from '@/components/ak/AKServiceCard'
import { crearPedidoFileService } from '@/lib/services/pedidos'
import { supabase } from '@/lib/supabase'
import {
  aplicarReglasPrecios,
  FALLBACK_SERVICIOS,
  FAMILIAS,
  familiaDeCategoria,
  getPlanesActivos,
  getReglasPreciosActivas,
  getServiciosActivos,
  groupServicios,
  labelCategoria,
  type AkCloudPlan,
  type AkCloudReglaPrecio,
  type AkCloudServicio,
  type ServicioCalculado,
} from '@/lib/services/akCloudConfig'

const initialVehicle = { marca: '', modelo: '', motor: '', anio: '', cv: '', cambio: '', ecu: '', hw: '', sw: '', lectura: '' }
type VehicleForm = typeof initialVehicle

const FAMILIA_ICONS: Record<string, any> = {
  'coches-motos': Car,
  'camion-agricola': Truck,
  dsg: Cog,
}

function serviceToCard(service: ServicioCalculado): AKService {
  const price = typeof service.precio_final === 'number' ? service.precio_final : Number(service.precio || service.creditos || 0)
  return {
    id: service.slug,
    name: service.nombre,
    description: service.incluido_por
      ? `${service.descripcion || ''} Incluido por pack: ${service.incluido_por}.`
      : service.descripcion || 'Servicio configurable desde Autokeys Core.',
    price,
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
  const [servicios, setServicios] = useState<AkCloudServicio[]>(FALLBACK_SERVICIOS)
  const [reglas, setReglas] = useState<AkCloudReglaPrecio[]>([])
  const [planGrupos, setPlanGrupos] = useState<string[]>([])
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [sending, setSending] = useState(false)
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
    posible_ecu?: string | null
    hw?: string | null
    sw?: string | null
  }>(null)

  useEffect(() => {
    async function loadConfig() {
      setLoadingConfig(true)
      try {
        const [serviciosData, reglasData] = await Promise.all([getServiciosActivos(), getReglasPreciosActivas()])
        setServicios(serviciosData)
        setReglas(reglasData)

        const { data: authData } = await supabase.auth.getUser()
        const planSlug = authData.user?.user_metadata?.plan_slug || authData.user?.user_metadata?.plan
        if (planSlug) {
          const planes = await getPlanesActivos()
          const plan = planes.find((p: AkCloudPlan) => p.slug === planSlug)
          setPlanGrupos(plan?.grupos_incluidos || [])
        }
      } finally {
        setLoadingConfig(false)
      }
    }
    loadConfig()
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
      // La detección es una ayuda, no un requisito — si falla, el cliente sigue rellenando a mano.
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

  const serviciosCalculados = useMemo(() => aplicarReglasPrecios(servicios, selected, reglas), [servicios, selected, reglas])
  const grupos = useMemo(() => groupServicios(serviciosCalculados), [serviciosCalculados])
  const gruposFamilia = useMemo(
    () => Object.entries(grupos).filter(([categoria]) => familiaDeCategoria(categoria) === familia),
    [grupos, familia],
  )
  const selectedFueraDeFamilia = useMemo(
    () => serviciosCalculados.filter((s) => selected.includes(s.slug) && familiaDeCategoria(s.categoria) !== familia),
    [serviciosCalculados, selected, familia],
  )
  const selectedServices = serviciosCalculados.filter((service) => selected.includes(service.slug))
  const total = useMemo(() => selectedServices.reduce((sum, item) => sum + Number(item.precio_final || 0), 0), [selectedServices])
  const totalBase = useMemo(() => selectedServices.reduce((sum, item) => sum + Number(item.precio || item.creditos || 0), 0), [selectedServices])
  const ahorro = Math.max(0, totalBase - total)

  async function enviarPedido() {
    if (!file) return setError('Sube primero el archivo ORI.')
    if (!vehicle.marca.trim() || !vehicle.modelo.trim()) return setError('Añade al menos marca y modelo del vehículo.')
    if (!vehicle.ecu.trim()) return setError('Añade la ECU. Si no la sabes, escribe “No sé / revisar”.')
    if (selected.length === 0) return setError('Selecciona al menos un servicio.')

    setSending(true)
    setError(null)
    try {
      const result = await crearPedidoFileService({
        ori: file,
        servicios: selectedServices.map((service) => service.nombre),
        serviciosSlugs: selected,
        observaciones,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        motor: vehicle.motor,
        anio: vehicle.anio,
        ecu: vehicle.ecu,
        hw: vehicle.hw,
        sw: vehicle.sw,
        cv: vehicle.cv,
        cambio: vehicle.cambio,
      })

      if (result.requierePago && result.approveUrl) {
        // Hay que pagar antes de crear el pedido — se manda a PayPal, y
        // vuelve automáticamente a /paypal/pedido-completado cuando termine.
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
      subtitle="Sube el ORI, añade los datos técnicos manualmente y selecciona los servicios. Los precios, servicios y packs salen desde Autokeys Core."
      eyebrow="File Service"
    >
      <div className="grid gap-6 2xl:grid-cols-[1fr_430px]">
        <div className="space-y-6">
          <AKCard className="p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-300"><FileUp size={24} /></div>
              <div>
                <h2 className="text-2xl font-black">Archivo ORI</h2>
                <p className="text-sm text-white/40">Formatos recomendados: .bin, .ori, .hex, .mod, .zip.</p>
              </div>
            </div>
            <AKUploader fileName={fileName} onFile={handleFile} compact />

            {detecting && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/60">
                <ScanLine size={18} className="animate-pulse text-red-300" /> Analizando archivo (huella + patrones)...
              </div>
            )}

            {!detecting && detection && (
              <div className={`mt-4 rounded-2xl border p-4 ${detection.identified ? 'border-emerald-500/25 bg-emerald-500/[.06]' : detection.method === 'pista_baja_confianza' ? 'border-amber-500/20 bg-amber-500/[.05]' : 'border-white/10 bg-black/25'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-black">
                    <Sparkles size={16} className={detection.identified ? 'text-emerald-300' : 'text-white/30'} />
                    {detection.identified
                      ? 'ECU detectada automáticamente'
                      : detection.method === 'pista_baja_confianza'
                      ? 'Posible coincidencia — sin confirmar'
                      : 'No se ha podido identificar con confianza'}
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white/50">
                    {detection.method === 'huella_exacta' ? 'Huella exacta' : detection.method === 'heuristica' ? 'Coincidencia por patrones' : detection.method === 'pista_baja_confianza' ? 'Pista débil' : 'Sin coincidencia'} · {detection.confidence}%
                  </span>
                </div>
                {detection.identified && (
                  <>
                    <p className="mt-3 text-sm text-white/55">
                      {[detection.marca, detection.modelo, detection.motor].filter(Boolean).join(' ') || 'Vehículo no identificado'}
                      {detection.ecu ? ` · ECU: ${detection.ecu}` : ''}
                    </p>
                    <button
                      type="button"
                      onClick={aplicarDeteccion}
                      className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/20"
                    >
                      Usar estos datos en el formulario
                    </button>
                  </>
                )}
                {!detection.identified && detection.method === 'pista_baja_confianza' && (
                  <p className="mt-3 text-sm text-white/45">
                    Podría ser un {detection.posible_ecu}, pero no hay suficiente certeza — no se ha encontrado
                    el nombre de la marca en el archivo. Rellena los datos manualmente para no arriesgar un error.
                  </p>
                )}
              </div>
            )}
          </AKCard>

          <AKCard className="p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-300"><Car size={24} /></div>
              <div>
                <h2 className="text-2xl font-black">Datos del vehículo</h2>
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
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-300"><Gauge size={24} /></div>
              <div>
                <h2 className="text-2xl font-black">Datos ECU</h2>
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
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-300"><Wrench size={24} /></div>
              <div>
                <h2 className="text-2xl font-black">Servicios</h2>
                <p className="text-sm text-white/40">Servicios, precios y reglas de packs se actualizan desde Autokeys Core.</p>
              </div>
            </div>
            {loadingConfig ? (
              <div className="rounded-2xl border border-white/10 bg-black/25 p-5 text-sm text-white/45">Cargando configuración desde Core...</div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  {FAMILIAS.map((f) => {
                    const Icon = FAMILIA_ICONS[f.slug] || Wrench
                    const activa = familia === f.slug
                    return (
                      <button
                        key={f.slug}
                        type="button"
                        onClick={() => setFamilia(f.slug)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          activa
                            ? 'border-red-400/45 bg-red-500/10 shadow-[0_0_30px_rgba(217,4,41,.15)]'
                            : 'border-white/10 bg-black/20 hover:border-white/25'
                        }`}
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${activa ? 'bg-red-500/15 text-red-300' : 'bg-white/5 text-white/50'}`}>
                          <Icon size={20} />
                        </div>
                        <p className="mt-3 text-sm font-black uppercase">{f.nombre}</p>
                        <p className="mt-1 text-xs leading-5 text-white/40">{f.descripcion}</p>
                      </button>
                    )
                  })}
                </div>

                {selectedFueraDeFamilia.length > 0 && (
                  <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
                    Tienes {selectedFueraDeFamilia.length} servicio{selectedFueraDeFamilia.length > 1 ? 's' : ''} seleccionado{selectedFueraDeFamilia.length > 1 ? 's' : ''} en otra categoría ({selectedFueraDeFamilia.map((s) => s.nombre).join(', ')}) — siguen incluidos en el resumen del pedido.
                  </div>
                )}

                {gruposFamilia.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-white/40">
                    Todavía no hay servicios publicados en esta categoría.
                  </div>
                ) : gruposFamilia.map(([categoria, items]) => (
                  <div key={categoria}>
                    <h3 className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-white/35">{labelCategoria(categoria)}</h3>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {items.map((service) => (
                        <div key={service.slug} className="relative">
                          <AKServiceCard service={serviceToCard(service)} selected={selected.includes(service.slug)} onToggle={() => toggle(service.slug)} />
                          {service.incluido_por && selected.includes(service.slug) && (
                            <div className="mt-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300">Incluido: {service.incluido_por}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AKCard>
        </div>

        <aside className="space-y-6 2xl:sticky 2xl:top-24 2xl:self-start">
          <AKCard className="p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Resumen</p>
            <h2 className="mt-2 text-3xl font-black">Pedido</h2>
            <div className="mt-5 space-y-3 text-sm">
              <SummaryRow label="Archivo" value={fileName || 'Sin archivo'} />
              <SummaryRow label="Vehículo" value={[vehicle.marca, vehicle.modelo, vehicle.motor].filter(Boolean).join(' ') || 'Pendiente'} />
              <SummaryRow label="ECU" value={vehicle.ecu || 'Pendiente'} />
            </div>
            <div className="mt-5 space-y-2">
              {selectedServices.length === 0 ? <p className="text-sm text-white/35">Sin servicios seleccionados.</p> : selectedServices.map((service) => {
                const fueraDePlan = planGrupos.length > 0 && service.grupo_facturacion && !planGrupos.includes(service.grupo_facturacion)
                return (
                  <div key={service.slug} className="flex items-center justify-between rounded-2xl bg-black/25 px-4 py-3 text-sm">
                    <div>
                      <span>{service.icono || '⚙️'} {service.nombre}</span>
                      {service.incluido_por && <div className="text-xs text-emerald-300">Incluido por pack</div>}
                      {fueraDePlan && <div className="text-xs text-amber-300">Fuera de tu plan — precio completo</div>}
                    </div>
                    <strong className={service.precio_final === 0 ? 'text-emerald-300' : 'text-white'}>{service.precio_final === 0 ? '0 €' : `${Number(service.precio_final).toFixed(2)} €`}</strong>
                  </div>
                )
              })}
            </div>
            <div className="mt-5 rounded-[1.6rem] border border-red-500/20 bg-red-500/10 p-4">
              {ahorro > 0 && <div className="mb-2 flex justify-between text-sm text-emerald-300"><span>Ahorro pack</span><strong>-{ahorro} €</strong></div>}
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/45">Total</span>
                <strong className="text-4xl font-black text-white">{total.toFixed(2)} €</strong>
              </div>
            </div>
            {error && <div className="mt-4 flex gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"><AlertCircle size={18} /> {error}</div>}
            <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="mt-4 min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-red-500/60" placeholder="Observaciones para el técnico..." />
            <AKButton onClick={enviarPedido} disabled={sending} className="mt-4 w-full">
              <Send size={18} /> {sending ? 'Enviando...' : total > 0 ? `Pagar ${total.toFixed(2)} € con PayPal` : 'Enviar pedido (gratis, incluido en tu plan)'}
            </AKButton>
            {total > 0 && !sending && (
              <p className="mt-2 text-center text-xs text-white/35">Te llevaremos a PayPal para completar el pago — el pedido se crea en cuanto se confirme.</p>
            )}
          </AKCard>
        </aside>
      </div>
    </AKPageShell>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-white/35">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-red-500/60" />
    </label>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><span className="text-white/35">{label}</span><strong className="max-w-[220px] truncate text-right text-white/75">{value}</strong></div>
}
