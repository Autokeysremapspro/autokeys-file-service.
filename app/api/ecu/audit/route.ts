import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireStaff } from '@/lib/supabase/server'
import {
  buildVerifiedSignatureKey,
  normalizeEcu,
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

function pushIssue(target: any[], issue: Record<string, unknown>) {
  target.push(issue)
}

export async function GET() {
  try {
    await requireStaff()
    const admin = adminClient()

    const [{ data: fingerprints, error: fpError }, { data: signatures, error: sigError }] = await Promise.all([
      admin
        .from('ak_ecu_fingerprints')
        .select('id, sha256, rule_id, vehiculo, marca, modelo, motor, ecu, hw, sw, file_size, confirmado_por, veces_visto'),
      admin
        .from('ak_ecu_verified_signatures')
        .select('id, signature_key, hw_normalized, sw_normalized, file_size, ecu, vehiculo, marca, modelo, motor, confirmaciones, activo, ultima_confirmacion_por'),
    ])

    if (fpError) throw fpError
    if (sigError && sigError.code !== '42P01') throw sigError

    const fingerprintIssues: any[] = []
    const signatureIssues: any[] = []

    for (const row of fingerprints || []) {
      const normalized = normalizeEcuKnowledge({
        vehiculo: row.vehiculo,
        marca: row.marca,
        modelo: row.modelo,
        motor: row.motor,
        ecu: row.ecu,
        hw: row.hw,
        sw: row.sw,
      })
      const storedHw = row.hw == null ? null : String(row.hw).trim()
      const storedSw = row.sw == null ? null : String(row.sw).trim()
      const normalizedHw = normalizeHardware(row.hw)
      const normalizedSw = normalizeSoftware(row.sw)
      const normalizedEcu = normalizeEcu(row.ecu)

      if (!row.rule_id) pushIssue(fingerprintIssues, { type: 'fingerprint_without_rule', id: row.id, sha256: row.sha256 })
      if (!row.confirmado_por) pushIssue(fingerprintIssues, { type: 'fingerprint_not_human_confirmed', id: row.id, sha256: row.sha256 })
      if (!normalizedEcu) pushIssue(fingerprintIssues, { type: 'fingerprint_invalid_ecu', id: row.id, sha256: row.sha256, ecu: row.ecu })
      if (storedHw && storedHw !== normalizedHw) pushIssue(fingerprintIssues, { type: 'fingerprint_hw_not_canonical', id: row.id, sha256: row.sha256, stored: row.hw, canonical: normalizedHw })
      if (storedSw && storedSw !== normalizedSw) pushIssue(fingerprintIssues, { type: 'fingerprint_sw_not_canonical', id: row.id, sha256: row.sha256, stored: row.sw, canonical: normalizedSw })
      if (row.ecu && String(row.ecu).trim() !== normalized.ecu) pushIssue(fingerprintIssues, { type: 'fingerprint_ecu_not_canonical', id: row.id, sha256: row.sha256, stored: row.ecu, canonical: normalized.ecu })
      if (row.marca && String(row.marca).trim() !== normalized.marca) pushIssue(fingerprintIssues, { type: 'fingerprint_brand_not_canonical', id: row.id, sha256: row.sha256, stored: row.marca, canonical: normalized.marca })
      if (row.modelo && String(row.modelo).trim() !== normalized.modelo) pushIssue(fingerprintIssues, { type: 'fingerprint_model_not_canonical', id: row.id, sha256: row.sha256, stored: row.modelo, canonical: normalized.modelo })
    }

    for (const row of signatures || []) {
      const canonicalKey = buildVerifiedSignatureKey({
        hw: row.hw_normalized,
        sw: row.sw_normalized,
        fileSize: Number(row.file_size || 0),
        ecu: row.ecu,
      })
      const normalizedEcu = normalizeEcu(row.ecu)
      const normalizedHw = normalizeHardware(row.hw_normalized)
      const normalizedSw = normalizeSoftware(row.sw_normalized)

      if (!row.ultima_confirmacion_por) pushIssue(signatureIssues, { type: 'signature_without_human_confirmation', id: row.id, signature_key: row.signature_key })
      if (!normalizedEcu || !normalizedHw || !normalizedSw || !canonicalKey) pushIssue(signatureIssues, { type: 'signature_invalid_identity', id: row.id, signature_key: row.signature_key })
      if (canonicalKey && row.signature_key !== canonicalKey) pushIssue(signatureIssues, { type: 'signature_key_not_canonical', id: row.id, stored: row.signature_key, canonical: canonicalKey })
      if (row.hw_normalized !== normalizedHw) pushIssue(signatureIssues, { type: 'signature_hw_not_canonical', id: row.id, stored: row.hw_normalized, canonical: normalizedHw })
      if (row.sw_normalized !== normalizedSw) pushIssue(signatureIssues, { type: 'signature_sw_not_canonical', id: row.id, stored: row.sw_normalized, canonical: normalizedSw })
      if (Number(row.confirmaciones || 0) < 1) pushIssue(signatureIssues, { type: 'signature_invalid_confirmation_count', id: row.id, confirmations: row.confirmaciones })
    }

    return NextResponse.json({
      ok: true,
      read_only: true,
      generated_at: new Date().toISOString(),
      totals: {
        fingerprints: (fingerprints || []).length,
        signatures: (signatures || []).length,
        fingerprint_issues: fingerprintIssues.length,
        signature_issues: signatureIssues.length,
      },
      issues: {
        fingerprints: fingerprintIssues,
        signatures: signatureIssues,
      },
    })
  } catch (error: any) {
    const status = error.message === 'No autorizado' ? 401 : 500
    return NextResponse.json({ error: error.message || 'Error auditando conocimiento ECU' }, { status })
  }
}
