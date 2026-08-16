const PLACEHOLDERS = new Set([
  '',
  '-',
  '--',
  'N/A',
  'NA',
  'NONE',
  'NULL',
  'UNKNOWN',
  'DESCONOCIDO',
  'NO SE',
  'NO SÉ',
  'REVISAR',
  'PENDIENTE',
])

function cleanBase(value: unknown) {
  if (typeof value !== 'string') return null
  const cleaned = value.trim().replace(/\s+/g, ' ')
  if (!cleaned) return null
  if (PLACEHOLDERS.has(cleaned.toUpperCase())) return null
  return cleaned
}

/**
 * Human-readable knowledge values (brand/model/engine/vehicle).
 * We only trim and collapse whitespace: no guessing and no alias expansion.
 */
export function normalizeKnowledgeLabel(value: unknown) {
  return cleanBase(value)
}

/**
 * Technical identifiers used for exact matching (HW/SW).
 * Keeps only characters commonly present in ECU references and removes spaces,
 * producing a stable uppercase key compatible with detector extraction.
 */
export function normalizeTechnicalIdentifier(value: unknown) {
  const base = cleanBase(value)
  if (!base) return null
  const normalized = base.toUpperCase().replace(/[^A-Z0-9.\/_+\-]/g, '')
  if (normalized.length < 4 || PLACEHOLDERS.has(normalized)) return null
  return normalized
}

export function normalizeHardware(value: unknown) {
  return normalizeTechnicalIdentifier(value)
}

export function normalizeSoftware(value: unknown) {
  return normalizeTechnicalIdentifier(value)
}

/**
 * ECU names are labels, not HW/SW keys. Preserve readable spacing but make
 * casing deterministic so EDC15P+, edc15p+ and EDC15P+ compare consistently.
 */
export function normalizeEcu(value: unknown) {
  const base = cleanBase(value)
  return base ? base.toUpperCase() : null
}

/** Stable comparison key only. Never use this as a display value. */
export function normalizeEcuComparisonKey(value: unknown) {
  const ecu = normalizeEcu(value)
  return ecu ? ecu.replace(/[^A-Z0-9.+]/g, '') : null
}

export type EcuKnowledgeInput = {
  vehiculo?: unknown
  marca?: unknown
  modelo?: unknown
  motor?: unknown
  ecu?: unknown
  hw?: unknown
  sw?: unknown
}

export function normalizeEcuKnowledge<T extends EcuKnowledgeInput>(input: T) {
  return {
    ...input,
    vehiculo: normalizeKnowledgeLabel(input.vehiculo),
    marca: normalizeKnowledgeLabel(input.marca),
    modelo: normalizeKnowledgeLabel(input.modelo),
    motor: normalizeKnowledgeLabel(input.motor),
    ecu: normalizeEcu(input.ecu),
    hw: normalizeHardware(input.hw),
    sw: normalizeSoftware(input.sw),
  }
}

/**
 * Exact verified-signature key. It intentionally does not infer ECU data.
 * Returns null unless HW, SW, ECU and a positive file size are all present.
 */
export function buildVerifiedSignatureKey(input: {
  hw?: unknown
  sw?: unknown
  ecu?: unknown
  fileSize?: unknown
}) {
  const hw = normalizeHardware(input.hw)
  const sw = normalizeSoftware(input.sw)
  const ecu = normalizeEcu(input.ecu)
  const fileSize = Number(input.fileSize)
  if (!hw || !sw || !ecu || !Number.isSafeInteger(fileSize) || fileSize <= 0) return null
  return `${hw}|${sw}|${fileSize}|${ecu}`
}
