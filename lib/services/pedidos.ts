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
  notas_internas?: string | null
  estado: PedidoEstado | string
  prioridad: string | null
  urgente?: boolean | null
  ori_nombre: string | null
  ori_bucket: string | null
  ori_path: string | null
  ori_size: number | null
  mod_nombre: string | null
  mod_bucket: string | null
  mod_path: string | null
  precio: number | null
  pagado: boolean | null
  created_at: string | null
  updated_at: string | null
}

export type CrearPedidoPayload = {
  servicios: string[]
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
  ori?: File | null
  precio?: number
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

  const { data, error } = await supabase
    .from('file_service_pedidos')
    .insert({
      user_id: user?.id || null,
      cliente_nombre: user?.user_metadata?.name || user?.email || null,
      cliente_email: user?.email || null,
      servicios: payload.servicios,
      observaciones: payload.observaciones || null,
      marca: payload.marca || null,
      modelo: payload.modelo || null,
      motor: payload.motor || null,
      anio: payload.anio || null,
      ecu: payload.ecu || null,
      hw: payload.hw || null,
      sw: payload.sw || null,
      cv: payload.cv || null,
      cambio: payload.cambio || null,
      prioridad: payload.prioridad || 'normal',
      precio: payload.precio || 0,
      estado: 'pendiente',
      ...oriInfo,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data as FileServicePedido
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

export async function getPedidoById(id: string) {
  const { data, error } = await supabase
    .from('file_service_pedidos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as FileServicePedido
}

export async function getPedidoPublicoById(id: string) {
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user

  let query = supabase
    .from('file_service_pedidos')
    .select('*')
    .eq('id', id)

  if (user?.id) query = query.eq('user_id', user.id)

  const { data, error } = await query.single()
  if (error) throw new Error(error.message)
  return data as FileServicePedido
}

export async function getPedidosAdmin(estado?: string) {
  let query = supabase
    .from('file_service_pedidos')
    .select('*')
    .order('created_at', { ascending: false })

  if (estado && estado !== 'todos') query = query.eq('estado', estado)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data || []) as FileServicePedido[]
}

export async function actualizarPedidoAdmin(
  id: string,
  payload: Partial<FileServicePedido> & { estado?: string; notas_internas?: string | null; urgente?: boolean | null }
) {
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
    .upload(path, file, { upsert: false })

  if (uploadError) throw new Error(uploadError.message)

  return actualizarPedidoAdmin(id, {
    mod_nombre: file.name,
    mod_bucket: 'file-service',
    mod_path: path,
    estado: 'finalizado',
  } as any)
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

export function estadoColor(estado: string) {
  if (estado === 'finalizado') return 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300'
  if (estado === 'en_proceso') return 'border-blue-500/35 bg-blue-500/10 text-blue-300'
  if (estado === 'cancelado') return 'border-zinc-500/35 bg-zinc-500/10 text-zinc-300'
  return 'border-yellow-500/35 bg-yellow-500/10 text-yellow-300'
}

export function formatBytes(size?: number | null) {
  if (!size) return '—'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}
