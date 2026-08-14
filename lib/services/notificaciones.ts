import { supabase } from '@/lib/supabase'

export type NotificacionTipo = 'info' | 'success' | 'warning' | 'danger' | string

export type FileServiceNotificacion = {
  id: string
  user_id: string | null
  pedido_id: string | null
  titulo: string
  mensaje: string | null
  tipo: NotificacionTipo
  leida: boolean
  metadata: Record<string, any> | null
  created_at: string
}

async function getAuthenticatedUserId() {
  const { data: authData, error } = await supabase.auth.getUser()
  const userId = authData.user?.id

  if (error || !userId) throw new Error('Sesión no válida')
  return userId
}

export async function getMisNotificaciones() {
  const userId = await getAuthenticatedUserId()

  const { data, error } = await supabase
    .from('file_service_notificaciones')
    .select('*')
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return (data || []) as FileServiceNotificacion[]
}

export async function marcarNotificacionLeida(id: string) {
  const userId = await getAuthenticatedUserId()
  const { error } = await supabase
    .from('file_service_notificaciones')
    .update({ leida: true })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function marcarTodasNotificacionesLeidas() {
  const userId = await getAuthenticatedUserId()
  const { error } = await supabase
    .from('file_service_notificaciones')
    .update({ leida: true })
    .eq('leida', false)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function eliminarNotificacion(id: string) {
  const userId = await getAuthenticatedUserId()
  const { error } = await supabase
    .from('file_service_notificaciones')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export function notificacionTone(tipo?: string | null) {
  switch (tipo) {
    case 'success':
      return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
    case 'warning':
      return 'border-amber-500/25 bg-amber-500/10 text-amber-300'
    case 'danger':
      return 'border-red-500/25 bg-red-500/10 text-red-300'
    default:
      return 'border-blue-500/25 bg-blue-500/10 text-blue-300'
  }
}

export function formatNotificationDate(date?: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}
