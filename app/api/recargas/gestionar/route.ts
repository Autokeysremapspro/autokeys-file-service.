import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireStaff } from '@/lib/supabase/server'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// POST /api/recargas/gestionar — aprobar/rechazar desde el panel propio de AK Cloud
// (equivalente local a /api/ak-cloud/recargas de Core, para cuando se gestiona
// directamente desde /admin/recargas en vez de desde Core).
// body: { id, accion: 'aprobar' | 'rechazar', notas_admin? }
export async function POST(request: Request) {
  try {
    await requireStaff()
    const body = await request.json()
    const id = String(body.id || '')
    const accion = String(body.accion || '')
    if (!id || !['aprobar', 'rechazar'].includes(accion)) {
      return NextResponse.json({ error: 'Datos no válidos' }, { status: 400 })
    }

    const admin = adminClient()
    const { data: recarga, error: fetchError } = await admin
      .from('ak_creditos_recargas')
      .select('*')
      .eq('id', id)
      .single()
    if (fetchError) throw fetchError
    if (recarga.estado !== 'pendiente') {
      return NextResponse.json({ error: 'Esta recarga ya fue procesada' }, { status: 409 })
    }

    const estado = accion === 'aprobar' ? 'aprobado' : 'rechazado'
    const { error: updateError } = await admin
      .from('ak_creditos_recargas')
      .update({ estado, notas_admin: body.notas_admin ?? recarga.notas_admin ?? null, aprobada_at: new Date().toISOString() })
      .eq('id', id)
    if (updateError) throw updateError

    if (accion === 'aprobar' && recarga.user_id) {
      const { error: creditoError } = await admin.rpc('ak_anadir_creditos', {
        p_user_id: recarga.user_id,
        p_creditos: Number(recarga.creditos || 0),
        p_concepto: `Recarga aprobada: ${recarga.creditos} créditos`,
        p_tipo: 'recarga',
      })
      if (creditoError) throw creditoError

      await admin.from('file_service_notificaciones').insert({
        user_id: recarga.user_id,
        titulo: 'Recarga aprobada',
        mensaje: `Se han añadido ${recarga.creditos} créditos a tu cuenta.`,
        tipo: 'success',
      })
    } else if (accion === 'rechazar' && recarga.user_id) {
      await admin.from('file_service_notificaciones').insert({
        user_id: recarga.user_id,
        titulo: 'Recarga revisada',
        mensaje: 'Tu solicitud de recarga ha sido revisada. Contacta con Autokeys si necesitas más información.',
        tipo: 'warning',
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    const status = error.message === 'No autorizado' ? 401 : 500
    return NextResponse.json({ error: error.message || 'Error procesando la recarga' }, { status })
  }
}
