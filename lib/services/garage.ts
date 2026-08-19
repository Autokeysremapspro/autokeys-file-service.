import { getMisPedidos, type FileServicePedido } from '@/lib/services/pedidos'

export type GarageTechnicalChange = {
  pedidoId: string
  fecha: string | null
  campo: 'HW' | 'SW'
  anterior: string
  actual: string
}

export type GarageHistorySummary = {
  primeraFecha: string | null
  ultimaFecha: string | null
  versionesHw: string[]
  versionesSw: string[]
  cambioHwDetectado: boolean
  cambioSwDetectado: boolean
  cambiosTecnicos: GarageTechnicalChange[]
  cambiosHw: number
  cambiosSw: number
  ultimoCambioTecnico: GarageTechnicalChange | null
  serviciosRecurrentes: string[]
  trabajosConMod: number
}

export type GarageVehicle = {
  key: string
  marca: string
  modelo: string
  motor: string
  ecu: string
  hw: string
  sw: string
  cv: string
  trabajos: number
  finalizados: number
  pendientes: number
  ultimoTrabajo: string
  ultimoEstado: string
  ultimoPedidoId: string
  ultimoNumero: string
  ultimaFecha: string | null
  servicios: string[]
  historial: GarageHistorySummary
  pedidos: FileServicePedido[]
}

function clean(value?: string | null, fallback = 'Sin definir') {
  return value?.trim() || fallback
}

function cleanTechnicalValue(value?: string | null) {
  const normalized = value?.trim()
  if (!normalized) return null
  return normalized
}

function makeVehicleKey(pedido: FileServicePedido) {
  return [
    clean(pedido.marca, 'marca'),
    clean(pedido.modelo, 'modelo'),
    clean(pedido.ecu, 'ecu'),
  ]
    .join('__')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildTechnicalChanges(orderedOldestFirst: FileServicePedido[]) {
  const changes: GarageTechnicalChange[] = []
  let previousHw: string | null = null
  let previousSw: string | null = null

  orderedOldestFirst.forEach((pedido) => {
    const currentHw = cleanTechnicalValue(pedido.hw)
    const currentSw = cleanTechnicalValue(pedido.sw)

    if (previousHw && currentHw && previousHw !== currentHw) {
      changes.push({
        pedidoId: pedido.id,
        fecha: pedido.created_at || null,
        campo: 'HW',
        anterior: previousHw,
        actual: currentHw,
      })
    }

    if (previousSw && currentSw && previousSw !== currentSw) {
      changes.push({
        pedidoId: pedido.id,
        fecha: pedido.created_at || null,
        campo: 'SW',
        anterior: previousSw,
        actual: currentSw,
      })
    }

    if (currentHw) previousHw = currentHw
    if (currentSw) previousSw = currentSw
  })

  return changes
}

function buildHistorySummary(sortedPedidos: FileServicePedido[]): GarageHistorySummary {
  const orderedOldestFirst = [...sortedPedidos].reverse()
  const first = orderedOldestFirst[0]
  const last = sortedPedidos[0]
  const serviceFrequency = new Map<string, number>()

  sortedPedidos.forEach((pedido) => {
    ;(pedido.servicios || []).filter(Boolean).forEach((service) => {
      serviceFrequency.set(service, (serviceFrequency.get(service) || 0) + 1)
    })
  })

  const versionesHw = Array.from(
    new Set(sortedPedidos.map((pedido) => cleanTechnicalValue(pedido.hw)).filter((value): value is string => Boolean(value))),
  )
  const versionesSw = Array.from(
    new Set(sortedPedidos.map((pedido) => cleanTechnicalValue(pedido.sw)).filter((value): value is string => Boolean(value))),
  )
  const cambiosTecnicos = buildTechnicalChanges(orderedOldestFirst)
  const cambiosHw = cambiosTecnicos.filter((change) => change.campo === 'HW').length
  const cambiosSw = cambiosTecnicos.filter((change) => change.campo === 'SW').length
  const ultimoCambioTecnico = cambiosTecnicos.at(-1) || null
  const serviciosRecurrentes = Array.from(serviceFrequency.entries())
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([service]) => service)

  return {
    primeraFecha: first?.created_at || null,
    ultimaFecha: last?.created_at || null,
    versionesHw,
    versionesSw,
    cambioHwDetectado: versionesHw.length > 1,
    cambioSwDetectado: versionesSw.length > 1,
    cambiosTecnicos,
    cambiosHw,
    cambiosSw,
    ultimoCambioTecnico,
    serviciosRecurrentes,
    trabajosConMod: sortedPedidos.filter((pedido) => Boolean(pedido.mod_path || pedido.mod_nombre)).length,
  }
}

export function formatGarageDate(date?: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function getVehicleDisplayName(vehicle: Pick<GarageVehicle, 'marca' | 'modelo' | 'motor'>) {
  return [vehicle.marca, vehicle.modelo, vehicle.motor]
    .filter((item) => item && item !== 'Sin definir')
    .join(' ') || 'Vehículo sin identificar'
}

export async function getGarageVehicles() {
  const pedidos = await getMisPedidos()
  const map = new Map<string, FileServicePedido[]>()

  pedidos.forEach((pedido) => {
    const key = makeVehicleKey(pedido)
    const current = map.get(key) || []
    current.push(pedido)
    map.set(key, current)
  })

  const vehicles: GarageVehicle[] = Array.from(map.entries()).map(([key, vehiclePedidos]) => {
    const sorted = [...vehiclePedidos].sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
      return bTime - aTime
    })
    const last = sorted[0]
    const services = Array.from(new Set(sorted.flatMap((pedido) => pedido.servicios || []))).filter(Boolean)
    const latestServices = (last.servicios || []).filter(Boolean)

    return {
      key,
      marca: clean(last.marca),
      modelo: clean(last.modelo),
      motor: clean(last.motor),
      ecu: clean(last.ecu, 'ECU pendiente'),
      hw: clean(last.hw, 'HW pendiente'),
      sw: clean(last.sw, 'SW pendiente'),
      cv: clean(last.cv, 'CV pendiente'),
      trabajos: sorted.length,
      finalizados: sorted.filter((pedido) => pedido.estado === 'finalizado').length,
      pendientes: sorted.filter((pedido) => pedido.estado !== 'finalizado' && pedido.estado !== 'cancelado').length,
      ultimoTrabajo: latestServices.slice(0, 3).join(' + ') || 'Sin servicios',
      ultimoEstado: last.estado || 'pendiente',
      ultimoPedidoId: last.id,
      ultimoNumero: last.numero || 'FS',
      ultimaFecha: last.created_at,
      servicios: services,
      historial: buildHistorySummary(sorted),
      pedidos: sorted,
    }
  })

  return vehicles.sort((a, b) => {
    const aTime = a.ultimaFecha ? new Date(a.ultimaFecha).getTime() : 0
    const bTime = b.ultimaFecha ? new Date(b.ultimaFecha).getTime() : 0
    return bTime - aTime
  })
}

export async function getGarageVehicle(key: string) {
  const vehicles = await getGarageVehicles()
  return vehicles.find((vehicle) => vehicle.key === key) || null
}
