import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendNotificationEmail, escapeHtml } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const DIAS_AVISO = 17
const DIAS_DESACTIVACION = 20

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Falta la configuración de Supabase')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const admin = adminClient()
  const now = Date.now()
  const warningCutoff = new Date(now - DIAS_AVISO * 24 * 60 * 60 * 1000).toISOString()

  const { data: candidates, error } = await admin
    .from('akcloud_distribuidores')
    .select('id, auth_user_id, email, nombre_contacto, empresa, acceso_inmediato_at, aviso_inactividad_enviado_at')
    .eq('estado', 'activo')
    .not('acceso_inmediato_at', 'is', null)
    .is('primer_acceso_at', null)
    .lte('acceso_inmediato_at', warningCutoff)
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let warned = 0
  let suspended = 0
  let accessRecovered = 0

  for (const account of candidates || []) {
    const { data: authData, error: authError } = await admin.auth.admin.getUserById(account.auth_user_id)

    // Ante un fallo temporal de Auth no asumimos que la cuenta nunca entró:
    // es más seguro volver a comprobarla en la siguiente ejecución.
    if (authError || !authData?.user) continue

    // Supabase Auth conserva last_sign_in_at. Si hubo acceso pero el aviso
    // interno falló, lo recuperamos aquí y evitamos una suspensión incorrecta.
    if (authData.user.last_sign_in_at) {
      await admin
        .from('akcloud_distribuidores')
        .update({
          primer_acceso_at: authData.user.last_sign_in_at,
          ultimo_acceso: authData.user.last_sign_in_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', account.id)
      accessRecovered++
      continue
    }

    const startedAt = new Date(account.acceso_inmediato_at).getTime()
    const ageDays = (now - startedAt) / (24 * 60 * 60 * 1000)

    if (ageDays >= DIAS_DESACTIVACION) {
      const timestamp = new Date().toISOString()
      await admin
        .from('akcloud_distribuidores')
        .update({ estado: 'suspendido', desactivada_por_inactividad_at: timestamp, updated_at: timestamp })
        .eq('id', account.id)

      await sendNotificationEmail({
        to: account.email,
        subject: 'Tu cuenta AK Cloud se ha pausado por inactividad',
        title: 'Cuenta pausada temporalmente',
        bodyHtml: `Hola ${escapeHtml(account.nombre_contacto || '')},<br><br>La cuenta de <b>${escapeHtml(account.empresa || 'tu taller')}</b> se ha pausado porque no se inició sesión durante los primeros ${DIAS_DESACTIVACION} días.<br><br>No has perdido tus datos. Inicia sesión cuando quieras y la cuenta se reactivará automáticamente.`,
        ctaHref: 'https://www.akcloud.es/login',
        ctaLabel: 'Reactivar mi cuenta',
      })
      suspended++
      continue
    }

    if (!account.aviso_inactividad_enviado_at) {
      const timestamp = new Date().toISOString()
      await sendNotificationEmail({
        to: account.email,
        subject: 'Tu acceso a AK Cloud sigue disponible',
        title: 'Entra en AK Cloud para mantener activa tu cuenta',
        bodyHtml: `Hola ${escapeHtml(account.nombre_contacto || '')},<br><br>Tu cuenta para <b>${escapeHtml(account.empresa || 'tu taller')}</b> está activa, pero todavía no has iniciado sesión. Entra antes de que se cumplan ${DIAS_DESACTIVACION} días desde el registro para mantenerla activa.`,
        ctaHref: 'https://www.akcloud.es/login',
        ctaLabel: 'Iniciar sesión',
      })
      await admin
        .from('akcloud_distribuidores')
        .update({ aviso_inactividad_enviado_at: timestamp, updated_at: timestamp })
        .eq('id', account.id)
      warned++
    }
  }

  return NextResponse.json({
    ok: true,
    candidates: (candidates || []).length,
    warned,
    suspended,
    access_recovered: accessRecovered,
  })
}
