import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireStaff } from '@/lib/supabase/server'
import {
  buildVerifiedSignatureKey,
  normalizeEcuKnowledge,
  normalizeHardware,
  normalizeSoftware,
} from '@/lib/ecu/normalize'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// Solo el personal del laboratorio puede enseñar al detector.
// La confirmación guarda la huella exacta y, cuando existen HW + SW + tamaño,
// incrementa una firma verificada. La firma no se utiliza para identificar hasta
// alcanzar el mínimo de confirmaciones definido por el detector.
export async function POST(request: Request) {
  try {
    const { user } = await requireStaff()
    const body = await request.json()
    const sha256 = String(body.sha256 || '').trim().toLowerCase()
    const fileSize = Number(body.file_size || 0)
    const knowledge = normalizeEcuKnowledge({
      vehiculo: body.vehiculo,
      marca: body.marca,
      modelo: body.modelo,
      motor: body.motor,
      ecu: body.ecu,
      hw: body.hw,
      sw: body.sw,
    })
    const hwNormalized = normalizeHardware(knowledge.hw)
    const swNormalized = normalizeSoftware(knowledge.sw)

    if (!/^[a-f0-9]{64}$/.test(sha256)) {
      return NextResponse.json({ error: 'sha256 no válido' }, { status: 400 })
    }
    if (!knowledge.ecu) {
      return NextResponse.json({ error: 'Debes indicar la ECU real antes de confirmar' }, { status: 400 })
    }
    if (fileSize && (!Number.isSafeInteger(fileSize) || fileSize <= 0)) {
      return NextResponse.json({ error: 'Tamaño de archivo no válido' }, { status: 400 })
    }

    const admin = adminClient()
    const now = new Date().toISOString()
    const { error: fingerprintError } = await admin.from('ak_ecu_fingerprints').upsert(
      {
        sha256,
        rule_id: body.rule_id || null,
        vehiculo: knowledge.vehiculo,
        marca: knowledge.marca,
        modelo: knowledge.modelo,
        motor: knowledge.motor,
        ecu: knowledge.ecu,
        hw: hwNormalized,
        sw: swNormalized,
        file_size: fileSize || null,
        pedido_id: body.pedido_id || null,
        confirmado_por: user.id,
        updated_at: now,
      },
      { onConflict: 'sha256' }
    )
    if (fingerprintError) throw fingerprintError

    let signatureUpdated = false
    const signatureKey = buildVerifiedSignatureKey({
      hw: hwNormalized,
      sw: swNormalized,
      ecu: knowledge.ecu,
      fileSize,
    })

    if (signatureKey && hwNormalized && swNormalized) {
      const { data: existing, error: existingError } = await admin
        .from('ak_ecu_verified_signatures')
        .select('id, confirmaciones')
        .eq('signature_key', signatureKey)
        .maybeSingle()
      if (existingError && existingError.code !== '42P01') throw existingError

      if (existing) {
        const { error } = await admin
          .from('ak_ecu_verified_signatures')
          .update({
            confirmaciones: Number(existing.confirmaciones || 0) + 1,
            vehiculo: knowledge.vehiculo,
            marca: knowledge.marca,
            modelo: knowledge.modelo,
            motor: knowledge.motor,
            updated_at: now,
            ultima_confirmacion_por: user.id,
          })
          .eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await admin.from('ak_ecu_verified_signatures').insert({
          signature_key: signatureKey,
          hw_normalized: hwNormalized,
          sw_normalized: swNormalized,
          file_size: fileSize,
          ecu: knowledge.ecu,
          vehiculo: knowledge.vehiculo,
          marca: knowledge.marca,
          modelo: knowledge.modelo,
          motor: knowledge.motor,
          confirmaciones: 1,
          activo: true,
          ultima_confirmacion_por: user.id,
        })
        if (error && error.code !== '42P01') throw error
      }
      signatureUpdated = true
    }

    return NextResponse.json({ ok: true, fingerprint_saved: true, signature_updated: signatureUpdated })
  } catch (error: any) {
    const status = error.message === 'No autorizado' ? 401 : 500
    return NextResponse.json({ error: error.message || 'Error guardando la identificación' }, { status })
  }
}
