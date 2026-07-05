import { supabase } from '@/lib/supabase'

export type PedidoEstado = 'pendiente' | 'en_proceso' | 'finalizado' | 'cancelado'

export type PedidoAdmin = {
  id: string
  numero: string | null
  user_id?: string | null
  estado: PedidoEstado | string | null
  urgente?: boolean | null
  servicios?: string[] | null
  marca?: string | null
  modelo?: string | null
  motor?: string | null
  ecu?: string | null
  hw?: string | null
  sw?: string | null
  observaciones?: string | null
  notas_internas?: string | null
  ori_bucket?: string | null
  ori_path?: string | null
  ori_nombre?: string | null
  mod_bucket?: string | null
  mod_path?: string | null
  mod_nombre?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export async function getPedidosAdmin(estado?: string) {
  let query = supabase
    .from('file_service_pedidos')
    .select('*')
    .order('created_at', { ascending: false })

  if (estado && estado !== 'todos') {
    query = query.eq('estado', estado)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data || []) as PedidoAdmin[]
}

export async function getPedidoAdmin(id: string) {
  const { data, error } = await supabase
    .from('file_service_pedidos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as PedidoAdmin
}

export async function updatePedidoAdmin(id: string, payload: Partial<PedidoAdmin>) {
  const { error } = await supabase
    .from('file_service_pedidos')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function uploadModFile(id: string, file: File) {
  const pedido = await getPedidoAdmin(id)
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${pedido.numero || id}/MOD/${Date.now()}-${safeName}`
  const bucket = 'file-service'

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true })

  if (uploadError) throw new Error(uploadError.message)

  await updatePedidoAdmin(id, {
    mod_bucket: bucket,
    mod_path: path,
    mod_nombre: file.name,
    estado: 'finalizado',
  })
}

export async function getSignedUrl(bucket?: string | null, path?: string | null) {
  if (!bucket || !path) return null
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 10)
  if (error) throw new Error(error.message)
  return data.signedUrl
}
