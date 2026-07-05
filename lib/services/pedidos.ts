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

export async function getPedidosAdmin() {
  const { data, error } = await supabase
    .from('file_service_pedidos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data || []) as FileServicePedido[]
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
