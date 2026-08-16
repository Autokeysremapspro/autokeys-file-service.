export type EcuPrefillField = 'marca' | 'modelo' | 'motor' | 'ecu' | 'hw' | 'sw'

export type EcuPrefillValues = Record<EcuPrefillField, string>

export type VerifiedEcuDetection = Partial<Record<EcuPrefillField, string | null>> & {
  identified?: boolean
  guidance?: {
    safe_to_prefill?: boolean
  } | null
  quality?: {
    usable?: boolean
  } | null
}

export type SafePrefillResult = {
  values: EcuPrefillValues
  applied: EcuPrefillField[]
  preserved: EcuPrefillField[]
  allowed: boolean
}

const FIELDS: EcuPrefillField[] = ['marca', 'modelo', 'motor', 'ecu', 'hw', 'sw']

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Single source of truth for whether verified ECU metadata may be used for prefill.
 * Identification heuristics alone are never enough: the detector must explicitly
 * confirm the ECU, explicitly allow prefill and not mark the reading as unusable.
 */
export function canUseVerifiedEcuPrefill(detection: VerifiedEcuDetection | null | undefined) {
  return Boolean(
    detection?.identified === true &&
    detection?.guidance?.safe_to_prefill === true &&
    detection?.quality?.usable !== false,
  )
}

/**
 * Applies verified ECU metadata without ever replacing customer-entered values.
 *
 * Safety gates:
 * - the detector must explicitly mark the result as identified;
 * - guidance.safe_to_prefill must be true;
 * - a reading explicitly marked unusable is rejected;
 * - only empty current fields can receive detected values.
 *
 * This function does not select services and does not make any ECU modification
 * decision. Final technical validation remains with the laboratory.
 */
export function mergeVerifiedEcuPrefill(
  current: EcuPrefillValues,
  detection: VerifiedEcuDetection | null | undefined,
): SafePrefillResult {
  const values: EcuPrefillValues = { ...current }
  const applied: EcuPrefillField[] = []
  const preserved: EcuPrefillField[] = []

  const allowed = canUseVerifiedEcuPrefill(detection)

  if (!allowed || !detection) {
    return { values, applied, preserved, allowed: false }
  }

  for (const field of FIELDS) {
    const existing = clean(current[field])
    const detected = clean(detection[field])

    if (existing) {
      preserved.push(field)
      continue
    }

    if (detected) {
      values[field] = detected
      applied.push(field)
    }
  }

  return { values, applied, preserved, allowed: true }
}
