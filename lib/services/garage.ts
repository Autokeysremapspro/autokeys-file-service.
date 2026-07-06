import { getMisPedidos, type FileServicePedido } from '@/lib/services/pedidos'

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
  pedidos: FileServicePedido[]
}

function clean(value?: string | null, fallback = 'Sin definir') {
  return value?.trim() || fallback
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
      ultimoTrabajo: services.slice(0, 3).join(' + ') || 'Sin servicios',
      ultimoEstado: last.estado || 'pendiente',
      ultimoPedidoId: last.id,
      ultimoNumero: last.numero || 'FS',
      ultimaFecha: last.created_at,
      servicios: services,
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
