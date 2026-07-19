import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const runtime = 'nodejs'

const MIN_SIGNATURE_CONFIRMATIONS = 3

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function bufferToSearchableText(buffer: Buffer) {
  const chars: string[] = []
  const limit = Math.min(buffer.length, 8 * 1024 * 1024)
  for (let i = 0; i < limit; i++) {
    const value = buffer[i]
    chars.push(value >= 32 && value <= 126 ? String.fromCharCode(value) : ' ')
  }
  return chars.join('').replace(/\s+/g, ' ').slice(0, 600000)
}

function cleanIdentifier(value: string | null) {
  if (!value) return null
  const cleaned = value.trim().replace(/[^A-Z0-9.\/_-]/gi, '').toUpperCase()
  return cleaned.length >= 4 ? cleaned : null
}

function findIdentifier(text: string, expressions: RegExp[]) {
  for (const expression of expressions) {
    const match = text.match(expression)
    const value = cleanIdentifier(match?.[1] || null)
    if (value) return value
  }
  return null
}

function findHardware(text: string) {
  return findIdentifier(text, [
    /(?:^|\s)HW(?:ARE)?\s*[:=_-]\s*([A-Z0-9.\/_-]{4,32})/i,
    /(?:^|\s)HARDWARE\s*[:=_-]\s*([A-Z0-9.\/_-]{4,32})/i,
  ])
}

function findSoftware(text: string) {
  return findIdentifier(text, [
    /(?:^|\s)SW(?:V|ARE)?\s*[:=_-]\s*([A-Z0-9.\/_-]{4,32})/i,
    /(?:^|\s)SOFTWARE\s*[:=_-]\s*([A-Z0-9.\/_-]{4,32})/i,
  ])
}

function missingInformation(hw: string | null, sw: string | null) {
  const missing = ['Foto de la etiqueta de la ECU', 'Marca y modelo del vehículo', 'Motor y año', 'Herramienta y método de lectura']
  if (!hw) missing.unshift('Referencia HW')
  if (!sw) missing.unshift('Referencia SW')
  return missing
}

// Política estricta:
// 1. Un archivo solo se identifica automáticamente mediante una huella SHA-256 ya confirmada.
// 2. Como segunda vía, se acepta una firma verificada únicamente si coinciden EXACTAMENTE HW + SW + tamaño
//    y esa firma ha sido confirmada por el laboratorio al menos 3 veces.
// 3. Los patrones heurísticos jamás asignan una ECU al cliente. Si faltan pruebas, el resultado es
//    "NO IDENTIFICADA — añadir información faltante".
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 })
    }
    if (file.size <= 0) {
      return NextResponse.json({ error: 'El archivo está vacío' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex')
    const admin = adminClient()

    const { data: fingerprint, error: fingerprintError } = await admin
      .from('ak_ecu_fingerprints')
      .select('*, ak_ecu_detection_rules(*)')
      .eq('sha256', sha256)
      .maybeSingle()
    if (fingerprintError) throw fingerprintError

    if (fingerprint?.ecu) {
      void admin
        .from('ak_ecu_fingerprints')
        .update({ veces_visto: (fingerprint.veces_visto || 1) + 1, updated_at: new Date().toISOString() })
        .eq('id', fingerprint.id)

      return NextResponse.json({
        identified: true,
        status: 'identified',
        method: 'huella_exacta_confirmada',
        confidence: 100,
        sha256,
        file_size: file.size,
        vehiculo: fingerprint.vehiculo,
        marca: fingerprint.marca,
        modelo: fingerprint.modelo,
        motor: fingerprint.motor,
        ecu: fingerprint.ecu,
        hw: fingerprint.hw,
        sw: fingerprint.sw,
        rule: fingerprint.ak_ecu_detection_rules || null,
        evidence: ['Huella SHA-256 idéntica a un archivo validado por el laboratorio'],
      })
    }

    const ascii = bufferToSearchableText(buffer)
    const hw = findHardware(ascii)
    const sw = findSoftware(ascii)

    // Aprendizaje prudente: una firma solo puede identificar cuando existen ambos identificadores,
    // coinciden exactamente con el archivo y acumula varias confirmaciones humanas.
    if (hw && sw) {
      const { data: signature, error: signatureError } = await admin
        .from('ak_ecu_verified_signatures')
        .select('*')
        .eq('hw_normalized', hw)
        .eq('sw_normalized', sw)
        .eq('file_size', file.size)
        .eq('activo', true)
        .gte('confirmaciones', MIN_SIGNATURE_CONFIRMATIONS)
        .order('confirmaciones', { ascending: false })
        .limit(2)
      if (signatureError && signatureError.code !== '42P01') throw signatureError

      // Si hay más de una ECU distinta para la misma firma, se considera ambigua y NO se identifica.
      const signatures = signature || []
      const distinctEcus = new Set(signatures.map((item: any) => String(item.ecu || '').trim()).filter(Boolean))
      if (signatures.length === 1 && distinctEcus.size === 1) {
        const match = signatures[0] as any
        return NextResponse.json({
          identified: true,
          status: 'identified',
          method: 'firma_verificada',
          confidence: 99,
          sha256,
          file_size: file.size,
          vehiculo: match.vehiculo || null,
          marca: match.marca || null,
          modelo: match.modelo || null,
          motor: match.motor || null,
          ecu: match.ecu,
          hw,
          sw,
          confirmations: match.confirmaciones,
          evidence: [
            'HW exacto',
            'SW exacto',
            'Tamaño exacto',
            `${match.confirmaciones} confirmaciones del laboratorio`,
          ],
        })
      }
    }

    return NextResponse.json({
      identified: false,
      status: 'unidentified',
      method: 'informacion_insuficiente',
      confidence: 0,
      sha256,
      file_size: file.size,
      hw,
      sw,
      message: 'ECU NO IDENTIFICADA — añadir información faltante',
      missing_information: missingInformation(hw, sw),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error analizando el archivo' }, { status: 500 })
  }
}
