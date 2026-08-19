import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsAppNotification } from '@/lib/whatsapp'
import { sendNotificationEmail } from '@/lib/email'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel')
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function clean(value: unknown) {
  const text = String(value ?? '').trim()
  return text || null
}

export async function POST(request: Request) {
  try {
    // La cuenta se acaba de crear con supabase.auth.signUp() en el navegador,
    // que sincroniza la sesión en cookies (ver lib/supabase.ts). No confiamos
    // en el auth_user_id que manda el body: se verifica contra la sesión real,
    // así nadie puede crear/sobrescribir la solicitud de otra cuenta.
    const sessionClient = createServerSupabaseClient()
    const { data: { user: sessionUser } } = await sessionClient.auth.getUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Sesión requerida para enviar la solicitud' }, { status: 401 })
    }

    const body = await request.json()
    const authUserId = sessionUser.id
    const email = (sessionUser.email || '').trim().toLowerCase()
    const empresa = String(body.empresa || '').trim()
    const nombre = String(body.nombre || '').trim()

    if (!authUserId || !email || !empresa || !nombre) {
      return NextResponse.json({ error: 'Faltan datos obligatorios de la solicitud' }, { status: 400 })
    }

    const admin = adminClient()

    const payload = {
      auth_user_id: authUserId,
      email,
      empresa,
      nombre,
      telefono: clean(body.telefono),
      nif: clean(body.nif),
      ciudad: clean(body.ciudad),
      especialidad: clean(body.especialidad),
      herramientas: Array.isArray(body.herramientas) ? body.herramientas.map(String) : [],
      estado: 'pendiente',
      motivo_estado: null,
      updated_at: new Date().toISOString(),
    }

    const { data: existing, error: existingError } = await admin
      .from('akcloud_solicitudes_distribuidores')
      .select('id,estado')
      .ilike('email', email)
      .in('estado', ['pendiente', 'informacion_solicitada'])
      .limit(1)
      .maybeSingle()

    if (existingError) throw existingError

    if (existing?.id) {
      const { error } = await admin
        .from('akcloud_solicitudes_distribuidores')
        .update(payload)
        .eq('id', existing.id)
      if (error) throw error
      return NextResponse.json({ ok: true, id: existing.id, reused: true })
    }

    const { data, error } = await admin
      .from('akcloud_solicitudes_distribuidores')
      .insert(payload)
      .select('id')
      .single()

    if (error) throw error

    // Avisa a Core: sin esto, la solicitud se creaba bien en la base de
    // datos pero nadie del staff se enteraba salvo que entrara a mirar
    // /ak-cloud/solicitudes por su cuenta. Se inserta en el centro de
    // notificaciones interno de Core (usuario_id null = para todo el
    // staff) y, si hay RESEND_API_KEY, también un email al staff.
    await admin.from('notificaciones').insert({
      usuario_id: null,
      titulo: 'Nueva solicitud de distribuidor AK Cloud',
      mensaje: `${empresa} (${nombre}) ha solicitado acceso como distribuidor.`,
      modulo: 'ak_cloud',
      tipo: 'info',
      prioridad: 'normal',
      href: '/ak-cloud/solicitudes',
      accion_texto: 'Revisar solicitud',
    })

    await sendWhatsAppNotification(
      `🆕 Nueva solicitud AK Cloud\n${empresa} (${nombre})\n${email}${clean(body.ciudad) ? `\nCiudad: ${body.ciudad}` : ''}${clean(body.especialidad) ? `\nEspecialidad: ${body.especialidad}` : ''}\n\nRevisar: ${process.env.NEXT_PUBLIC_CORE_URL ? `${process.env.NEXT_PUBLIC_CORE_URL}/ak-cloud/solicitudes` : '/ak-cloud/solicitudes'}`
    )

    if (process.env.STAFF_NOTIFICATION_EMAIL) {
      await sendNotificationEmail({
        to: process.env.STAFF_NOTIFICATION_EMAIL,
        subject: `Nueva solicitud de distribuidor: ${empresa}`,
        title: 'Nueva solicitud de distribuidor',
        bodyHtml: `<b>${empresa}</b> (${nombre}, ${email}) ha solicitado acceso como distribuidor en AK Cloud.${clean(body.ciudad) ? `<br>Ciudad: ${body.ciudad}` : ''}${clean(body.especialidad) ? `<br>Especialidad: ${body.especialidad}` : ''}`,
        ctaHref: process.env.NEXT_PUBLIC_CORE_URL ? `${process.env.NEXT_PUBLIC_CORE_URL}/ak-cloud/solicitudes` : undefined,
        ctaLabel: 'Revisar solicitud',
      })
    }

    return NextResponse.json({ ok: true, id: data.id })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'No se pudo registrar la solicitud en Autokeys Core' },
      { status: 500 }
    )
  }
}
