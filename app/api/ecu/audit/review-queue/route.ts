import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireStaff } from '@/lib/supabase/server'

const KNOWN_SINGLE_TOKEN_BRANDS = new Set([
  'AUDI',
  'SEAT',
  'VOLKSWAGEN',
  'VW',
  'SKODA',
  'BMW',
  'MINI',
  'OPEL',
  'PEUGEOT',
  'CITROEN',
  'FIAT',
  'FORD',
  'RENAULT',
  'NISSAN',
  'TOYOTA',
  'MERCEDES',
])

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function detectedBrandTokens(value: unknown) {
  if (typeof value !== 'string') return []
  return value
    .trim()
    .toUpperCase()
    .split(/\s+/)
    .filter((token) => KNOWN_SINGLE_TOKEN_BRANDS.has(token))
}

export async function GET() {
  try {
    await requireStaff()
    const admin = adminClient()

    const { data: rules, error } = await admin
      .from('ak_ecu_detection_rules')
      .select('id, fabricante, ecu, familia, marcas, vehiculo, modelo, motor, anios, notas, activo')
      .eq('activo', true)
      .order('ecu', { ascending: true })

    if (error) throw error

    const queue = (rules || []).flatMap((rule) => {
      return (rule.marcas || []).flatMap((brandEntry: unknown) => {
        const tokens = detectedBrandTokens(brandEntry)
        if (tokens.length < 2) return []

        return [{
          review_type: 'compound_brand_entry',
          rule_id: rule.id,
          fabricante: rule.fabricante,
          ecu: rule.ecu,
          familia: rule.familia,
          stored_brand_entry: brandEntry,
          detected_brand_tokens: tokens,
          context: {
            vehiculo: rule.vehiculo,
            modelo: rule.modelo,
            motor: rule.motor,
            anios: rule.anios,
            notas: rule.notas,
          },
          requires_human_decision: true,
          auto_fix: false,
        }]
      })
    })

    return NextResponse.json({
      ok: true,
      read_only: true,
      generated_at: new Date().toISOString(),
      total: queue.length,
      policy: {
        requires_human_decision: true,
        auto_fix: false,
        modifies_ecu_files: false,
      },
      queue,
    })
  } catch (error: any) {
    const status = error.message === 'No autorizado' ? 401 : 500
    return NextResponse.json({ error: error.message || 'Error generando cola de revisión ECU' }, { status })
  }
}
