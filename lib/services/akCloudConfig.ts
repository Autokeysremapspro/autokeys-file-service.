import { supabase } from '@/lib/supabase'

export type PrecioCondicionalDistribuidor = {
  requiere_servicio_id: string
  precio: number
  activo?: boolean | null
}

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
  precioEstandar?: number
  personalizado?: boolean
  preciosCondicionales?: PrecioCondicionalDistribuidor[]
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

// Fallback mínimo. El catálogo completo y los precios reales viven en Supabase.
export const FALLBACK_SERVICIOS: AkCloudServicio[] = [
  { nombre: 'Stage 1', slug: 'stage-1-coche', categoria: 'coches', precio: 44.90, creditos: 45, icono: '🚀', orden: 10 },
  { nombre: 'Stage 2', slug: 'stage-2-coche', categoria: 'coches', precio: 64.90, creditos: 65, icono: '🏁', orden: 20 },
  { nombre: 'DPF', slug: 'dpf-off-coche', categoria: 'coches', precio: 34.90, creditos: 35, icono: '🚫', orden: 30 },
  { nombre: 'EGR', slug: 'egr-off-coche', categoria: 'coches', precio: 29.90, creditos: 30, icono: '🌿', orden: 40 },
  { nombre: 'AdBlue / SCR', slug: 'adblue-off-coche', categoria: 'coches', precio: 39.90, creditos: 40, icono: '💧', orden: 50 },
  { nombre: 'Pops & Bangs', slug: 'pops-bangs-coche', categoria: 'coches', precio: 39.90, creditos: 40, icono: '💥', orden: 70 },
  { nombre: 'Hardcut / Popcorn', slug: 'hardcut-coche', categoria: 'coches', precio: 39.90, creditos: 40, icono: '🍿', orden: 80 },
  { nombre: 'DTC OFF', slug: 'dtc-off', categoria: 'coches', precio: 19.90, creditos: 20, icono: '🧰', orden: 100 },
  { nombre: 'Stage 1 Moto', slug: 'stage-1-moto', categoria: 'motos', precio: 39.90, creditos: 40, icono: '🏍️', orden: 300 },
  { nombre: 'Stage 1 Agrícola', slug: 'stage-1-agricola', categoria: 'agricola', precio: 119.90, creditos: 120, icono: '🚜', orden: 400 },
  { nombre: 'TCU Stage 1', slug: 'tcu-stage-1', categoria: 'tcu', precio: 59.90, creditos: 60, icono: '⚙️', orden: 500 },
  { nombre: 'Stage 1 Camión', slug: 'stage-1-camion', categoria: 'camion', precio: 129.90, creditos: 130, icono: '🚛', orden: 600 },
  { nombre: 'IMMO OFF EDC15 / EDC16', slug: 'immo-off-ligero', categoria: 'immo', precio: 44.90, creditos: 45, icono: '🔑', orden: 700 },
  { nombre: 'IMMO OFF EDC17', slug: 'immo-off-edc17', categoria: 'immo', precio: 59.90, creditos: 60, icono: '🔑', orden: 710 },
  { nombre: 'IMMO OFF MD1 / MG1', slug: 'immo-off-md1mg1-ligero', categoria: 'immo', precio: 79.90, creditos: 80, icono: '🔐', orden: 720 },
  { nombre: 'Airbag Crash Data Reset', slug: 'airbag-crash-data-ligero', categoria: 'airbag', precio: 34.90, creditos: 35, icono: '🛟', orden: 800 },
  { nombre: 'Original File / ORI', slug: 'original-file-ori', categoria: 'herramientas', precio: 19.90, creditos: 20, icono: '📄', orden: 900 },
  { nombre: 'File Revision', slug: 'file-revision', categoria: 'herramientas', precio: 19.90, creditos: 20, icono: '🔍', orden: 902 },
  { nombre: 'MD1/MG1 Special Solution', slug: 'md1mg1-special-solution', categoria: 'especiales', precio: 99.90, creditos: 100, icono: '⭐', orden: 1010 },
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
  tcu: 'TCU / Cajas',
  camion: 'Camión',
  immo: 'IMMO / ECU Data',
  airbag: 'Airbag',
  herramientas: 'File Tools',
  especiales: 'Special Lab',
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

export const FAMILIAS: Familia[] = [
  { slug: 'coches', nombre: 'Coches', descripcion: 'Performance y soluciones ECU para turismos', icono: '🚗', categorias: ['coches'] },
  { slug: 'motos', nombre: 'Motos', descripcion: 'Performance y soluciones para motocicletas', icono: '🏍️', categorias: ['motos'] },
  { slug: 'agricola', nombre: 'Agrícola', descripcion: 'Soluciones para maquinaria agrícola', icono: '🚜', categorias: ['agricola'] },
  { slug: 'tcu', nombre: 'TCU / Cajas', descripcion: 'DSG, ZF y transmisiones automáticas', icono: '⚙️', categorias: ['tcu'] },
  { slug: 'camion', nombre: 'Camión', descripcion: 'Soluciones para vehículo pesado', icono: '🚛', categorias: ['camion'] },
  { slug: 'immo', nombre: 'IMMO / ECU Data', descripcion: 'IMMO, virgin, clone, sync y reparación de datos', icono: '🔑', categorias: ['immo'] },
  { slug: 'airbag', nombre: 'Airbag', descripcion: 'Crash data, virgin y reparación de datos SRS', icono: '🛟', categorias: ['airbag'] },
  { slug: 'herramientas', nombre: 'File Tools', descripcion: 'ORI, revisión, checksum y conversiones', icono: '🧰', categorias: ['herramientas'] },
  { slug: 'especiales', nombre: 'Special Lab', descripcion: 'MD1/MG1 y soluciones especiales', icono: '⭐', categorias: ['especiales'] },
]

export function familiaDeCategoria(categoria: string): string {
  const match = FAMILIAS.find((f) => f.categorias.includes(categoria))
  return match?.slug || 'especiales'
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

  const base = data.map((item: any) => ({
    ...item,
    categoria: item.categoria || 'especiales',
    precio: Number(item.precio || item.creditos || 0),
    creditos: Number(item.creditos || item.precio || 0),
    precioEstandar: Number(item.precio || item.creditos || 0),
    personalizado: false,
    preciosCondicionales: [] as PrecioCondicionalDistribuidor[],
  }))

  try {
    const { data: auth } = await supabase.auth.getUser()
    const user = auth.user
    if (!user) return sortByOrden(base)

    const { data: distribuidor } = await supabase
      .from('akcloud_distribuidores')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()
    if (!distribuidor) return sortByOrden(base)

    const [{ data: overrides }, { data: condicionales }] = await Promise.all([
      supabase.from('distribuidor_precios').select('servicio_id,precio').eq('distribuidor_id', distribuidor.id),
      supabase.from('distribuidor_precios_condicionales').select('servicio_id,requiere_servicio_id,precio,activo').eq('distribuidor_id', distribuidor.id).eq('activo', true),
    ])

    const overrideMap = new Map((overrides || []).map((o: any) => [String(o.servicio_id), Number(o.precio)]))
    const condicionalMap = new Map<string, PrecioCondicionalDistribuidor[]>()
    for (const row of condicionales || []) {
      const key = String((row as any).servicio_id)
      const list = condicionalMap.get(key) || []
      list.push({ requiere_servicio_id: String((row as any).requiere_servicio_id), precio: Number((row as any).precio), activo: (row as any).activo })
      condicionalMap.set(key, list)
    }

    return sortByOrden(base.map((item: any) => {
      const override = overrideMap.get(String(item.id))
      const preciosCondicionales = condicionalMap.get(String(item.id)) || []
      if (override === undefined) return { ...item, preciosCondicionales }
      return { ...item, precio: override, creditos: override, personalizado: true, preciosCondicionales }
    }))
  } catch {
    return sortByOrden(base)
  }
}

export async function getPlanesActivos(): Promise<AkCloudPlan[]> {
  const { data, error } = await supabase.from('akcloud_planes').select('*').eq('activo', true).order('orden', { ascending: true })
  if (error || !data?.length) return FALLBACK_PLANES
  return sortByOrden(data.map((item: any) => ({ ...item, precio_mensual: Number(item.precio_mensual || 0), creditos_mes: Number(item.creditos_mes || 0), ventajas: Array.isArray(item.ventajas) ? item.ventajas : [] })))
}

export async function getMetodosPagoActivos(): Promise<AkCloudMetodoPago[]> {
  const { data, error } = await supabase.from('akcloud_metodos_pago').select('*').eq('activo', true).order('orden', { ascending: true })
  if (error || !data?.length) return FALLBACK_METODOS
  return sortByOrden(data)
}

export async function getNovedadesActivas(): Promise<AkCloudNovedad[]> {
  const { data, error } = await supabase.from('akcloud_novedades').select('*').eq('activo', true).order('orden', { ascending: true }).order('created_at', { ascending: false })
  if (error || !data) return []
  return data as AkCloudNovedad[]
}

export function groupServicios<T extends AkCloudServicio>(servicios: T[]) {
  return servicios.reduce<Record<string, T[]>>((acc, servicio) => {
    const key = servicio.categoria || 'especiales'
    acc[key] = acc[key] || []
    acc[key].push(servicio)
    return acc
  }, {})
}
