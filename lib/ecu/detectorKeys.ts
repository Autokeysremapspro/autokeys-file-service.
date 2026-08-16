import {
  buildVerifiedSignatureKey,
  normalizeEcu,
  normalizeEcuComparisonKey,
  normalizeHardware,
  normalizeSoftware,
} from '@/lib/ecu/normalize'

export type DetectorIdentityLike = {
  ecu?: unknown
  hw?: unknown
  sw?: unknown
  file_size?: unknown
  fileSize?: unknown
}

/**
 * Returns a deterministic ECU comparison key for conflict detection.
 * This is comparison-only and must never be shown as the display ECU name.
 */
export function detectorEcuKey(value: unknown) {
  return normalizeEcuComparisonKey(value)
}

/**
 * Builds the exact HW+SW+size+ECU signature key used by verified knowledge.
 * Returns null when any mandatory component is missing or invalid.
 */
export function detectorSignatureKey(input: DetectorIdentityLike) {
  return buildVerifiedSignatureKey({
    hw: input.hw,
    sw: input.sw,
    ecu: input.ecu,
    fileSize: input.file_size ?? input.fileSize,
  })
}

/**
 * Normalize only values used by strict detector equality checks.
 * No aliases, fuzzy matching or ECU inference are performed here.
 */
export function normalizeDetectorIdentity<T extends DetectorIdentityLike>(input: T) {
  return {
    ...input,
    ecu: normalizeEcu(input.ecu),
    hw: normalizeHardware(input.hw),
    sw: normalizeSoftware(input.sw),
  }
}

/**
 * Collect distinct ECU identities after canonical normalization.
 * Empty/placeholder values are discarded. More than one returned key means
 * the detector must require manual review rather than choosing a winner.
 */
export function distinctDetectorEcuKeys(rows: Array<{ ecu?: unknown }> | null | undefined) {
  const keys = new Set<string>()
  for (const row of rows || []) {
    const key = detectorEcuKey(row?.ecu)
    if (key) keys.add(key)
  }
  return keys
}

export function hasDetectorEcuConflict(rows: Array<{ ecu?: unknown }> | null | undefined) {
  return distinctDetectorEcuKeys(rows).size > 1
}
