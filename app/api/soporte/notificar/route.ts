import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notificarSoporte } from '@/lib/notifyStaff'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// POST /api/soporte/notificar
// La creación del ticket/mensaje ya ocurrió en el navegador (RLS de
// akcloud_tickets/akcloud_ticket_mensajes, solo puede tocar lo suyo). Esta
// ruta solo avisa al staff — por eso valida que el ticket sea realmente del
// usuario de la sesión antes de notificar nada, para que nadie pueda hacer
// sonar la alarma de un ticket ajeno.
export async function POST(request: Request) {
  try {
    const sessionClient = createServerSupabaseClient()
    const { data: { user } } = await sessionClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json()
    const ticketId = String(body.ticketId || '')
    const mensaje = String(body.mensaje || '').trim()
    const esNuevoTicket = Boolean(body.esNuevoTicket)
    if (!ticketId || !mensaje) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

    const admin = adminClient()
    const { data: ticket } = await admin
      .from('akcloud_tickets')
      .select('id,user_id,numero,asunto')
      .eq('id', ticketId)
      .maybeSingle()

    if (!ticket || ticket.user_id !== user.id) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })
    }

    const { data: distribuidor } = await admin
      .from('akcloud_distribuidores')
      .select('empresa')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    await notificarSoporte({
      ticketId: ticket.id,
      numero: ticket.numero,
      asunto: ticket.asunto,
      empresa: distribuidor?.empresa || null,
      mensaje,
      esNuevoTicket,
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    // Best-effort: un fallo avisando al staff no debe romper la creación del ticket, que ya ocurrió.
    return NextResponse.json({ ok: false, error: error?.message }, { status: 200 })
  }
}
