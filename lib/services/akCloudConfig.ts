import { supabase } from '@/lib/supabase'

export type AkCloudServicio = {
  id?: string
  nombre: string
  slug: string
  categoria: string
  grupo_facturacion?: string | null
  descripcion?: string | null
  precio: number
  creditos: number
  icono?: string | null
  activo?: boolean | null
  orden?: number | null
}

export type AkCloudPlan = {
  id?: string
  nombre: string
  slug: string
  descripcion?: string | null
  precio_mensual: number
  creditos_mes: number
  ventajas?: string[] | null
  destacado?: boolean | null
  activo?: boolean | null
  orden?: number | null
  duracion_dias?: number | null
  limite_diario_pedidos?: number | null
}

export type AkCloudMetodoPago = {
  id?: string
  codigo: string
  nombre: string
  descripcion?: string | null
  activo?: boolean | null
  automatico?: boolean | null
  instrucciones?: string | null
  orden?: number | null
}

export type PlanServicioOverride = {
  servicio_id: string
  incluido: boolean
  precio_override: number | null
}

// Precio REAL de un pedido: se basa únicamente en "Servicios por plan"
// (akcloud_plan_servicios), que es lo mismo que usa /api/pedidos/crear
// en el servidor para cobrar. Así lo que ve el distribuidor en pantalla
// coincide siempre con lo que se le cobra.
export async function getPlanServiciosDe(planId: string): Promise<PlanServicioOverride[]> {
  const { data, error } = await supabase
    .from('akcloud_plan_servicios')
    .select('servicio_id, incluido, precio_override')
    .eq('plan_id', planId)

  if (error || !data) return []
  return data as PlanServicioOverride[]
}

export type ServicioConPrecioReal = AkCloudServicio & {
  precio_final: number
  incluido_en_plan: boolean
}

export function aplicarPrecioReal(
  servicios: AkCloudServicio[],
  planServiciosMap: Map<string, PlanServicioOverride>,
): ServicioConPrecioReal[] {
  return servicios.map((servicio) => {
    const override = servicio.id ? planServiciosMap.get(servicio.id) : undefined
    if (override?.incluido) {
      return { ...servicio, precio_final: Number(override.precio_override ?? 0), incluido_en_plan: true }
    }
    return { ...servicio, precio_final: Number(servicio.precio ?? servicio.creditos ?? 0), incluido_en_plan: false }
  })
}

export const FALLBACK_SERVICIOS: AkCloudServicio[] = [
  { nombre: 'Stage 1', slug: 'stage-1', categoria: 'Reprogramación', descripcion: 'Optimización de potencia segura para uso diario.', precio: 40, creditos: 40, icono: '🚀', orden: 10 },
  { nombre: 'Stage 2', slug: 'stage-2', categoria: 'Reprogramación', descripcion: 'Calibración avanzada para vehículos con hardware modificado.', precio: 65, creditos: 65, icono: '🏁', orden: 20 },
  { nombre: 'DPF OFF', slug: 'dpf-off', categoria: 'Anticontaminación', descripcion: 'Solución para sistema DPF según solicitud del profesional.', precio: 35, creditos: 35, icono: '🚫', orden: 30 },
  { nombre: 'EGR OFF', slug: 'egr-off', categoria: 'Anticontaminación', descripcion: 'Solución para sistema EGR según solicitud del profesional.', precio: 25, creditos: 25, icono: '🌿', orden: 40 },
  { nombre: 'AdBlue OFF', slug: 'adblue-off', categoria: 'Anticontaminación', descripcion: 'Solución SCR / AdBlue.', precio: 45, creditos: 45, icono: '💧', orden: 50 },
  { nombre: 'DTC OFF', slug: 'dtc-off', categoria: 'Opciones técnicas', descripcion: 'Desactivación de códigos específicos bajo solicitud.', precio: 20, creditos: 20, icono: '⚠️', orden: 60 },
  { nombre: 'IMMO OFF', slug: 'immo-off', categoria: 'Electrónica', descripcion: 'Solución inmovilizador para trabajos de laboratorio.', precio: 50, creditos: 50, icono: '🔑', orden: 70 },
  { nombre: 'Pops & Bangs', slug: 'pops-bangs', categoria: 'Opciones racing', descripcion: 'Configuración de petardeo bajo solicitud.', precio: 30, creditos: 30, icono: '💥', orden: 80 },
  { nombre: 'Hardcut', slug: 'hardcut', categoria: 'Opciones racing', descripcion: 'Limitador tipo hardcut según configuración solicitada.', precio: 25, creditos: 25, icono: '🍿', orden: 90 },
  { nombre: 'Launch Control', slug: 'launch-control', categoria: 'Opciones racing', descripcion: 'Salida asistida bajo configuración técnica.', precio: 30, creditos: 30, icono: '🏁', orden: 100 },
  { nombre: 'Reset adaptaciones DSG', slug: 'dsg-reset', categoria: 'dsg', descripcion: 'Reset de adaptaciones de caja DSG bajo solicitud.', precio: 40, creditos: 40, icono: '⚙️', orden: 110 },
  { nombre: 'Reprogramación Agrícola', slug: 'agricola-reprog', categoria: 'agricola', descripcion: 'Optimización para maquinaria agrícola bajo solicitud.', precio: 80, creditos: 80, icono: '🚜', orden: 120 },
  { nombre: 'Reprogramación Camión', slug: 'camion-reprog', categoria: 'camion', descripcion: 'Optimización para vehículo pesado bajo solicitud.', precio: 90, creditos: 90, icono: '🚛', orden: 130 },
]

export const FALLBACK_PLANES: AkCloudPlan[] = [
  { nombre: 'Starter', slug: 'starter', descripcion: 'Para trabajos puntuales.', precio_mensual: 50, creditos_mes: 50, ventajas: ['50 créditos', 'Soporte estándar'], destacado: false, orden: 10 },
  { nombre: 'Professional', slug: 'pro', descripcion: 'El pack más equilibrado para talleres activos.', precio_mensual: 110, creditos_mes: 120, ventajas: ['120 créditos', 'Soporte preferente'], destacado: true, orden: 20 },
  { nombre: 'Business', slug: 'business', descripcion: 'Para distribuidores con volumen semanal.', precio_mensual: 260, creditos_mes: 300, ventajas: ['300 créditos', 'Prioridad'], destacado: false, orden: 30 },
]

export const FALLBACK_METODOS: AkCloudMetodoPago[] = [
  { codigo: 'paypal', nombre: 'PayPal / Tarjeta', descripcion: 'Pago automático mediante PayPal Checkout.', automatico: true, instrucciones: 'El pago se confirma automáticamente.', orden: 10 },
  { codigo: 'bizum', nombre: 'Bizum', descripcion: 'Pago manual mediante Bizum.', automatico: false, instrucciones: 'Haz Bizum al número indicado por Autokeys y añade la referencia.', orden: 20 },
  { codigo: 'transferencia', nombre: 'Transferencia', descripcion: 'Pago manual por transferencia.', automatico: false, instrucciones: 'Indica tu email de AK Cloud como concepto.', orden: 30 },
]

export type AkCloudNovedad = {
  id?: string
  titulo: string
  contenido?: string | null
  icono?: string | null
  activo?: boolean | null
  destacado?: boolean | null
  orden?: number | null
  publicado_en?: string | null
  created_at?: string | null
}

export const CATEGORIA_LABELS: Record<string, string> = {
  reprogramacion: 'Reprogramación',
  anticontaminacion: 'Anticontaminación',
  opciones: 'Opciones',
  electronica: 'Electrónica',
  agricola: 'Agrícola',
  camion: 'Camión',
  dsg: 'DSG',
  otros: 'Otros',
}

export function labelCategoria(categoria: string) {
  return CATEGORIA_LABELS[categoria] || categoria
}

export type Familia = {
  slug: string
  nombre: string
  descripcion: string
  icono: string
  categorias: string[]
}

// Agrupación de más alto nivel que la "categoría" del servicio, pensada
// para el primer paso de "Nuevo pedido": el distribuidor elige primero
// el tipo de vehículo y solo entonces ve los servicios de esa familia.
// Cualquier categoría que no esté listada aquí cae en "coches-motos"
// por defecto (ver familiaDeCategoria), así nunca desaparece un servicio
// nuevo por olvido de actualizar este mapa.
export const FAMILIAS: Familia[] = [
  {
    slug: 'coches-motos',
    nombre: 'Coches / Motos',
    descripcion: 'Reprogramación, anticontaminación, electrónica y opciones',
    icono: '🚗',
    categorias: ['reprogramacion', 'anticontaminacion', 'opciones', 'electronica', 'otros'],
  },
  {
    slug: 'camion-agricola',
    nombre: 'Camión / Agrícola',
    descripcion: 'Soluciones para maquinaria pesada y agrícola',
    icono: '🚜',
    categorias: ['camion', 'agricola'],
  },
  {
    slug: 'dsg',
    nombre: 'DSG',
    descripcion: 'Cambios automáticos y doble embrague',
    icono: '⚙️',
    categorias: ['dsg'],
  },
]

export function familiaDeCategoria(categoria: string): string {
  const match = FAMILIAS.find((f) => f.categorias.includes(categoria))
  return match?.slug || 'coches-motos'
}

function sortByOrden<T extends { orden?: number | null }>(items: T[]) {
  return [...items].sort((a, b) => Number(a.orden || 999) - Number(b.orden || 999))
}

export async function getServiciosActivos(): Promise<AkCloudServicio[]> {
  const { data, error } = await supabase
    .from('akcloud_servicios')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })

  if (error || !data?.length) return FALLBACK_SERVICIOS
  return sortByOrden(data.map((item: any) => ({
    ...item,
    categoria: item.categoria || 'General',
    precio: Number(item.precio || item.creditos || 0),
    creditos: Number(item.creditos || item.precio || 0),
  })))
}

export async function getPlanesActivos(): Promise<AkCloudPlan[]> {
  const { data, error } = await supabase
    .from('akcloud_planes')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })

  if (error || !data?.length) return FALLBACK_PLANES
  return sortByOrden(data.map((item: any) => ({
    ...item,
    precio_mensual: Number(item.precio_mensual || 0),
    creditos_mes: Number(item.creditos_mes || 0),
    ventajas: Array.isArray(item.ventajas) ? item.ventajas : [],
  })))
}

export async function getMetodosPagoActivos(): Promise<AkCloudMetodoPago[]> {
  const { data, error } = await supabase
    .from('akcloud_metodos_pago')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })

  if (error || !data?.length) return FALLBACK_METODOS
  return sortByOrden(data)
}

export async function getNovedadesActivas(): Promise<AkCloudNovedad[]> {
  const { data, error } = await supabase
    .from('akcloud_novedades')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data as AkCloudNovedad[]
}

export function groupServicios<T extends AkCloudServicio>(servicios: T[]) {
  return servicios.reduce<Record<string, T[]>>((acc, servicio) => {
    const key = servicio.categoria || 'General'
    acc[key] = acc[key] || []
    acc[key].push(servicio)
    return acc
  }, {})
}
