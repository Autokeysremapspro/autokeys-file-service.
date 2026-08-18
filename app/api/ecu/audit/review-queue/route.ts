import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireStaff } from '@/lib/supabase/server'

type BrandPattern = { canonical: string; aliases: string[] }

type ReviewContext = {
  vehiculo: unknown
  modelo: unknown
  motor: unknown
  anios: unknown
  notas: unknown
}

type ReviewItemBase = {
  review_reason: string
  review_priority: 'high' | 'medium' | 'low'
  rule_id: unknown
  fabricante: unknown
  ecu: unknown
  familia: unknown
  context: ReviewContext
  requires_human_decision: true
  auto_fix: false
}

type MissingManufacturerReview = ReviewItemBase & {
  review_type: 'missing_manufacturer'
  stored_manufacturer: unknown
}

type MissingEcuIdentifierReview = ReviewItemBase & {
  review_type: 'missing_ecu_identifier'
  stored_ecu: unknown
}

type MissingFamilyReview = ReviewItemBase & {
  review_type: 'missing_family'
  stored_family: unknown
}

type InvalidBrandContainerReview = ReviewItemBase & {
  review_type: 'invalid_brand_container'
  stored_brand_container: unknown
  stored_brand_container_type: string
}

type MissingBrandCoverageReview = ReviewItemBase & {
  review_type: 'missing_brand_coverage'
  stored_brand_container: null | unknown[]
}

type InvalidBrandEntryReview = ReviewItemBase & {
  review_type: 'invalid_brand_entry'
  stored_brand_entry: unknown
  stored_brand_entry_type: string
}

type EmptyBrandEntryReview = ReviewItemBase & {
  review_type: 'empty_brand_entry'
  stored_brand_entry: string
}

type UnknownBrandEntryReview = ReviewItemBase & {
  review_type: 'unknown_brand_entry'
  stored_brand_entry: string
  normalized_brand_entry: string
}

type CompoundBrandEntryReview = ReviewItemBase & {
  review_type: 'compound_brand_entry'
  stored_brand_entry: unknown
  normalized_brand_entry: string
  detected_brand_tokens: string[]
  detected_brand_count: number
}

type DuplicateCanonicalBrandReview = ReviewItemBase & {
  review_type: 'duplicate_canonical_brand'
  canonical_brand: string
  stored_brand_entries: string[]
  duplicate_count: number
}

type ReviewItem =
  | MissingManufacturerReview
  | MissingEcuIdentifierReview
  | MissingFamilyReview
  | InvalidBrandContainerReview
  | MissingBrandCoverageReview
  | InvalidBrandEntryReview
  | EmptyBrandEntryReview
  | UnknownBrandEntryReview
  | CompoundBrandEntryReview
  | DuplicateCanonicalBrandReview

const KNOWN_BRAND_PATTERNS: BrandPattern[] = [
  { canonical: 'AUDI', aliases: ['AUDI'] }, { canonical: 'SEAT', aliases: ['SEAT'] },
  { canonical: 'VOLKSWAGEN', aliases: ['VOLKSWAGEN', 'VW'] }, { canonical: 'SKODA', aliases: ['SKODA'] },
  { canonical: 'BMW', aliases: ['BMW'] }, { canonical: 'MINI', aliases: ['MINI'] },
  { canonical: 'MERCEDES-BENZ', aliases: ['MERCEDES BENZ', 'MERCEDES-BENZ', 'MERCEDES'] },
  { canonical: 'LAND ROVER', aliases: ['LAND ROVER'] }, { canonical: 'RANGE ROVER', aliases: ['RANGE ROVER'] },
  { canonical: 'ALFA ROMEO', aliases: ['ALFA ROMEO'] }, { canonical: 'OPEL', aliases: ['OPEL'] },
  { canonical: 'VAUXHALL', aliases: ['VAUXHALL'] }, { canonical: 'PEUGEOT', aliases: ['PEUGEOT'] },
  { canonical: 'CITROEN', aliases: ['CITROEN', 'CITROËN'] }, { canonical: 'DS', aliases: ['DS AUTOMOBILES', 'DS'] },
  { canonical: 'FIAT', aliases: ['FIAT'] }, { canonical: 'ABARTH', aliases: ['ABARTH'] },
  { canonical: 'FORD', aliases: ['FORD'] }, { canonical: 'RENAULT', aliases: ['RENAULT'] },
  { canonical: 'DACIA', aliases: ['DACIA'] }, { canonical: 'NISSAN', aliases: ['NISSAN'] },
  { canonical: 'TOYOTA', aliases: ['TOYOTA'] }, { canonical: 'LEXUS', aliases: ['LEXUS'] },
  { canonical: 'HONDA', aliases: ['HONDA'] }, { canonical: 'MAZDA', aliases: ['MAZDA'] },
  { canonical: 'MITSUBISHI', aliases: ['MITSUBISHI'] }, { canonical: 'HYUNDAI', aliases: ['HYUNDAI'] },
  { canonical: 'KIA', aliases: ['KIA'] }, { canonical: 'VOLVO', aliases: ['VOLVO'] },
  { canonical: 'PORSCHE', aliases: ['PORSCHE'] }, { canonical: 'JEEP', aliases: ['JEEP'] },
]

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function normalizeBrandText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function containsAlias(normalizedValue: string, alias: string) {
  const normalizedAlias = normalizeBrandText(alias)
  return normalizedAlias ? ` ${normalizedValue} `.includes(` ${normalizedAlias} `) : false
}

function detectedBrandTokens(value: unknown) {
  if (typeof value !== 'string') return []
  const normalized = normalizeBrandText(value)
  if (!normalized) return []
  const detected = new Set<string>()
  for (const brand of KNOWN_BRAND_PATTERNS) if (brand.aliases.some((alias) => containsAlias(normalized, alias))) detected.add(brand.canonical)
  return Array.from(detected).sort((a, b) => a.localeCompare(b))
}

function commonContext(rule: any): ReviewContext {
  return { vehiculo: rule.vehiculo, modelo: rule.modelo, motor: rule.motor, anios: rule.anios, notas: rule.notas }
}

export async function GET() {
  try {
    await requireStaff()
    const admin = adminClient()
    const { data: rules, error } = await admin.from('ak_ecu_detection_rules').select('id, fabricante, ecu, familia, marcas, vehiculo, modelo, motor, anios, notas, activo').eq('activo', true).order('ecu', { ascending: true })
    if (error) throw error

    const queue = (rules || []).flatMap<ReviewItem>((rule) => {
      const integrityReviews: ReviewItem[] = []

      const normalizedManufacturer = typeof rule.fabricante === 'string' ? normalizeBrandText(rule.fabricante) : ''
      if (!normalizedManufacturer) {
        integrityReviews.push({
          review_type: 'missing_manufacturer',
          review_reason: 'La regla está activa pero no contiene un fabricante utilizable. Requiere revisión humana antes de usarla como fuente de detección o aprendizaje.',
          review_priority: 'high',
          rule_id: rule.id,
          fabricante: rule.fabricante,
          ecu: rule.ecu,
          familia: rule.familia,
          stored_manufacturer: rule.fabricante,
          context: commonContext(rule),
          requires_human_decision: true,
          auto_fix: false,
        })
      }

      const normalizedEcu = typeof rule.ecu === 'string' ? normalizeBrandText(rule.ecu) : ''
      if (!normalizedEcu) {
        integrityReviews.push({
          review_type: 'missing_ecu_identifier',
          review_reason: 'La regla está activa pero no contiene un identificador ECU utilizable. Requiere revisión humana antes de usarla como fuente de detección o aprendizaje.',
          review_priority: 'high',
          rule_id: rule.id,
          fabricante: rule.fabricante,
          ecu: rule.ecu,
          familia: rule.familia,
          stored_ecu: rule.ecu,
          context: commonContext(rule),
          requires_human_decision: true,
          auto_fix: false,
        })
      }

      const normalizedFamily = typeof rule.familia === 'string' ? normalizeBrandText(rule.familia) : ''
      if (!normalizedFamily) {
        integrityReviews.push({
          review_type: 'missing_family',
          review_reason: 'La regla está activa pero no contiene una familia ECU utilizable. Requiere revisión humana antes de usarla como fuente fiable de clasificación o aprendizaje.',
          review_priority: 'medium',
          rule_id: rule.id,
          fabricante: rule.fabricante,
          ecu: rule.ecu,
          familia: rule.familia,
          stored_family: rule.familia,
          context: commonContext(rule),
          requires_human_decision: true,
          auto_fix: false,
        })
      }

      if (rule.marcas != null && !Array.isArray(rule.marcas)) return [...integrityReviews, { review_type: 'invalid_brand_container', review_reason: 'El campo marcas no está almacenado como una lista. Requiere revisión humana antes de cualquier normalización o corrección.', review_priority: 'high', rule_id: rule.id, fabricante: rule.fabricante, ecu: rule.ecu, familia: rule.familia, stored_brand_container: rule.marcas, stored_brand_container_type: typeof rule.marcas, context: commonContext(rule), requires_human_decision: true, auto_fix: false }]

      const brandEntries = Array.isArray(rule.marcas) ? rule.marcas : []
      const coverageReviews: ReviewItem[] = brandEntries.length === 0 ? [{ review_type: 'missing_brand_coverage', review_reason: 'La regla ECU está activa pero no tiene ninguna marca asociada. Requiere revisión humana para confirmar si la ausencia de cobertura de marca es intencionada.', review_priority: 'medium', rule_id: rule.id, fabricante: rule.fabricante, ecu: rule.ecu, familia: rule.familia, stored_brand_container: rule.marcas == null ? null : brandEntries, context: commonContext(rule), requires_human_decision: true, auto_fix: false }] : []

      const entryReviews = brandEntries.flatMap<ReviewItem>((brandEntry: unknown) => {
        if (typeof brandEntry !== 'string') return [{ review_type: 'invalid_brand_entry', review_reason: 'Una entrada individual del campo marcas no es texto. Requiere revisión humana antes de interpretarla, normalizarla o descartarla.', review_priority: 'high', rule_id: rule.id, fabricante: rule.fabricante, ecu: rule.ecu, familia: rule.familia, stored_brand_entry: brandEntry, stored_brand_entry_type: brandEntry === null ? 'null' : typeof brandEntry, context: commonContext(rule), requires_human_decision: true, auto_fix: false }]
        const normalizedBrandEntry = normalizeBrandText(brandEntry)
        if (!normalizedBrandEntry) return [{ review_type: 'empty_brand_entry', review_reason: 'Una entrada del campo marcas está vacía o solo contiene separadores/espacios. Requiere revisión humana antes de conservarla o eliminarla.', review_priority: 'medium', rule_id: rule.id, fabricante: rule.fabricante, ecu: rule.ecu, familia: rule.familia, stored_brand_entry: brandEntry, context: commonContext(rule), requires_human_decision: true, auto_fix: false }]
        const tokens = detectedBrandTokens(brandEntry)
        if (tokens.length === 0) return [{ review_type: 'unknown_brand_entry', review_reason: 'La entrada de marca no coincide con ninguna marca canónica conocida. Requiere revisión humana antes de permitir que esta regla alimente el aprendizaje.', review_priority: 'medium', rule_id: rule.id, fabricante: rule.fabricante, ecu: rule.ecu, familia: rule.familia, stored_brand_entry: brandEntry, normalized_brand_entry: normalizedBrandEntry, context: commonContext(rule), requires_human_decision: true, auto_fix: false }]
        if (tokens.length < 2) return []
        return [{ review_type: 'compound_brand_entry', review_reason: 'La misma entrada contiene dos o más marcas canónicas distintas y requiere decisión humana antes de corregirla o dividirla.', review_priority: tokens.length >= 3 ? 'high' : 'medium', rule_id: rule.id, fabricante: rule.fabricante, ecu: rule.ecu, familia: rule.familia, stored_brand_entry: brandEntry, normalized_brand_entry: normalizedBrandEntry, detected_brand_tokens: tokens, detected_brand_count: tokens.length, context: commonContext(rule), requires_human_decision: true, auto_fix: false }]
      })

      const canonicalEntries = new Map<string, string[]>()
      for (const brandEntry of brandEntries) {
        if (typeof brandEntry !== 'string' || !normalizeBrandText(brandEntry)) continue
        const tokens = detectedBrandTokens(brandEntry)
        if (tokens.length !== 1) continue
        const canonical = tokens[0]
        canonicalEntries.set(canonical, [...(canonicalEntries.get(canonical) || []), brandEntry])
      }

      const duplicateReviews: ReviewItem[] = []
      Array.from(canonicalEntries.entries()).forEach(([canonicalBrand, storedEntries]) => {
        if (storedEntries.length < 2) return
        duplicateReviews.push({ review_type: 'duplicate_canonical_brand', review_reason: 'Dos o más entradas de marcas representan la misma marca canónica. Requiere revisión humana antes de consolidar alias o eliminar duplicados.', review_priority: 'low', rule_id: rule.id, fabricante: rule.fabricante, ecu: rule.ecu, familia: rule.familia, canonical_brand: canonicalBrand, stored_brand_entries: storedEntries, duplicate_count: storedEntries.length, context: commonContext(rule), requires_human_decision: true, auto_fix: false })
      })
      return [...integrityReviews, ...coverageReviews, ...entryReviews, ...duplicateReviews]
    }).sort((a, b) => {
      const priorityRank: Record<string, number> = { high: 0, medium: 1, low: 2 }
      const priorityCompare = (priorityRank[a.review_priority] ?? 9) - (priorityRank[b.review_priority] ?? 9)
      if (priorityCompare !== 0) return priorityCompare
      const ecuCompare = String(a.ecu || '').localeCompare(String(b.ecu || ''))
      if (ecuCompare !== 0) return ecuCompare
      const ruleCompare = String(a.rule_id || '').localeCompare(String(b.rule_id || ''))
      if (ruleCompare !== 0) return ruleCompare
      const aNormalized = a.review_type === 'compound_brand_entry' || a.review_type === 'unknown_brand_entry' ? a.normalized_brand_entry : ''
      const bNormalized = b.review_type === 'compound_brand_entry' || b.review_type === 'unknown_brand_entry' ? b.normalized_brand_entry : ''
      return aNormalized.localeCompare(bNormalized)
    })

    const summary = queue.reduce((acc: Record<string, number>, item) => { acc[item.review_type] = (acc[item.review_type] || 0) + 1; return acc }, {})
    const prioritySummary = queue.reduce((acc: Record<'high' | 'medium' | 'low', number>, item) => { acc[item.review_priority] += 1; return acc }, { high: 0, medium: 0, low: 0 })
    const affectedRuleIds = new Set(queue.map((item) => String(item.rule_id ?? ''))); affectedRuleIds.delete('')
    const rulesScanned = (rules || []).length
    const rulesBlockedFromLearning = affectedRuleIds.size
    const rulesClearForLearning = Math.max(0, rulesScanned - rulesBlockedFromLearning)

    return NextResponse.json({
      ok: true,
      read_only: true,
      source_scope: 'active_ecu_detection_rules',
      generated_at: new Date().toISOString(),
      rules_scanned: rulesScanned,
      rules_with_review_items: rulesBlockedFromLearning,
      total: queue.length,
      summary,
      priority_summary: prioritySummary,
      learning_gate: {
        rules_clear_for_learning: rulesClearForLearning,
        rules_blocked_from_learning: rulesBlockedFromLearning,
        requires_zero_review_items: true,
        auto_promote: false,
      },
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