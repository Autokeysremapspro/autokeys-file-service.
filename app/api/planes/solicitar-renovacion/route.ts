import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { sendWhatsAppNotification } from '@/lib/whatsapp'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan variables de entorno de Supabase')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// POST /api/planes/solicitar-renovacion
// Renovar SÍ implica dinero (otro mes de cuota), así que aquí no se
// extiende el plan solo — se marca como "pendiente de confirmar" y se
// avisa al staff (igual que con las solicitudes de alta), que confirma
// el pago y extiende el plan manualmente desde Core.
export async function POST() {
  try {
    const userClient = createServerSupabaseClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const admin = adminClient()
    const { data: distribuidor } = await admin
      .from('akcloud_distribuidores')
      .select('empresa, nombre_contacto, plan_id, akcloud_planes(nombre)')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!distribuidor) return NextResponse.json({ error: 'No se encontró tu cuenta de distribuidor' }, { status: 404 })

    await admin
      .from('akcloud_distribuidores')
      .update({ solicito_renovacion: true, solicito_renovacion_at: new Date().toISOString() })
      .eq('auth_user_id', user.id)

    const nombrePlan = (distribuidor as any).akcloud_planes?.nombre || 'su plan'

    await admin.from('notificaciones').insert({
      usuario_id: null,
      titulo: 'Solicitud de renovación de plan',
      mensaje: `${distribuidor.empresa} (${distribuidor.nombre_contacto}) quiere renovar ${nombrePlan}.`,
      modulo: 'ak_cloud',
      tipo: 'info',
      prioridad: 'normal',
      href: '/ak-cloud/distribuidores',
      accion_texto: 'Revisar renovación',
    })

    await sendWhatsAppNotification(
      `🔁 Renovación pendiente\n${distribuidor.empresa} (${distribuidor.nombre_contacto}) quiere renovar ${nombrePlan}.\n\nConfirmar: /ak-cloud/distribuidores`
    )

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'No se pudo enviar la solicitud de renovación' }, { status: 500 })
  }
}
