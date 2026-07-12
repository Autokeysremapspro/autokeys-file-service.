import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { sendWhatsAppNotification } from '@/lib/whatsapp'
import { sendNotificationEmail } from '@/lib/email'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan variables de entorno de Supabase')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// POST /api/planes/elegir — body: { plan_id }
// Se llama desde la ventana de bienvenida ("elige tu plan") la primera vez
// que el distribuidor entra. Si elige Free, se activa al instante (no mueve
// dinero). Si elige un plan de pago, queda pendiente de que el staff
// confirme el pago — se marca igual que una solicitud de renovación, para
// que aparezca en /ak-cloud/distribuidores sin tener que construir una
// pantalla nueva para esto.
export async function POST(request: Request) {
  try {
    const userClient = createServerSupabaseClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json()
    const planId = String(body.plan_id || '')
    if (!planId) return NextResponse.json({ error: 'Falta el plan elegido' }, { status: 400 })

    const admin = adminClient()
    const { data: plan } = await admin.from('akcloud_planes').select('id, nombre, slug, duracion_dias').eq('id', planId).maybeSingle()
    if (!plan) return NextResponse.json({ error: 'Ese plan no existe' }, { status: 404 })

    const { data: distribuidor } = await admin
      .from('akcloud_distribuidores')
      .select('empresa, nombre_contacto')
      .eq('auth_user_id', user.id)
      .maybeSingle()
    if (!distribuidor) return NextResponse.json({ error: 'No se encontró tu cuenta de distribuidor' }, { status: 404 })

    const esFree = plan.slug === 'free'
    const ahora = new Date()
    const expira = !esFree && plan.duracion_dias ? new Date(ahora.getTime() + plan.duracion_dias * 24 * 60 * 60 * 1000) : null

    await admin
      .from('akcloud_distribuidores')
      .update({
        plan_id: plan.id,
        onboarding_completado: true,
        // Free: activo ya mismo, sin caducidad. De pago: no se activa la
        // fecha todavía — se queda pendiente hasta que el staff lo confirme.
        plan_inicio_at: esFree ? ahora.toISOString() : null,
        plan_expira_at: esFree ? null : null,
        solicito_renovacion: !esFree,
        solicito_renovacion_at: !esFree ? ahora.toISOString() : null,
      })
      .eq('auth_user_id', user.id)

    if (!esFree) {
      await sendWhatsAppNotification(
        `🆕 Elección de plan\n${distribuidor.empresa} (${distribuidor.nombre_contacto}) ha elegido el plan ${plan.nombre} por primera vez.\n\nConfirmar pago: /ak-cloud/distribuidores`
      )
      if (process.env.STAFF_NOTIFICATION_EMAIL) {
        await sendNotificationEmail({
          to: process.env.STAFF_NOTIFICATION_EMAIL,
          subject: `${distribuidor.empresa} eligió el plan ${plan.nombre}`,
          title: 'Elección de plan inicial',
          bodyHtml: `<b>${distribuidor.empresa}</b> (${distribuidor.nombre_contacto}) ha elegido el plan <b>${plan.nombre}</b> al entrar por primera vez. Confirma el pago desde Core para activarlo.`,
          ctaHref: '/ak-cloud/distribuidores',
          ctaLabel: 'Confirmar plan',
        })
      }
    }

    return NextResponse.json({ ok: true, esFree })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'No se pudo guardar tu elección' }, { status: 500 })
  }
}
