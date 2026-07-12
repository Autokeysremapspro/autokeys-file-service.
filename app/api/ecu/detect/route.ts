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
    findByRegex(text, /(\b1037\d{6,10}\b)/i) ||
    findByRegex(text, /(\b0281\d{6,10}\b)/i)
  )
}
function findSoftware(text: string) {
  return findByRegex(text, /SW[:_\s-]*([A-Z0-9.\/-]{4,24})/i) || findByRegex(text, /SWV[:_\s-]*([A-Z0-9.\/-]{4,24})/i)
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function scoreAgainstRules(rules: EcuDbRule[], haystack: string, fileSize: number, hw: string | null, sw: string | null) {
  let best: { rule: EcuDbRule; score: number; reasons: string[] } | null = null
  for (const rule of rules) {
    if (rule.activo === false) continue
    let score = 0
    const reasons: string[] = []
    for (const pattern of rule.patrones || []) {
      try {
        if (new RegExp(pattern, 'i').test(haystack)) {
          score += 22
          reasons.push(pattern)
        }
      } catch {
        if (haystack.toLowerCase().includes(pattern.toLowerCase())) score += 14
      }
    }
    for (const brand of rule.marcas || []) {
      if (new RegExp(`\\b${escapeRegExp(brand)}\\b`, 'i').test(haystack)) {
        score += 12
        reasons.push(brand)
      }
    }
    if (rule.tamanos?.some((size) => Math.abs(fileSize - size) <= size * 0.08)) score += 14
    if (!best || score > best.score) best = { rule, score, reasons }
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
    const best = scoreAgainstRules(rules, haystack, file.size, hw, sw)

    if (best && best.score >= 35) {
      const confidence = Math.min(96, 35 + best.score)
      return NextResponse.json({
        identified: true,
        method: 'heuristica',
        confidence,
        sha256,
        ecu: best.rule.ecu,
        marca: best.rule.marcas?.[0] || null,
        modelo: best.rule.modelo || best.rule.vehiculo || null,
        motor: best.rule.motor || null,
        hw,
        sw,
        rule: best.rule,
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
