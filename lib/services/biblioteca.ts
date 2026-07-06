import { supabase } from '@/lib/supabase'
import { descargarArchivo, getMisPedidos, getPedidoById, type FileServicePedido } from '@/lib/services/pedidos'

export type BibliotecaTipo = 'ORI' | 'MOD'

export type BibliotecaArchivo = {
  id: string
  pedido_id: string
  pedido_numero: string | null
  tipo: BibliotecaTipo
  nombre: string
  bucket: string
  path: string
  size: number | null
  estado: string
  marca: string | null
  modelo: string | null
  motor: string | null
  ecu: string | null
  hw: string | null
  sw: string | null
  servicios: string[]
  created_at: string | null
}

function fromPedido(pedido: FileServicePedido): BibliotecaArchivo[] {
  const base = {
    pedido_id: pedido.id,
    pedido_numero: pedido.numero || null,
    estado: String(pedido.estado || 'pendiente'),
    marca: pedido.marca || null,
    modelo: pedido.modelo || null,
    motor: pedido.motor || null,
    ecu: pedido.ecu || null,
    hw: pedido.hw || null,
    sw: pedido.sw || null,
    servicios: pedido.servicios || [],
    created_at: pedido.created_at || null,
  }

  const archivos: BibliotecaArchivo[] = []

  if (pedido.ori_path && pedido.ori_bucket) {
    archivos.push({
      ...base,
      id: `${pedido.id}-ori`,
      tipo: 'ORI',
      nombre: pedido.ori_nombre || 'Archivo ORI',
      bucket: pedido.ori_bucket,
      path: pedido.ori_path,
      size: pedido.ori_size || null,
    })
  }

  if (pedido.mod_path && pedido.mod_bucket) {
    archivos.push({
      ...base,
      id: `${pedido.id}-mod`,
      tipo: 'MOD',
      nombre: pedido.mod_nombre || 'Archivo MOD',
      bucket: pedido.mod_bucket,
      path: pedido.mod_path,
      size: null,
    })
  }

  return archivos
}

export async function getBibliotecaArchivos() {
  const pedidos = await getMisPedidos()
  return pedidos.flatMap(fromPedido)
}

export async function getBibliotecaPedido(id: string) {
  const pedido = await getPedidoById(id)
  return {
    pedido,
    archivos: fromPedido(pedido),
  }
}

export async function descargarBibliotecaArchivo(archivo: BibliotecaArchivo) {
  return descargarArchivo(archivo.bucket, archivo.path)
}

export async function getSignedDownloadUrl(archivo: BibliotecaArchivo) {
  const { data, error } = await supabase.storage
    .from(archivo.bucket)
    .createSignedUrl(archivo.path, 60)

  if (error) throw new Error(error.message)
  return data.signedUrl
}

export function formatBibliotecaDate(date?: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatArchivoSize(size?: number | null) {
  if (!size) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = size
  let index = 0
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}
