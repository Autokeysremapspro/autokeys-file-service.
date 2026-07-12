import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const body = await request.json()
    const authUserId = String(body.auth_user_id || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const empresa = String(body.empresa || '').trim()
    const nombre = String(body.nombre || '').trim()

    if (!authUserId || !email || !empresa || !nombre) {
      return NextResponse.json({ error: 'Faltan datos obligatorios de la solicitud' }, { status: 400 })
    }

    const admin = adminClient()
    const { data: authData, error: authError } = await admin.auth.admin.getUserById(authUserId)
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'No se ha podido verificar la cuenta creada' }, { status: 400 })
    }
    if ((authData.user.email || '').toLowerCase() !== email) {
      return NextResponse.json({ error: 'El email de la solicitud no coincide con la cuenta creada' }, { status: 400 })
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
    return NextResponse.json({ ok: true, id: data.id })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'No se pudo registrar la solicitud en Autokeys Core' },
      { status: 500 }
    )
  }
}
