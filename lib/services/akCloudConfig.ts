import { supabase } from '@/lib/supabase'

export type AkCloudServicio = {
  id?: string
  nombre: string
  slug: string
  categoria: string
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

// Catálogo de servicios de AK Cloud, organizado por las 5 categorías de
// negocio (coches, motos, agricola, camion, especiales). Esta es la lista
// que se usa si Supabase no responde; la real vive en akcloud_servicios
// (ver migración v25_categorias_precios_file_service.sql).
export const FALLBACK_SERVICIOS: AkCloudServicio[] = [
  // --- COCHES ---
  { nombre: 'Stage 1', slug: 'stage-1-coche', categoria: 'coches', descripcion: 'Optimización de potencia segura para uso diario.', precio: 35, creditos: 35, icono: '🚀', orden: 10 },
  { nombre: 'Stage 2', slug: 'stage-2-coche', categoria: 'coches', descripcion: 'Calibración avanzada para vehículos con hardware modificado.', precio: 55, creditos: 55, icono: '🏁', orden: 20 },
  { nombre: 'DPF OFF', slug: 'dpf-off-coche', categoria: 'coches', descripcion: 'Solución para sistema DPF según solicitud del profesional.', precio: 30, creditos: 30, icono: '🚫', orden: 30 },
  { nombre: 'EGR OFF', slug: 'egr-off-coche', categoria: 'coches', descripcion: 'Solución para sistema EGR según solicitud del profesional.', precio: 30, creditos: 30, icono: '🌿', orden: 40 },
  { nombre: 'AdBlue OFF', slug: 'adblue-off-coche', categoria: 'coches', descripcion: 'Solución SCR / AdBlue.', precio: 30, creditos: 30, icono: '💧', orden: 50 },
  { nombre: 'Decat', slug: 'decat-coche', categoria: 'coches', descripcion: 'Eliminación lógica del catalizador según solicitud.', precio: 25, creditos: 25, icono: '⚠️', orden: 60 },
  { nombre: 'Pops & Bangs', slug: 'pops-bangs-coche', categoria: 'coches', descripcion: 'Configuración de petardeo bajo solicitud.', precio: 20, creditos: 20, icono: '💥', orden: 70 },
  { nombre: 'Hardcut', slug: 'hardcut-coche', categoria: 'coches', descripcion: 'Limitador tipo hardcut según configuración solicitada.', precio: 20, creditos: 20, icono: '🍿', orden: 80 },
  { nombre: 'Launch Control', slug: 'launch-control-coche', categoria: 'coches', descripcion: 'Salida asistida bajo configuración técnica.', precio: 25, creditos: 25, icono: '🏁', orden: 90 },
  { nombre: 'Reset adaptaciones DSG', slug: 'dsg-reset-coche', categoria: 'coches', descripcion: 'Reset de adaptaciones de caja DSG bajo solicitud.', precio: 30, creditos: 30, icono: '⚙️', orden: 100 },

  // --- MOTOS ---
  { nombre: 'Stage 1', slug: 'stage-1-moto', categoria: 'motos', descripcion: 'Optimización de potencia segura para moto.', precio: 25, creditos: 25, icono: '🚀', orden: 110 },
  { nombre: 'Quickshifter / Limitador OFF', slug: 'quickshifter-limitador-off-moto', categoria: 'motos', descripcion: 'Configuración de quickshifter o eliminación de limitador según solicitud.', precio: 20, creditos: 20, icono: '⚙️', orden: 120 },
  { nombre: 'DPF/EGR/AdBlue OFF', slug: 'anulaciones-off-moto', categoria: 'motos', descripcion: 'Solución para sistemas DPF/EGR/AdBlue en motos que lo incorporan.', precio: 25, creditos: 25, icono: '🚫', orden: 130 },

  // --- AGRÍCOLA ---
  { nombre: 'Stage 1', slug: 'stage-1-agricola', categoria: 'agricola', descripcion: 'Optimización de potencia para maquinaria agrícola.', precio: 150, creditos: 150, icono: '🚜', orden: 140 },
  { nombre: 'Stage 2', slug: 'stage-2-agricola', categoria: 'agricola', descripcion: 'Calibración avanzada para maquinaria agrícola.', precio: 200, creditos: 200, icono: '🚜', orden: 150 },
  { nombre: 'DPF/EGR/AdBlue OFF', slug: 'anulaciones-off-agricola', categoria: 'agricola', descripcion: 'Solución para sistemas DPF/EGR/AdBlue en maquinaria agrícola.', precio: 80, creditos: 80, icono: '🚫', orden: 160 },

  // --- CAMIÓN ---
  { nombre: 'Stage 1', slug: 'stage-1-camion', categoria: 'camion', descripcion: 'Optimización de potencia para vehículo pesado.', precio: 180, creditos: 180, icono: '🚛', orden: 170 },
  { nombre: 'Stage 2', slug: 'stage-2-camion', categoria: 'camion', descripcion: 'Calibración avanzada para vehículo pesado.', precio: 230, creditos: 230, icono: '🚛', orden: 180 },
  { nombre: 'DPF/EGR/AdBlue OFF', slug: 'anulaciones-off-camion', categoria: 'camion', descripcion: 'Solución para sistemas DPF/EGR/AdBlue en vehículo pesado.', precio: 90, creditos: 90, icono: '🚫', orden: 190 },
  { nombre: 'Decat', slug: 'decat-camion', categoria: 'camion', descripcion: 'Eliminación lógica del catalizador en vehículo pesado.', precio: 70, creditos: 70, icono: '⚠️', orden: 200 },

  // --- SERVICIOS ESPECIALES (transversal, precio distinto según vehículo) ---
  { nombre: 'IMMO OFF (coche / moto)', slug: 'immo-off-ligero', categoria: 'especiales', descripcion: 'Solución inmovilizador estándar para coche o moto, vía archivo.', precio: 90, creditos: 90, icono: '🔑', orden: 210 },
  { nombre: 'IMMO OFF (camión / agrícola)', slug: 'immo-off-pesado', categoria: 'especiales', descripcion: 'Solución inmovilizador estándar para vehículo pesado o agrícola, vía archivo.', precio: 180, creditos: 180, icono: '🔑', orden: 220 },
  { nombre: 'IMMO OFF MD1MG1 (coche / moto)', slug: 'immo-off-md1mg1-ligero', categoria: 'especiales', descripcion: 'Solución inmovilizador de máxima dificultad para coche o moto.', precio: 150, creditos: 150, icono: '🔐', orden: 230 },
  { nombre: 'IMMO OFF MD1MG1 (camión / agrícola)', slug: 'immo-off-md1mg1-pesado', categoria: 'especiales', descripcion: 'Solución inmovilizador de máxima dificultad para vehículo pesado o agrícola.', precio: 250, creditos: 250, icono: '🔐', orden: 240 },
  { nombre: 'Airbag crash data (coche / moto)', slug: 'airbag-crash-data-ligero', categoria: 'especiales', descripcion: 'Reset de datos de colisión de airbag para coche o moto, vía archivo.', precio: 70, creditos: 70, icono: '🛟', orden: 250 },
  { nombre: 'Airbag crash data (camión / agrícola)', slug: 'airbag-crash-data-pesado', categoria: 'especiales', descripcion: 'Reset de datos de colisión de airbag para vehículo pesado o agrícola.', precio: 120, creditos: 120, icono: '🛟', orden: 260 },
  { nombre: 'Corrección de kilometraje', slug: 'correccion-kilometraje', categoria: 'especiales', descripcion: 'Corrección de kilometraje vía archivo. El profesional es responsable de cumplir la normativa aplicable al usar este servicio.', precio: 60, creditos: 60, icono: '📟', orden: 270 },
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
  coches: 'Coches',
  motos: 'Motos',
  agricola: 'Agrícola',
  camion: 'Camión',
  especiales: 'Servicios especiales',
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
// el tipo de vehículo/servicio y solo entonces ve los servicios de esa
// familia. Aquí familia y categoría coinciden 1:1 (son las 5 categorías
// de negocio). Cualquier categoría que no esté listada aquí cae en
// "coches" por defecto (ver familiaDeCategoria), así nunca desaparece un
// servicio nuevo por olvido de actualizar este mapa.
export const FAMILIAS: Familia[] = [
  {
    slug: 'coches',
    nombre: 'Coches',
    descripcion: 'Reprogramación, anulaciones y opciones para turismos',
    icono: '🚗',
    categorias: ['coches'],
  },
  {
    slug: 'motos',
    nombre: 'Motos',
    descripcion: 'Reprogramación y anulaciones para motocicletas',
    icono: '🏍️',
    categorias: ['motos'],
  },
  {
    slug: 'agricola',
    nombre: 'Agrícola',
    descripcion: 'Soluciones para maquinaria y tractores agrícolas',
    icono: '🚜',
    categorias: ['agricola'],
  },
  {
    slug: 'camion',
    nombre: 'Camión',
    descripcion: 'Soluciones para vehículo pesado',
    icono: '🚛',
    categorias: ['camion'],
  },
  {
    slug: 'especiales',
    nombre: 'Servicios especiales',
    descripcion: 'IMMO OFF, airbag crash data, corrección de kilometraje y otros servicios de alta especialización',
    icono: '⭐',
    categorias: ['especiales'],
  },
]

export function familiaDeCategoria(categoria: string): string {
  const match = FAMILIAS.find((f) => f.categorias.includes(categoria))
  return match?.slug || 'coches'
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
