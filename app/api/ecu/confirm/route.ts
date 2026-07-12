import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireStaff } from '@/lib/supabase/server'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// POST /api/ecu/confirm — un técnico confirma la identificación real de un archivo.
// A partir de aquí, la próxima vez que llegue el MISMO archivo (mismo sha256),
// /api/ecu/detect lo reconocerá al instante por huella exacta.
// body: { sha256, vehiculo, marca, modelo, motor, ecu, hw, sw, rule_id?, pedido_id?, file_size? }
export async function POST(request: Request) {
  try {
    const { user } = await requireStaff()
    const body = await request.json()
    const sha256 = String(body.sha256 || '')
    if (!sha256 || sha256.length !== 64) {
      return NextResponse.json({ error: 'sha256 no válido' }, { status: 400 })
    }

    const admin = adminClient()
    const { error } = await admin.from('ak_ecu_fingerprints').upsert(
      {
        sha256,
        rule_id: body.rule_id || null,
        vehiculo: body.vehiculo || null,
        marca: body.marca || null,
        modelo: body.modelo || null,
        motor: body.motor || null,
        ecu: body.ecu || null,
        hw: body.hw || null,
        sw: body.sw || null,
        file_size: body.file_size || null,
        pedido_id: body.pedido_id || null,
        confirmado_por: user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'sha256' }
    )
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    const status = error.message === 'No autorizado' ? 401 : 500
    return NextResponse.json({ error: error.message || 'Error guardando la huella' }, { status })
  }
}
