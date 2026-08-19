const DTC_CODE_PATTERN = /\b[PCBU][0-9A-F]{4,5}\b/g

export function extractDtcCodes(text: string): string[] {
  const matches = text.toUpperCase().match(DTC_CODE_PATTERN) || []
  return Array.from(new Set(matches.map((code) => code.trim())))
}
