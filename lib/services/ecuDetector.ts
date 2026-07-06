export type EcuDetection = {
  identified: boolean
  confidence: number
  vehicle: string
  brand: string
  model: string
  engine: string
  ecu: string
  family: string
  power: string
  year: string
  hw: string
  sw: string
  checksum: string
  tools: string[]
  compatibleServiceIds: string[]
  notes: string[]
}

type Rule = {
  id: string
  ecu: string
  family: string
  brands?: string[]
  vehicle?: string
  engine?: string
  power?: string
  year?: string
  tools: string[]
  services: string[]
  patterns: RegExp[]
  sizeHints?: number[]
}

const DEFAULT_TOOLS = ['Magic FLEX', 'KESS3', 'Autotuner', 'PCMFlash']
const DEFAULT_SERVICES = ['stage1', 'stage2', 'dpf', 'egr', 'adblue', 'immo', 'hardcut']

const RULES: Rule[] = [
  {
    id: 'edc17c64_vag',
    ecu: 'Bosch EDC17C64',
    family: 'EDC17C64',
    brands: ['Audi', 'Volkswagen', 'SEAT', 'Skoda'],
    vehicle: 'VAG 2.0 TDI',
    engine: '2.0 TDI',
    power: '110-190 CV',
    year: '2012-2018',
    tools: ['Magic FLEX', 'KESS3', 'Autotuner', 'CMDFlash', 'PCMFlash'],
    services: ['stage1', 'stage2', 'dpf', 'egr', 'adblue', 'hardcut'],
    patterns: [/edc17c64/i, /1037\d{6,}/i, /04l\s*906/i, /audi|vw|volkswagen|seat|skoda/i],
    sizeHints: [2097152, 4194304],
  },
  {
    id: 'edc17c50_bmw',
    ecu: 'Bosch EDC17C50',
    family: 'EDC17C50',
    brands: ['BMW', 'Mini'],
    vehicle: 'BMW/MINI Diesel',
    engine: 'N47 / B47',
    power: '116-218 CV',
    year: '2010-2018',
    tools: ['Magic FLEX', 'KESS3', 'Autotuner', 'CMDFlash'],
    services: ['stage1', 'stage2', 'dpf', 'egr', 'adblue', 'hardcut'],
    patterns: [/edc17c50/i, /bmw|mini/i, /n47|b47/i, /0281\d{6,}/i],
    sizeHints: [2097152, 4194304],
  },
  {
    id: 'md1cs003_psa_opel',
    ecu: 'Bosch MD1CS003',
    family: 'MD1CS003',
    brands: ['Opel', 'Peugeot', 'Citroën', 'Fiat'],
    vehicle: 'PSA / Opel BlueHDi',
    engine: '1.5 / 1.6 BlueHDi',
    power: '75-130 CV',
    year: '2017-2024',
    tools: ['Magic FLEX', 'KESS3', 'Autotuner', 'PCMFlash'],
    services: ['stage1', 'dpf', 'egr', 'adblue'],
    patterns: [/md1cs003/i, /opel|peugeot|citroen|citroën|berlingo|combo|rifter|bluehdi/i],
    sizeHints: [4194304, 8388608],
  },
  {
    id: 'med17_vag',
    ecu: 'Bosch MED17.x',
    family: 'MED17',
    brands: ['Audi', 'Volkswagen', 'SEAT', 'Skoda'],
    vehicle: 'VAG TFSI/TSI',
    engine: 'TSI / TFSI',
    power: '122-400 CV',
    year: '2008-2018',
    tools: ['Magic FLEX', 'KESS3', 'Autotuner', 'CMDFlash', 'PCMFlash'],
    services: ['stage1', 'stage2', 'pops', 'hardcut'],
    patterns: [/med17/i, /med17\.5/i, /tfsi|tsi|gti|s3|ea888/i],
    sizeHints: [2097152, 4194304],
  },
  {
    id: 'edc16u34_vag',
    ecu: 'Bosch EDC16U34',
    family: 'EDC16U34',
    brands: ['Audi', 'Volkswagen', 'SEAT', 'Skoda'],
    vehicle: 'VAG 1.9/2.0 TDI',
    engine: 'TDI PD',
    power: '90-170 CV',
    year: '2003-2010',
    tools: ['KESS3', 'MPPS', 'Magic FLEX', 'CMDFlash'],
    services: ['stage1', 'stage2', 'dpf', 'egr', 'hardcut'],
    patterns: [/edc16u34/i, /038\s*906|03g\s*906/i, /1\.9\s*tdi|2\.0\s*tdi|bmn|bkd|bxe/i],
    sizeHints: [1048576, 2097152],
  },
  {
    id: 'sid807_psa_ford',
    ecu: 'Continental SID807',
    family: 'SID807',
    brands: ['Ford', 'Peugeot', 'Citroën'],
    vehicle: '1.6 TDCi / HDi',
    engine: '1.6 TDCi / HDi',
    power: '90-115 CV',
    year: '2010-2017',
    tools: ['Magic FLEX', 'KESS3', 'Autotuner'],
    services: ['stage1', 'dpf', 'egr', 'adblue'],
    patterns: [/sid807/i, /ford|focus|tdci|hdi|peugeot|citroen/i],
    sizeHints: [2097152, 4194304],
  },
  {
    id: 'me75_vag',
    ecu: 'Bosch ME7.5',
    family: 'ME7.5',
    brands: ['Audi', 'Volkswagen', 'SEAT', 'Skoda'],
    vehicle: 'VAG 1.8T',
    engine: '1.8 Turbo',
    power: '150-225 CV',
    year: '1999-2005',
    tools: ['KESS3', 'MPPS', 'Galletto', 'Bench'],
    services: ['stage1', 'stage2', 'pops', 'hardcut'],
    patterns: [/me7\.5|me75/i, /1\.8t|1\.8\s*turbo|bam|apy|aum|agu/i],
    sizeHints: [524288, 1048576],
  },
]

export async function detectEcuFromFile(file: File): Promise<EcuDetection> {
  const sample = await readFileSample(file)
  const haystack = `${file.name}\nsize:${file.size}\n${sample}`
  const lowerName = file.name.toLowerCase()

  let best: { rule: Rule; score: number } | null = null

  for (const rule of RULES) {
    let score = 0
    for (const pattern of rule.patterns) {
      if (pattern.test(haystack)) score += 25
    }
    if (rule.sizeHints?.some((hint) => Math.abs(file.size - hint) < hint * 0.08)) score += 15
    if (rule.brands?.some((brand) => lowerName.includes(brand.toLowerCase()))) score += 10
    if (!best || score > best.score) best = { rule, score }
  }

  const hw = findHardware(haystack)
  const sw = findSoftware(haystack)
  const brand = detectBrand(haystack, best?.rule)
  const model = detectModel(haystack, best?.rule)

  if (!best || best.score < 25) {
    return {
      identified: false,
      confidence: Math.min(best?.score || 0, 35),
      vehicle: brand ? `${brand} sin identificar` : 'Vehículo no identificado',
      brand: brand || '',
      model: model || '',
      engine: 'No identificado',
      ecu: 'ECU no identificada',
      family: '',
      power: '—',
      year: '—',
      hw: hw || 'No detectado',
      sw: sw || 'No detectado',
      checksum: 'No verificado',
      tools: DEFAULT_TOOLS,
      compatibleServiceIds: DEFAULT_SERVICES,
      notes: [
        'No se ha podido identificar automáticamente con suficiente confianza.',
        'Puedes continuar rellenando los datos manualmente.',
        `Tamaño del archivo: ${formatBytes(file.size)}`,
      ],
    }
  }

  const rule = best.rule
  const finalBrand = brand || rule.brands?.[0] || ''
  const finalModel = model || rule.vehicle || 'Modelo no identificado'

  return {
    identified: true,
    confidence: Math.min(98, best.score),
    vehicle: finalBrand ? `${finalBrand} ${finalModel}` : finalModel,
    brand: finalBrand,
    model: finalModel,
    engine: rule.engine || 'No identificado',
    ecu: rule.ecu,
    family: rule.family,
    power: rule.power || '—',
    year: rule.year || '—',
    hw: hw || findByRegex(haystack, /(1037\d{6,10})/i) || 'No detectado',
    sw: sw || 'No detectado',
    checksum: 'Pendiente de verificación',
    tools: rule.tools,
    compatibleServiceIds: rule.services,
    notes: [
      `Detección basada en ${best.score}% de coincidencias internas/nombre/tamaño.`,
      `Tamaño del archivo: ${formatBytes(file.size)}`,
      'La identificación seguirá mejorando con la base de datos técnica de AK Cloud.',
    ],
  }
}

async function readFileSample(file: File) {
  const size = Math.min(file.size, 512 * 1024)
  const start = file.slice(0, size)
  const end = file.size > size ? file.slice(Math.max(0, file.size - size), file.size) : null
  const buffers = [await start.arrayBuffer()]
  if (end) buffers.push(await end.arrayBuffer())
  return buffers.map((buffer) => bufferToSearchableText(buffer)).join('\n')
}

function bufferToSearchableText(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let out = ''
  for (let i = 0; i < bytes.length; i += 1) {
    const value = bytes[i]
    out += value >= 32 && value <= 126 ? String.fromCharCode(value) : ' '
  }
  return out.replace(/\s+/g, ' ').slice(0, 240000)
}

function findHardware(text: string) {
  return (
    findByRegex(text, /HW[:_\s-]*([A-Z0-9.\/-]{5,24})/i) ||
    findByRegex(text, /Hardware[:_\s-]*([A-Z0-9.\/-]{5,24})/i) ||
    findByRegex(text, /(\b1037\d{6,10}\b)/i) ||
    findByRegex(text, /(\b0281\d{6,10}\b)/i) ||
    findByRegex(text, /(\b03L\s?906\s?[A-Z0-9]{3,6}\b)/i) ||
    findByRegex(text, /(\b04L\s?906\s?[A-Z0-9]{3,6}\b)/i)
  )
}

function findSoftware(text: string) {
  return (
    findByRegex(text, /SW[:_\s-]*([A-Z0-9.\/-]{4,24})/i) ||
    findByRegex(text, /Software[:_\s-]*([A-Z0-9.\/-]{4,24})/i) ||
    findByRegex(text, /SWV[:_\s-]*([A-Z0-9.\/-]{4,24})/i) ||
    findByRegex(text, /(\b\d{4,5}\s?[A-Z]{1,3}\b)/i)
  )
}

function detectBrand(text: string, rule?: Rule) {
  const brands = ['BMW', 'Mercedes', 'Audi', 'Volkswagen', 'VW', 'SEAT', 'Skoda', 'Opel', 'Peugeot', 'Citroen', 'Citroën', 'Renault', 'Ford', 'Fiat', 'Toyota', 'Nissan']
  const found = brands.find((brand) => new RegExp(`\\b${escapeRegExp(brand)}\\b`, 'i').test(text))
  if (found === 'VW') return 'Volkswagen'
  if (found === 'Citroen') return 'Citroën'
  return found || rule?.brands?.[0] || ''
}

function detectModel(text: string, rule?: Rule) {
  const models = ['A3', 'A4', 'A5', 'Golf', 'Leon', 'Octavia', 'Passat', '320d', '520d', 'Focus', 'Combo', 'Berlingo', 'Rifter', 'Partner', 'Clio']
  const found = models.find((model) => new RegExp(`\\b${escapeRegExp(model)}\\b`, 'i').test(text))
  return found || rule?.vehicle || ''
}

function findByRegex(text: string, regex: RegExp) {
  const match = text.match(regex)
  return match?.[1]?.replace(/\s+/g, '') || null
}

function formatBytes(bytes: number) {
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let index = 0
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
