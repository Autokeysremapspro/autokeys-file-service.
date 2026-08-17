import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireStaff } from '@/lib/supabase/server'

type BrandPattern = { canonical: string; aliases: string[] }

// Review-only lexicon. Aliases collapse to a canonical brand so values such as
// "VW VOLKSWAGEN" do not become a false multi-brand warning, while entries
// such as "Land Rover BMW" are still surfaced for human review.
const KNOWN_BRAND_PATTERNS: BrandPattern[] = [
  { canonical: 'AUDI', aliases: ['AUDI'] },
  { canonical: 'SEAT', aliases: ['SEAT'] },
  { canonical: 'VOLKSWAGEN', aliases: ['VOLKSWAGEN', 'VW'] },
  { canonical: 'SKODA', aliases: ['SKODA'] },
  { canonical: 'BMW', aliases: ['BMW'] },
  { canonical: 'MINI', aliases: ['MINI'] },
  { canonical: 'MERCEDES-BENZ', aliases: ['MERCEDES BENZ', 'MERCEDES-BENZ', 'MERCEDES'] },
  { canonical: 'LAND ROVER', aliases: ['LAND ROVER'] },
  { canonical: 'RANGE ROVER', aliases: ['RANGE ROVER'] },
  { canonical: 'ALFA ROMEO', aliases: ['ALFA ROMEO'] },
  { canonical: 'OPEL', aliases: ['OPEL'] },
  { canonical: 'VAUXHALL', aliases: ['VAUXHALL'] },
  { canonical: 'PEUGEOT', aliases: ['PEUGEOT'] },
  { canonical: 'CITROEN', aliases: ['CITROEN', 'CITROËN'] },
  { canonical: 'DS', aliases: ['DS AUTOMOBILES', 'DS'] },
  { canonical: 'FIAT', aliases: ['FIAT'] },
  { canonical: 'ABARTH', aliases: ['ABARTH'] },
  { canonical: 'FORD', aliases: ['FORD'] },
  { canonical: 'RENAULT', aliases: ['RENAULT'] },
  { canonical: 'DACIA', aliases: ['DACIA'] },
  { canonical: 'NISSAN', aliases: ['NISSAN'] },
  { canonical: 'TOYOTA', aliases: ['TOYOTA'] },
  { canonical: 'LEXUS', aliases: ['LEXUS'] },
  { canonical: 'HONDA', aliases: ['HONDA'] },
  { canonical: 'MAZDA', aliases: ['MAZDA'] },
  { canonical: 'MITSUBISHI', aliases: ['MITSUBISHI'] },
  { canonical: 'HYUNDAI', aliases: ['HYUNDAI'] },
  { canonical: 'KIA', aliases: ['KIA'] },
  { canonical: 'VOLVO', aliases: ['VOLVO'] },
  { canonical: 'PORSCHE', aliases: ['PORSCHE'] },
  { canonical: 'JEEP', aliases: ['JEEP'] },
]

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function normalizeBrandText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function containsAlias(normalizedValue: string, alias: string) {
  const normalizedAlias = normalizeBrandText(alias)
  if (!normalizedAlias) return false
  return ` ${normalizedValue} `.includes(` ${normalizedAlias} `)
}

function detectedBrandTokens(value: unknown) {
  if (typeof value !== 'string') return []
  const normalized = normalizeBrandText(value)
  if (!normalized) return []

  const detected = new Set<string>()
  for (const brand of KNOWN_BRAND_PATTERNS) {
    if (brand.aliases.some((alias) => containsAlias(normalized, alias))) detected.add(brand.canonical)
  }
  return Array.from(detected).sort((a, b) => a.localeCompare(b))
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

        const storedBrandEntry = typeof brandEntry === 'string' ? brandEntry : String(brandEntry ?? '')
        const normalizedBrandEntry = normalizeBrandText(storedBrandEntry)

        return [{
          review_type: 'compound_brand_entry',
          review_reason: 'La misma entrada contiene dos o más marcas canónicas distintas y requiere decisión humana antes de corregirla o dividirla.',
          rule_id: rule.id,
          fabricante: rule.fabricante,
          ecu: rule.ecu,
          familia: rule.familia,
          stored_brand_entry: brandEntry,
          normalized_brand_entry: normalizedBrandEntry,
          detected_brand_tokens: tokens,
          detected_brand_count: tokens.length,
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
    }).sort((a, b) => {
      const ecuCompare = String(a.ecu || '').localeCompare(String(b.ecu || ''))
      if (ecuCompare !== 0) return ecuCompare
      const ruleCompare = String(a.rule_id || '').localeCompare(String(b.rule_id || ''))
      if (ruleCompare !== 0) return ruleCompare
      return String(a.normalized_brand_entry || '').localeCompare(String(b.normalized_brand_entry || ''))
    })

    return NextResponse.json({
      ok: true,
      read_only: true,
      source_scope: 'active_ecu_detection_rules',
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
