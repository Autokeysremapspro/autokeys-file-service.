import { supabase } from '@/lib/supabase'

export type AutorTipo = 'cliente' | 'admin' | 'sistema'

export type FileServiceMensaje = {
  id: string
  pedido_id: string
  user_id: string | null
  autor_nombre: string | null
  autor_tipo: AutorTipo | string
  mensaje: string
  leido: boolean | null
  created_at: string | null
}

export async function getMensajesPedido(pedidoId: string) {
  const { data, error } = await supabase
    .from('file_service_mensajes')
    .select('*')
    .eq('pedido_id', pedidoId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  return (data || []) as FileServiceMensaje[]
}

export async function enviarMensajePedido(pedidoId: string, mensaje: string, autorTipo: AutorTipo = 'cliente') {
  const clean = mensaje.trim()
  if (!clean) throw new Error('Escribe un mensaje')

  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user

  const autorNombre =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    (autorTipo === 'admin' ? 'Autokeys' : 'Distribuidor')

  const { data, error } = await supabase
    .from('file_service_mensajes')
    .insert({
      pedido_id: pedidoId,
      user_id: user?.id || null,
      autor_nombre: autorNombre,
      autor_tipo: autorTipo,
      mensaje: clean,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  return data as FileServiceMensaje
}

export function formatChatDate(date?: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}
