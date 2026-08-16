import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const runtime = 'nodejs'

const MIN_SIGNATURE_CONFIRMATIONS = 3
const MAX_FILE_BYTES = 64 * 1024 * 1024
const MAX_REQUEST_BYTES = MAX_FILE_BYTES + 1024 * 1024
const SUPPORTED_EXTENSIONS = new Set(['bin', 'ori', 'hex', 'mod'])

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function fileExtension(name: string) {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot + 1).trim().toLowerCase() : ''
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

function fileQuality(buffer: Buffer, extension: string, hw: string | null, sw: string | null) {
  const sampleSize = Math.min(buffer.length, 1024 * 1024)
  const counts = new Uint32Array(256)
  let blankBytes = 0

  for (let i = 0; i < sampleSize; i++) {
    const value = buffer[i]
    counts[value]++
    if (value === 0x00 || value === 0xff) blankBytes++
  }

  let distinctBytes = 0
  let dominantByte = 0
  let dominantCount = 0
  for (let value = 0; value < counts.length; value++) {
    const count = counts[value]
    if (count > 0) distinctBytes++
    if (count > dominantCount) {
      dominantCount = count
      dominantByte = value
    }
  }

  const blankRatio = sampleSize ? blankBytes / sampleSize : 1
  const dominantRatio = sampleSize ? dominantCount / sampleSize : 1
  const suspiciousUniformity = dominantRatio >= 0.985 || distinctBytes <= 2
  const warnings: string[] = []

  if (blankRatio >= 0.985) warnings.push('El archivo contiene una proporción anormalmente alta de bytes 00/FF; revisar que la lectura sea válida.')
  if (suspiciousUniformity && blankRatio < 0.985) warnings.push('La muestra del archivo es prácticamente uniforme; revisar que la lectura no esté vacía, truncada o corrupta.')
  if (!hw) warnings.push('No se ha localizado una referencia HW fiable dentro del archivo.')
  if (!sw) warnings.push('No se ha localizado una referencia SW fiable dentro del archivo.')
  if (extension === 'mod') warnings.push('El archivo tiene extensión .mod; para identificación es preferible analizar el ORI original cuando sea posible.')

  const usable = blankRatio < 0.985 && !suspiciousUniformity
  const identifierScore = hw && sw ? 20 : hw || sw ? 10 : 0
  const structureScore = usable ? 70 : 10
  const extensionScore = extension === 'mod' ? 0 : 10
  const qualityScore = Math.max(0, Math.min(100, structureScore + identifierScore + extensionScore))

  return {
    usable,
    verdict: usable ? 'lectura_utilizable' : 'lectura_dudosa',
    quality_score: qualityScore,
    sampled_bytes: sampleSize,
    blank_ratio: Math.round(blankRatio * 1000) / 10,
    dominant_byte: `0x${dominantByte.toString(16).padStart(2, '0').toUpperCase()}`,
    dominant_ratio: Math.round(dominantRatio * 1000) / 10,
    distinct_byte_values: distinctBytes,
    extracted: { hw, sw },
    completeness: hw && sw ? 'alta' : hw || sw ? 'media' : 'baja',
    warnings,
  }
}

function safeRuleServices(rule: any) {
  return Array.isArray(rule?.servicios) ? rule.servicios.filter((item: unknown) => typeof item === 'string') : []
}

function labPolicy(identificationReviewRequired: boolean) {
  return {
    identification_review_required: identificationReviewRequired,
    lab_decision_required: true,
    ecu_file_modification_automated: false,
    final_decision_owner: 'laboratorio',
  }
}

function clientGuidance(options: {
  identified: boolean
  method: string
  qualityUsable: boolean
  ambiguous?: boolean
}) {
  if (!options.qualityUsable) {
    return {
      level: 'warning',
      label: 'Lectura dudosa',
      safe_to_prefill: false,
      client_action: 'Revisar o repetir la lectura antes de enviar el pedido.',
    }
  }

  if (options.ambiguous) {
    return {
      level: 'warning',
      label: 'Revisión manual obligatoria',
      safe_to_prefill: false,
      client_action: 'Completar los datos técnicos y dejar la identificación final al laboratorio.',
    }
  }

  if (options.identified) {
    return {
      level: 'verified',
      label: options.method === 'huella_exacta_confirmada' ? 'Identificación verificada 100%' : 'Firma verificada',
      safe_to_prefill: true,
      client_action: 'Puedes usar los datos verificados; el laboratorio mantiene la decisión técnica final.',
    }
  }

  return {
    level: 'info',
    label: 'Información insuficiente',
    safe_to_prefill: false,
    client_action: 'Completar ECU, vehículo, HW/SW y método de lectura para revisión del laboratorio.',
  }
}

// Política estricta:
// 1. Un archivo solo se identifica automáticamente mediante una huella SHA-256 ya confirmada.
// 2. Como segunda vía, se acepta una firma verificada únicamente si coinciden EXACTAMENTE HW + SW + tamaño
//    y esa firma ha sido confirmada por el laboratorio al menos 3 veces.
// 3. La inteligencia adicional (calidad, extracción y avisos) jamás asigna una ECU por sí sola.
// 4. Incluso con identificación verificada, la decisión técnica final sigue perteneciendo al laboratorio.
export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0)
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: 'La petición supera el límite permitido para análisis automático' }, { status: 413 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 })
    }
    if (file.size <= 0) {
      return NextResponse.json({ error: 'El archivo está vacío' }, { status: 400 })
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'El archivo supera el límite de 64 MB para análisis automático' }, { status: 413 })
    }

    const extension = fileExtension(file.name)
    if (!SUPPORTED_EXTENSIONS.has(extension)) {
      return NextResponse.json({ error: 'Formato no compatible con el detector. Usa .bin, .ori, .hex o .mod sin comprimir.' }, { status: 415 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex')
    const ascii = bufferToSearchableText(buffer)
    const hw = findHardware(ascii)
    const sw = findSoftware(ascii)
    const quality = fileQuality(buffer, extension, hw, sw)
    const admin = adminClient()

    const { data: fingerprints, error: fingerprintError } = await admin
      .from('ak_ecu_fingerprints')
      .select('*, ak_ecu_detection_rules(*)')
      .eq('sha256', sha256)
      .not('confirmado_por', 'is', null)
    if (fingerprintError) throw fingerprintError

    const fingerprintRows = fingerprints || []
    const distinctFingerprintEcus = new Set(
      fingerprintRows.map((item: any) => String(item.ecu || '').trim()).filter(Boolean)
    )

    if (fingerprintRows.length >= 1 && distinctFingerprintEcus.size === 1) {
      const fingerprint = fingerprintRows[0] as any
      if (fingerprint?.ecu) {
        void admin
          .from('ak_ecu_fingerprints')
          .update({ veces_visto: (fingerprint.veces_visto || 1) + 1, updated_at: new Date().toISOString() })
          .eq('id', fingerprint.id)

        const rule = fingerprint.ak_ecu_detection_rules || null
        return NextResponse.json({
          identified: true,
          status: 'identified',
          method: 'huella_exacta_confirmada',
          confidence: 100,
          review_required: false,
          ...labPolicy(false),
          guidance: clientGuidance({ identified: true, method: 'huella_exacta_confirmada', qualityUsable: quality.usable }),
          sha256,
          file_size: file.size,
          extension,
          vehiculo: fingerprint.vehiculo,
          marca: fingerprint.marca,
          modelo: fingerprint.modelo,
          motor: fingerprint.motor,
          ecu: fingerprint.ecu,
          hw: fingerprint.hw || hw,
          sw: fingerprint.sw || sw,
          rule,
          suggested_services: safeRuleServices(rule),
          quality,
          evidence: ['Huella SHA-256 idéntica a un archivo validado por el laboratorio'],
        })
      }
    }

    if (fingerprintRows.length > 1 && distinctFingerprintEcus.size > 1) {
      return NextResponse.json({
        identified: false,
        status: 'review_required',
        method: 'huella_confirmada_ambigua',
        confidence: 0,
        review_required: true,
        ...labPolicy(true),
        guidance: clientGuidance({ identified: false, method: 'huella_confirmada_ambigua', qualityUsable: quality.usable, ambiguous: true }),
        sha256,
        file_size: file.size,
        extension,
        hw,
        sw,
        quality,
        message: 'La huella existe en la base, pero tiene identificaciones conflictivas. Revisión manual obligatoria.',
        missing_information: missingInformation(hw, sw),
      })
    }

    if (hw && sw) {
      const { data: signature, error: signatureError } = await admin
        .from('ak_ecu_verified_signatures')
        .select('*')
        .eq('hw_normalized', hw)
        .eq('sw_normalized', sw)
        .eq('file_size', file.size)
        .eq('activo', true)
        .not('ultima_confirmacion_por', 'is', null)
        .gte('confirmaciones', MIN_SIGNATURE_CONFIRMATIONS)
        .order('confirmaciones', { ascending: false })
        .limit(5)
      if (signatureError && signatureError.code !== '42P01') throw signatureError

      const signatures = signature || []
      const distinctEcus = new Set(signatures.map((item: any) => String(item.ecu || '').trim()).filter(Boolean))
      if (signatures.length >= 1 && distinctEcus.size === 1) {
        const match = signatures[0] as any
        return NextResponse.json({
          identified: true,
          status: 'identified',
          method: 'firma_verificada',
          confidence: 99,
          review_required: false,
          ...labPolicy(false),
          guidance: clientGuidance({ identified: true, method: 'firma_verificada', qualityUsable: quality.usable }),
          sha256,
          file_size: file.size,
          extension,
          vehiculo: match.vehiculo || null,
          marca: match.marca || null,
          modelo: match.modelo || null,
          motor: match.motor || null,
          ecu: match.ecu,
          hw,
          sw,
          confirmations: match.confirmaciones,
          quality,
          evidence: [
            'HW exacto',
            'SW exacto',
            'Tamaño exacto',
            `${match.confirmaciones} confirmaciones del laboratorio`,
          ],
        })
      }

      if (signatures.length > 1 && distinctEcus.size > 1) {
        return NextResponse.json({
          identified: false,
          status: 'review_required',
          method: 'firma_verificada_ambigua',
          confidence: 0,
          review_required: true,
          ...labPolicy(true),
          guidance: clientGuidance({ identified: false, method: 'firma_verificada_ambigua', qualityUsable: quality.usable, ambiguous: true }),
          sha256,
          file_size: file.size,
          extension,
          hw,
          sw,
          quality,
          message: 'HW, SW y tamaño coinciden con más de una ECU confirmada. Revisión manual obligatoria.',
          missing_information: missingInformation(hw, sw),
        })
      }
    }

    return NextResponse.json({
      identified: false,
      status: quality.usable ? 'unidentified' : 'invalid_reading_suspected',
      method: quality.usable ? 'informacion_insuficiente' : 'calidad_archivo_dudosa',
      confidence: 0,
      review_required: true,
      ...labPolicy(true),
      guidance: clientGuidance({ identified: false, method: quality.usable ? 'informacion_insuficiente' : 'calidad_archivo_dudosa', qualityUsable: quality.usable }),
      sha256,
      file_size: file.size,
      extension,
      hw,
      sw,
      quality,
      message: quality.usable
        ? 'ECU NO IDENTIFICADA — añadir información faltante'
        : 'LECTURA DUDOSA — revisar el archivo antes de continuar',
      missing_information: missingInformation(hw, sw),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error analizando el archivo' }, { status: 500 })
  }
}
