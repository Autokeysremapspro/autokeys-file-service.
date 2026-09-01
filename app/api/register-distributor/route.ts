import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsAppNotification } from '@/lib/whatsapp'
import { sendNotificationEmail } from '@/lib/email'

const SIGNUP_REDIRECT_URL = 'https://www.akcloud.es/login?confirmado=1'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel')
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function publicAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel')
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function clean(value: unknown) {
  const text = String(value ?? '').trim()
  return text || null
}

export async function POST(request: Request) {
  const startedAt = Date.now()
  let emailForLog = ''

  try {
    const body = await request.json()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const empresa = String(body.empresa || '').trim()
    const nombre = String(body.nombre || '').trim()
    const mensaje = clean(body.mensaje)
    emailForLog = email

    if (!email || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || !empresa || !nombre || !clean(body.telefono) || !clean(body.ciudad)) {
      return NextResponse.json({ error: 'Faltan datos obligatorios de la solicitud' }, { status: 400 })
    }

    console.info('[register-distributor] signup started', { emailDomain: email.split('@')[1] || 'unknown' })

    const auth = publicAuthClient()
    const { data: signUp, error: signUpError } = await auth.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: SIGNUP_REDIRECT_URL,
        data: {
          empresa,
          nombre,
          telefono: clean(body.telefono),
          ciudad: clean(body.ciudad),
          mensaje,
          tipo_usuario: 'distribuidor',
          estado_acceso: 'pendiente',
        },
      },
    })

    if (signUpError) {
      console.error('[register-distributor] auth signup failed', { message: signUpError.message, status: signUpError.status })
      return NextResponse.json({ error: signUpError.message }, { status: signUpError.status || 400 })
    }

    const admin = adminClient()

    // Supabase no revela si un email ya existe. En ese caso puede devolver un
    // usuario ofuscado sin identidades: nunca debemos vincular ese ID ficticio
    // a una solicitud real.
    if (signUp.user && Array.isArray(signUp.user.identities) && signUp.user.identities.length === 0) {
      const { data: pending, error: pendingError } = await admin
        .from('akcloud_solicitudes_distribuidores')
        .select('id')
        .ilike('email', email)
        .in('estado', ['pendiente', 'informacion_solicitada'])
        .limit(1)
        .maybeSingle()
      if (pendingError) throw pendingError
      if (pending?.id) {
        return NextResponse.json({ ok: true, requestId: pending.id, reused: true })
      }
      return NextResponse.json({ error: 'Ya existe una cuenta con este email. Inicia sesión o recupera tu contraseña.' }, { status: 409 })
    }

    const authUserId = signUp.user?.id
    if (!authUserId) {
      throw new Error('Supabase Auth no devolvió el identificador del usuario')
    }

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
      observaciones: mensaje,
      estado: 'pendiente',
      motivo_estado: null,
      updated_at: new Date().toISOString(),
    }

    const { data: existingByUser, error: existingByUserError } = await admin
      .from('akcloud_solicitudes_distribuidores')
      .select('id,estado')
      .eq('auth_user_id', authUserId)
      .in('estado', ['pendiente', 'informacion_solicitada'])
      .limit(1)
      .maybeSingle()

    if (existingByUserError) throw existingByUserError

    let existing = existingByUser
    if (!existing) {
      const { data: existingByEmail, error: existingByEmailError } = await admin
        .from('akcloud_solicitudes_distribuidores')
        .select('id,estado')
        .ilike('email', email)
        .in('estado', ['pendiente', 'informacion_solicitada'])
        .limit(1)
        .maybeSingle()
      if (existingByEmailError) throw existingByEmailError
      existing = existingByEmail
    }

    if (existing?.id) {
      const { error } = await admin
        .from('akcloud_solicitudes_distribuidores')
        .update(payload)
        .eq('id', existing.id)
      if (error) throw error
    } else {
      const { error } = await admin
        .from('akcloud_solicitudes_distribuidores')
        .insert(payload)
      if (error) throw error
    }

    const { data: confirmed, error: confirmError } = await admin
      .from('akcloud_solicitudes_distribuidores')
      .select('id,estado')
      .eq('auth_user_id', authUserId)
      .in('estado', ['pendiente', 'informacion_solicitada'])
      .limit(1)
      .maybeSingle()

    if (confirmError) throw confirmError
    if (!confirmed?.id) throw new Error('La solicitud no quedó confirmada en AK Core')

    // El aviso en el centro de notificaciones de Core (y el push real) ya lo
    // dispara solo el trigger trg_akcore_notify_distributor_request en cuanto
    // se inserta la fila de arriba en akcloud_solicitudes_distribuidores — si
    // además insertamos aquí, sale duplicado en el centro de avisos. Lo que
    // sí falta cubrir aquí es WhatsApp y email, que el trigger no manda.
    await sendWhatsAppNotification(
      `🆕 Nueva solicitud AK Cloud\n${empresa} (${nombre})\n${email}${clean(body.ciudad) ? `\nCiudad: ${body.ciudad}` : ''}${clean(body.especialidad) ? `\nEspecialidad: ${body.especialidad}` : ''}${mensaje ? `\nMensaje: ${mensaje}` : ''}\n\nRevisar: ${process.env.NEXT_PUBLIC_CORE_URL ? `${process.env.NEXT_PUBLIC_CORE_URL}/ak-cloud/solicitudes` : '/ak-cloud/solicitudes'}`
    )

    if (process.env.STAFF_NOTIFICATION_EMAIL) {
      await sendNotificationEmail({
        to: process.env.STAFF_NOTIFICATION_EMAIL,
        subject: `Nueva solicitud de distribuidor: ${empresa}`,
        title: 'Nueva solicitud de distribuidor',
        bodyHtml: `<b>${empresa}</b> (${nombre}, ${email}) ha solicitado acceso como distribuidor en AK Cloud.${clean(body.ciudad) ? `<br>Ciudad: ${body.ciudad}` : ''}${clean(body.especialidad) ? `<br>Especialidad: ${body.especialidad}` : ''}${mensaje ? `<br>Mensaje: ${mensaje}` : ''}`,
        ctaHref: process.env.NEXT_PUBLIC_CORE_URL ? `${process.env.NEXT_PUBLIC_CORE_URL}/ak-cloud/solicitudes` : undefined,
        ctaLabel: 'Revisar solicitud',
      })
    }

    console.info('[register-distributor] request confirmed', {
      requestId: confirmed.id,
      reused: Boolean(existing?.id),
      durationMs: Date.now() - startedAt,
    })

    return NextResponse.json({ ok: true, requestId: confirmed.id, reused: Boolean(existing?.id) })
  } catch (error: any) {
    console.error('[register-distributor] request failed', {
      emailDomain: emailForLog.split('@')[1] || 'unknown',
      message: error?.message || String(error),
      durationMs: Date.now() - startedAt,
    })
    return NextResponse.json(
      { error: error?.message || 'No se pudo registrar la solicitud en Autokeys Core' },
      { status: 500 }
    )
  }
}
