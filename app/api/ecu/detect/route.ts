import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { FALLBACK_ECU_RULES, type EcuDbRule } from '@/lib/services/ecuDatabase'

export const runtime = 'nodejs'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function bufferToSearchableText(buffer: Buffer) {
  let out = ''
  for (let i = 0; i < buffer.length; i++) {
    const v = buffer[i]
    out += v >= 32 && v <= 126 ? String.fromCharCode(v) : ' '
  }
  return out.replace(/\s+/g, ' ').slice(0, 300000)
}

function findByRegex(text: string, regex: RegExp) {
  const match = text.match(regex)
  return match?.[1]?.replace(/\s+/g, '') || null
}

function findHardware(text: string) {
  return (
    findByRegex(text, /HW[:_\s-]*([A-Z0-9.\/-]{5,24})/i) ||
    findByRegex(text, /Hardware[:_\s-]*([A-Z0-9.\/-]{5,24})/i)
  )
}
function findSoftware(text: string) {
  return findByRegex(text, /SW[:_\s-]*([A-Z0-9.\/-]{4,24})/i) || findByRegex(text, /SWV[:_\s-]*([A-Z0-9.\/-]{4,24})/i)
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Puntuación deliberadamente conservadora. Aprendimos con un caso real que
// patrones "técnicos" genéricos (prefijos de nº de pieza Bosch tipo 1037xxxxx,
// 0281xxxxx) NO son exclusivos de ningún fabricante — son números de
// hardware que Bosch reutiliza entre marcas. Contarlos como evidencia de marca
// producía falsos positivos (un archivo PSA identificado como Audi).
// Ahora: la familia (patrón técnico) y la marca (nombre de texto) se puntúan
// y exigen POR SEPARADO — nunca se asume una marca que no se ha visto de
// verdad en el archivo.
function scoreAgainstRules(rules: EcuDbRule[], haystack: string, fileSize: number) {
  let best: { rule: EcuDbRule; score: number; reasons: string[]; brandConfirmed: boolean } | null = null
  for (const rule of rules) {
    if (rule.activo === false) continue
    let score = 0
    const reasons: string[] = []
    let brandConfirmed = false

    // Patrón de familia: solo cuenta si es suficientemente específico (no un
    // simple prefijo numérico de 4 dígitos, que aparece por azar en binarios).
    for (const pattern of rule.patrones || []) {
      const isGenericNumeric = !/[a-z]/i.test(pattern.replace(/\\d/g, '').replace(/[{}\\,+*?()|.^$-]/g, ''))
      try {
        if (new RegExp(pattern, 'i').test(haystack)) {
          score += isGenericNumeric ? 6 : 20
          reasons.push(`patrón ${pattern}`)
        }
      } catch {
        if (haystack.toLowerCase().includes(pattern.toLowerCase())) score += 6
      }
    }

    // Marca: solo cuenta si el NOMBRE aparece literalmente como texto en el archivo.
    for (const brand of rule.marcas || []) {
      if (new RegExp(`\\b${escapeRegExp(brand)}\\b`, 'i').test(haystack)) {
        score += 30
        reasons.push(`marca "${brand}" encontrada en el archivo`)
        brandConfirmed = true
      }
    }

    if (rule.tamanos?.some((size) => Math.abs(fileSize - size) <= size * 0.04)) {
      score += 8
      reasons.push('tamaño de archivo compatible')
    }

    if (!best || score > best.score) best = { rule, score, reasons, brandConfirmed }
  }
  return best
}

// POST /api/ecu/detect — multipart/form-data con campo "file"
// Devuelve la identificación AUTORITATIVA (huella exacta > heurística > sin identificar).
// El precio/servicios del pedido deben calcularse a partir de ESTA respuesta,
// nunca de la detección que haga el navegador en local.
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex')

    const admin = adminClient()

    // 1) Huella exacta
    const { data: fingerprint } = await admin
      .from('ak_ecu_fingerprints')
      .select('*, ak_ecu_detection_rules(*)')
      .eq('sha256', sha256)
      .maybeSingle()

    if (fingerprint) {
      // Actualiza contador de "veces visto" sin bloquear la respuesta
      admin
        .from('ak_ecu_fingerprints')
        .update({ veces_visto: (fingerprint.veces_visto || 1) + 1, updated_at: new Date().toISOString() })
        .eq('id', fingerprint.id)
        .then(() => {})

      return NextResponse.json({
        identified: true,
        method: 'huella_exacta',
        confidence: 99,
        sha256,
        vehiculo: fingerprint.vehiculo,
        marca: fingerprint.marca,
        modelo: fingerprint.modelo,
        motor: fingerprint.motor,
        ecu: fingerprint.ecu,
        hw: fingerprint.hw,
        sw: fingerprint.sw,
        rule: fingerprint.ak_ecu_detection_rules || null,
      })
    }

    // 2) Heurística de patrones contra la base de reglas
    const { data: rulesData } = await admin
      .from('ak_ecu_detection_rules')
      .select('*')
      .eq('activo', true)
    const rules = rulesData && rulesData.length ? (rulesData as EcuDbRule[]) : FALLBACK_ECU_RULES

    const ascii = bufferToSearchableText(buffer)
    const haystack = `${file.name}\n${ascii}`
    const hw = findHardware(ascii)
    const sw = findSoftware(ascii)
    const best = scoreAgainstRules(rules, haystack, file.size)

    // Umbral alto y exigente a propósito: preferimos decir "no estoy seguro"
    // antes que dar una marca/modelo incorrectos. Solo se declara identificado
    // si además la marca se ha visto de verdad como texto en el archivo — la
    // pura coincidencia de un patrón técnico genérico nunca es suficiente sola.
    if (best && best.score >= 50 && best.brandConfirmed) {
      const confidence = Math.min(90, 40 + best.score)
      return NextResponse.json({
        identified: true,
        method: 'heuristica',
        confidence,
        sha256,
        ecu: best.rule.ecu,
        marca: best.rule.marcas?.find((brand) => new RegExp(`\\b${brand}\\b`, 'i').test(haystack)) || null,
        modelo: best.rule.modelo || best.rule.vehiculo || null,
        motor: best.rule.motor || null,
        hw,
        sw,
        rule: best.rule,
        reasons: best.reasons,
      })
    }

    // Coincidencia parcial (familia probable pero SIN marca confirmada por texto):
    // se informa como pista de baja confianza, nunca se autorrellenan marca/modelo.
    if (best && best.score >= 20) {
      return NextResponse.json({
        identified: false,
        method: 'pista_baja_confianza',
        confidence: Math.min(45, best.score),
        sha256,
        posible_ecu: best.rule.ecu,
        hw,
        sw,
        reasons: best.reasons,
      })
    }

    return NextResponse.json({
      identified: false,
      method: 'sin_coincidencia',
      confidence: Math.min(34, best?.score || 0),
      sha256,
      hw,
      sw,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error analizando el archivo' }, { status: 500 })
  }
}
