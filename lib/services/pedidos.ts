import { supabase } from '@/lib/supabase'

export type PedidoEstado = 'pendiente' | 'en_proceso' | 'finalizado' | 'cancelado'

export type FileServicePedido = {
  id: string
  numero: string | null
  user_id: string | null
  cliente_nombre: string | null
  cliente_email: string | null
  marca: string | null
  modelo: string | null
  motor: string | null
  anio: string | null
  ecu: string | null
  hw: string | null
  sw: string | null
  cv: string | null
  cambio: string | null
  servicios: string[] | null
  observaciones: string | null
  estado: PedidoEstado | string
  prioridad: string | null
  ori_nombre: string | null
  ori_bucket: string | null
  ori_path: string | null
  ori_size: number | null
  mod_nombre: string | null
  mod_bucket: string | null
  mod_path: string | null
  precio: number | null
  pagado: boolean | null
  notas_internas?: string | null
  created_at: string | null
  updated_at: string | null
}

export type CrearPedidoPayload = {
  servicios: string[]
  serviciosSlugs?: string[]
  observaciones?: string
  marca?: string
  modelo?: string
  motor?: string
  anio?: string
  ecu?: string
  hw?: string
  sw?: string
  cv?: string
  cambio?: string
  prioridad?: string
  precio?: number
  ori?: File | null
  legalAccepted?: boolean
  legalVersion?: string
}

export async function crearPedidoFileService(payload: CrearPedidoPayload) {
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user

  let oriInfo: {
    ori_nombre?: string
    ori_bucket?: string
    ori_path?: string
    ori_size?: number
  } = {}

  if (payload.ori) {
    const safeName = payload.ori.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const folder = user?.id || 'anon'
    const path = `ori/${folder}/${Date.now()}-${safeName}`

    const { error: uploadError } = await supabase.storage
      .from('file-service')
      .upload(path, payload.ori, { upsert: false })

    if (uploadError) throw new Error(uploadError.message)

    oriInfo = {
      ori_nombre: payload.ori.name,
      ori_bucket: 'file-service',
      ori_path: path,
      ori_size: payload.ori.size,
    }
  }

  // El precio y el descuento de créditos se calculan en el servidor
  // (/api/pedidos/crear) — nunca se manda el precio calculado en el
  // navegador, así nadie puede manipular lo que paga por un pedido.
  const response = await fetch('/api/pedidos/crear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      servicios: payload.serviciosSlugs || [],
      observaciones: payload.observaciones,
      marca: payload.marca,
      modelo: payload.modelo,
      motor: payload.motor,
      anio: payload.anio,
      ecu: payload.ecu,
      hw: payload.hw,
      sw: payload.sw,
      cv: payload.cv,
      cambio: payload.cambio,
      legalAccepted: payload.legalAccepted === true,
      legalVersion: payload.legalVersion,
      ori: {
        nombre: oriInfo.ori_nombre,
        bucket: oriInfo.ori_bucket,
        path: oriInfo.ori_path,
        size: oriInfo.ori_size,
      },
    }),
  })

  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'No se pudo crear el pedido')
  return result as { ok: true; requierePago: boolean; pedido?: FileServicePedido; approveUrl?: string; importe?: number }
}

export async function getMisPedidos() {
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user

  let query = supabase
    .from('file_service_pedidos')
    .select('*')
    .order('created_at', { ascending: false })

  if (user?.id) query = query.eq('user_id', user.id)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data || []) as FileServicePedido[]
}

export async function getPedidosAdmin() {
  const { data, error } = await supabase
    .from('file_service_pedidos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data || []) as FileServicePedido[]
}

export async function getPedidoById(id: string) {
  const { data, error } = await supabase
    .from('file_service_pedidos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as FileServicePedido
}

export async function actualizarPedido(id: string, payload: Partial<FileServicePedido>) {
  const { data, error } = await supabase
    .from('file_service_pedidos')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data as FileServicePedido
}

export async function subirModPedido(id: string, file: File) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `mod/${id}/${Date.now()}-${safeName}`

  const { error: uploadError } = await supabase.storage
    .from('file-service')
    .upload(path, file, { upsert: true })

  if (uploadError) throw new Error(uploadError.message)

  return actualizarPedido(id, {
    mod_nombre: file.name,
    mod_bucket: 'file-service',
    mod_path: path,
    estado: 'finalizado',
  } as Partial<FileServicePedido>)
}

export async function descargarArchivo(bucket: string, path: string) {
  const { data, error } = await supabase.storage.from(bucket).download(path)
  if (error) throw new Error(error.message)
  return data
}

export function formatEstado(estado: string) {
  const map: Record<string, string> = {
    pendiente: 'Pendiente',
    en_proceso: 'En proceso',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado',
  }
  return map[estado] || estado
}

export function formatBytes(bytes?: number | null) {
  if (!bytes) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let index = 0
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}


export function estadoColor(estado?: string | null) {
  switch (estado) {
    case 'pendiente':
      return 'text-amber-300 bg-amber-500/10 border-amber-500/30'
    case 'en_proceso':
      return 'text-blue-300 bg-blue-500/10 border-blue-500/30'
    case 'finalizado':
      return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
    case 'cancelado':
      return 'text-red-300 bg-red-500/10 border-red-500/30'
    default:
      return 'text-zinc-300 bg-zinc-500/10 border-zinc-500/30'
  }
}

export async function actualizarPedidoAdmin(id: string, payload: Record<string, any>) {
  const { data, error } = await supabase
    .from('file_service_pedidos')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  return data as FileServicePedido
}
