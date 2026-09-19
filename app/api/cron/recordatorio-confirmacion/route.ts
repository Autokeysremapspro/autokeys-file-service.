import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendNotificationEmail, escapeHtml } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SIGNUP_REDIRECT_URL = 'https://www.akcloud.es/login?confirmado=1'
// Ni demasiado pronto (dale tiempo a que llegue el email normal) ni para
// siempre (pasado este límite, ya no tiene sentido reenviar un enlace de
// hace una semana — si quiere entrar, que vuelva a solicitar el alta).
const HORAS_ESPERA_MINIMA = 2
const DIAS_LIMITE = 3

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function publicAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// GET /api/cron/recordatorio-confirmacion — pensado para Vercel Cron.
// Busca solicitudes de distribuidor cuyo usuario nunca confirmó el email
// de alta, les reenvía el enlace real de confirmación de Supabase y un
// aviso propio explicando por qué llega. Nunca manda más de un
// recordatorio por solicitud (columna recordatorio_confirmacion_enviado_at).
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const admin = adminClient()
  const auth = publicAuthClient()

  const now = Date.now()
  const maxCreatedAt = new Date(now - HORAS_ESPERA_MINIMA * 60 * 60 * 1000).toISOString()
  const minCreatedAt = new Date(now - DIAS_LIMITE * 24 * 60 * 60 * 1000).toISOString()

  const { data: candidatos, error } = await admin
    .from('akcloud_solicitudes_distribuidores')
    .select('id, auth_user_id, email, nombre, empresa, created_at')
    .is('recordatorio_confirmacion_enviado_at', null)
    .lte('created_at', maxCreatedAt)
    .gte('created_at', minCreatedAt)
    .in('estado', ['pendiente', 'informacion_solicitada', 'aprobada'])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let recordatoriosEnviados = 0
  let yaConfirmados = 0
  let sinAuthUserId = 0

  for (const candidato of candidatos || []) {
    if (!candidato.auth_user_id) { sinAuthUserId++; continue }

    const { data: authData, error: authError } = await admin.auth.admin.getUserById(candidato.auth_user_id)
    if (authError || !authData?.user) continue

    // Ya confirmó por su cuenta (o el equipo ya lo activó a mano): no hace
    // falta ningún recordatorio. Marcamos la solicitud como resuelta para
    // no volver a mirarla en el próximo cron.
    if (authData.user.email_confirmed_at) {
      yaConfirmados++
      await admin
        .from('akcloud_solicitudes_distribuidores')
        .update({ recordatorio_confirmacion_enviado_at: new Date().toISOString() })
        .eq('id', candidato.id)
      continue
    }

    // Reenvía el enlace real de confirmación (por si el original expiró o
    // se perdió en spam) y, aparte, un aviso propio explicando qué pasa.
    await auth.auth.resend({
      type: 'signup',
      email: candidato.email,
      options: { emailRedirectTo: SIGNUP_REDIRECT_URL },
    })

    await sendNotificationEmail({
      to: candidato.email,
      subject: 'Confirma tu email para activar tu cuenta AK Cloud',
      title: 'Falta un paso para activar tu cuenta',
      bodyHtml: `Hola ${escapeHtml(candidato.nombre || '')},<br><br>Tu cuenta para <b>${escapeHtml(candidato.empresa || 'tu taller')}</b> está creada, pero todavía falta confirmar el email. Te acabamos de reenviar el enlace — revisa también la carpeta de spam o promociones.<br><br>En cuanto confirmes el correo podrás entrar directamente en AK Cloud.`,
    })

    await admin
      .from('akcloud_solicitudes_distribuidores')
      .update({ recordatorio_confirmacion_enviado_at: new Date().toISOString() })
      .eq('id', candidato.id)
    recordatoriosEnviados++
  }

  return NextResponse.json({
    ok: true,
    candidatos: (candidatos || []).length,
    recordatorios_enviados: recordatoriosEnviados,
    ya_confirmados: yaConfirmados,
    sin_auth_user_id: sinAuthUserId,
  })
}
