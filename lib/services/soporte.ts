import { supabase } from '@/lib/supabase'

export type TicketEstado = 'abierto' | 'en_revision' | 'respondido' | 'cerrado'
export type TicketPrioridad = 'baja' | 'normal' | 'alta' | 'urgente'

export type AkCloudTicket = {
  id: string
  user_id?: string | null
  numero: string
  asunto: string
  categoria?: string | null
  prioridad?: TicketPrioridad | string | null
  estado?: TicketEstado | string | null
  pedido_id?: string | null
  descripcion?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type AkCloudTicketMensaje = {
  id: string
  ticket_id: string
  user_id?: string | null
  remitente?: string | null
  mensaje: string
  interno?: boolean | null
  created_at?: string | null
}

function createTicketNumber() {
  const now = new Date()
  const year = now.getFullYear()
  const rand = Math.floor(Math.random() * 9000 + 1000)
  return `SUP-${year}-${rand}`
}

export function estadoTicketLabel(estado?: string | null) {
  switch (estado) {
    case 'abierto': return 'Abierto'
    case 'en_revision': return 'En revisión'
    case 'respondido': return 'Respondido'
    case 'cerrado': return 'Cerrado'
    default: return 'Abierto'
  }
}

export function estadoTicketColor(estado?: string | null) {
  switch (estado) {
    case 'abierto': return 'border-blue-500/30 bg-blue-500/10 text-blue-300'
    case 'en_revision': return 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    case 'respondido': return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
    case 'cerrado': return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300'
    default: return 'border-blue-500/30 bg-blue-500/10 text-blue-300'
  }
}

export function prioridadTicketColor(prioridad?: string | null) {
  switch (prioridad) {
    case 'urgente': return 'border-red-500/35 bg-red-500/10 text-red-300'
    case 'alta': return 'border-orange-500/35 bg-orange-500/10 text-orange-300'
    case 'normal': return 'border-white/10 bg-white/[0.04] text-zinc-300'
    case 'baja': return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
    default: return 'border-white/10 bg-white/[0.04] text-zinc-300'
  }
}

export async function getTicketsSoporte() {
  const { data, error } = await supabase
    .from('akcloud_tickets')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data || []) as AkCloudTicket[]
}

export async function getTicketSoporte(id: string) {
  const { data, error } = await supabase
    .from('akcloud_tickets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as AkCloudTicket
}

export async function getMensajesTicket(ticketId: string) {
  const { data, error } = await supabase
    .from('akcloud_ticket_mensajes')
    .select('*')
    .eq('ticket_id', ticketId)
    .eq('interno', false)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data || []) as AkCloudTicketMensaje[]
}

export async function crearTicketSoporte(payload: {
  asunto: string
  categoria: string
  prioridad: TicketPrioridad
  descripcion: string
  pedido_id?: string | null
}) {
  const { data: userRes } = await supabase.auth.getUser()
  const user = userRes?.user
  if (!user) throw new Error('No hay sesión activa')

  const { data, error } = await supabase
    .from('akcloud_tickets')
    .insert({
      user_id: user.id,
      numero: createTicketNumber(),
      asunto: payload.asunto,
      categoria: payload.categoria,
      prioridad: payload.prioridad,
      descripcion: payload.descripcion,
      pedido_id: payload.pedido_id || null,
      estado: 'abierto',
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  await supabase.from('akcloud_ticket_mensajes').insert({
    ticket_id: data.id,
    user_id: user.id,
    remitente: 'cliente',
    mensaje: payload.descripcion,
    interno: false,
  })

  return data as AkCloudTicket
}

export async function enviarMensajeTicket(ticketId: string, mensaje: string) {
  const { data: userRes } = await supabase.auth.getUser()
  const user = userRes?.user
  if (!user) throw new Error('No hay sesión activa')

  const { data, error } = await supabase
    .from('akcloud_ticket_mensajes')
    .insert({
      ticket_id: ticketId,
      user_id: user.id,
      remitente: 'cliente',
      mensaje,
      interno: false,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  await supabase
    .from('akcloud_tickets')
    .update({ estado: 'abierto', updated_at: new Date().toISOString() })
    .eq('id', ticketId)

  return data as AkCloudTicketMensaje
}
