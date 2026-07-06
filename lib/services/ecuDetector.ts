import { DEFAULT_SERVICES, DEFAULT_TOOLS, type EcuDbRule, getEcuRules } from './ecuDatabase'

export type EcuDetection = {
  identified: boolean; confidence: number; vehicle: string; brand: string; model: string; engine: string; ecu: string; family: string; power: string; year: string; hw: string; sw: string; checksum: string; tools: string[]; compatibleServiceIds: string[]; notes: string[]; matchedRuleId?: string | null; detectedBy?: string
}

type MatchResult = { rule: EcuDbRule; score: number; reasons: string[] }
const BRANDS = ['BMW','Mini','Mercedes','Audi','Volkswagen','VW','SEAT','Skoda','Opel','Peugeot','Citroen','Citroën','Renault','Ford','Fiat','Toyota','Nissan','Land Rover','Jaguar']
const MODELS = ['A1','A3','A4','A5','A6','Golf','Leon','Octavia','Passat','Polo','Ibiza','320d','520d','X1','X3','Focus','Fiesta','Combo','Berlingo','Rifter','Partner','Clio','Megane','Caddy','Transporter','Sprinter','Vito','Discovery','Range Rover']

export async function detectEcuFromFile(file: File): Promise<EcuDetection> {
  const sample = await readFileSample(file)
  const haystack = `${file.name}\nsize:${file.size}\n${sample}`
  const hw = findHardware(haystack)
  const sw = findSoftware(haystack)
  const rules = await getEcuRules()
  const best = findBestRule(rules, haystack, file.size, hw, sw)
  const brand = detectBrand(haystack, best?.rule)
  const model = detectModel(haystack, best?.rule)

  if (!best || best.score < 35) {
    return {
      identified: false, confidence: Math.min(best?.score || 0, 34), vehicle: brand ? `${brand} sin identificar` : 'Vehículo no identificado', brand: brand || '', model: model || '', engine: 'No identificado', ecu: 'ECU no identificada', family: '', power: '—', year: '—', hw: hw || 'No detectado', sw: sw || 'No detectado', checksum: 'No verificado', tools: DEFAULT_TOOLS, compatibleServiceIds: DEFAULT_SERVICES, detectedBy: 'AK Detection Engine', matchedRuleId: best?.rule.id || null,
      notes: ['No se ha podido identificar automáticamente con suficiente confianza.', 'Puedes continuar rellenando los datos manualmente.', `Tamaño del archivo: ${formatBytes(file.size)}`, best ? `Mejor coincidencia parcial: ${best.rule.ecu} (${best.score} puntos).` : 'Sin coincidencias claras en AK ECU Database.'],
    }
  }

  const rule = best.rule
  const finalBrand = brand || rule.marcas?.[0] || ''
  const finalModel = model || rule.modelo || rule.vehiculo || 'Modelo no identificado'
  const confidence = normalizeScore(best.score)
  return {
    identified: true, confidence, vehicle: finalBrand ? `${finalBrand} ${finalModel}` : finalModel, brand: finalBrand, model: finalModel, engine: rule.motor || 'No identificado', ecu: rule.ecu, family: rule.familia, power: rule.potencia || '—', year: rule.anios || '—', hw: hw || findByRegex(haystack, /(1037\d{6,10})/i) || 'No detectado', sw: sw || 'No detectado', checksum: 'Pendiente de verificación', tools: rule.herramientas?.length ? rule.herramientas : DEFAULT_TOOLS, compatibleServiceIds: rule.servicios?.length ? rule.servicios : DEFAULT_SERVICES, detectedBy: 'AK ECU Database', matchedRuleId: rule.id || null,
    notes: [`Coincidencia: ${best.reasons.join(' · ') || 'regla técnica'}.`, `Confianza calculada: ${confidence}% (${best.score} puntos).`, `Tamaño del archivo: ${formatBytes(file.size)}`, rule.notas || 'La detección mejorará con nuevas reglas añadidas desde AK ECU Database.'].filter(Boolean),
  }
}

function findBestRule(rules: EcuDbRule[], haystack: string, fileSize: number, hw: string | null, sw: string | null): MatchResult | null {
  let best: MatchResult | null = null
  for (const rule of rules) {
    if (rule.activo === false) continue
    const reasons: string[] = []
    let score = 0
    for (const pattern of rule.patrones || []) {
      try { if (new RegExp(pattern, 'i').test(haystack)) { score += 22; reasons.push(`patrón ${pattern}`) } }
      catch { if (haystack.toLowerCase().includes(pattern.toLowerCase())) { score += 14; reasons.push(`texto ${pattern}`) } }
    }
    for (const brand of rule.marcas || []) if (new RegExp(`\\b${escapeRegExp(brand)}\\b`, 'i').test(haystack)) { score += 12; reasons.push(`marca ${brand}`) }
    if (rule.familia && new RegExp(escapeRegExp(rule.familia), 'i').test(haystack)) { score += 25; reasons.push(`familia ${rule.familia}`) }
    if (rule.ecu && new RegExp(escapeRegExp(rule.ecu.replace(/^(Bosch|Delphi|Siemens|Continental|Marelli)\s+/i, '')), 'i').test(haystack)) { score += 18; reasons.push(`ECU ${rule.ecu}`) }
    if (hw && rule.patrones?.some((pattern) => safeIncludes(hw, pattern))) { score += 28; reasons.push(`HW ${hw}`) }
    if (sw && rule.patrones?.some((pattern) => safeIncludes(sw, pattern))) { score += 24; reasons.push(`SW ${sw}`) }
    if (rule.tamanos?.some((size) => Math.abs(fileSize - size) <= size * 0.08)) { score += 14; reasons.push(`tamaño ${formatBytes(fileSize)}`) }
    if (!best || score > best.score) best = { rule, score, reasons }
  }
  return best
}

async function readFileSample(file: File) {
  const size = Math.min(file.size, 512 * 1024)
  const start = file.slice(0, size)
  const end = file.size > size ? file.slice(Math.max(0, file.size - size), file.size) : null
  const buffers = [await start.arrayBuffer()]
  if (end) buffers.push(await end.arrayBuffer())
  return buffers.map((buffer) => bufferToSearchableText(buffer)).join('\n')
}
function bufferToSearchableText(buffer: ArrayBuffer) { const bytes = new Uint8Array(buffer); let out = ''; for (let i=0;i<bytes.length;i+=1) { const v=bytes[i]; out += v>=32 && v<=126 ? String.fromCharCode(v) : ' ' } return out.replace(/\s+/g, ' ').slice(0, 240000) }
function findHardware(text: string) { return findByRegex(text, /HW[:_\s-]*([A-Z0-9.\/-]{5,24})/i) || findByRegex(text, /Hardware[:_\s-]*([A-Z0-9.\/-]{5,24})/i) || findByRegex(text, /(\b1037\d{6,10}\b)/i) || findByRegex(text, /(\b0281\d{6,10}\b)/i) || findByRegex(text, /(\b03L\s?906\s?[A-Z0-9]{3,6}\b)/i) || findByRegex(text, /(\b04L\s?906\s?[A-Z0-9]{3,6}\b)/i) }
function findSoftware(text: string) { return findByRegex(text, /SW[:_\s-]*([A-Z0-9.\/-]{4,24})/i) || findByRegex(text, /Software[:_\s-]*([A-Z0-9.\/-]{4,24})/i) || findByRegex(text, /SWV[:_\s-]*([A-Z0-9.\/-]{4,24})/i) || findByRegex(text, /(\b\d{4,5}\s?[A-Z]{1,3}\b)/i) }
function detectBrand(text: string, rule?: EcuDbRule) { const found = BRANDS.find((brand) => new RegExp(`\\b${escapeRegExp(brand)}\\b`, 'i').test(text)); if (found === 'VW') return 'Volkswagen'; if (found === 'Citroen') return 'Citroën'; return found || rule?.marcas?.[0] || '' }
function detectModel(text: string, rule?: EcuDbRule) { const found = MODELS.find((model) => new RegExp(`\\b${escapeRegExp(model)}\\b`, 'i').test(text)); return found || rule?.modelo || rule?.vehiculo || '' }
function findByRegex(text: string, regex: RegExp) { const match = text.match(regex); return match?.[1]?.replace(/\s+/g, '') || null }
function formatBytes(bytes: number) { const units=['B','KB','MB','GB']; let value=bytes; let index=0; while(value>=1024 && index<units.length-1){value/=1024; index+=1} return `${value.toFixed(index===0?0:1)} ${units[index]}` }
function escapeRegExp(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }
function normalizeScore(score: number) { if (score >= 130) return 98; if (score >= 110) return 94; if (score >= 90) return 88; if (score >= 70) return 78; if (score >= 50) return 66; return Math.max(35, score) }
function safeIncludes(value: string, pattern: string) { return value.toLowerCase().includes(pattern.toLowerCase().replace(/\\d\{6,\}/g, '').replace(/\\s\*/g, '')) }
