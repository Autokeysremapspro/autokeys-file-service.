import { supabase } from '@/lib/supabase'

export type EcuDbRule = {
  id?: string
  fabricante?: string | null
  ecu: string
  familia: string
  marcas?: string[] | null
  vehiculo?: string | null
  modelo?: string | null
  motor?: string | null
  potencia?: string | null
  par_nm?: string | null
  potencia_stage1?: string | null
  anios?: string | null
  herramientas?: string[] | null
  servicios?: string[] | null
  patrones?: string[] | null
  tamanos?: number[] | null
  notas?: string | null
  activo?: boolean | null
  created_at?: string | null
}

export const SERVICE_LABELS: Record<string, string> = {
  stage1: 'Stage 1', stage2: 'Stage 2', dpf: 'DPF OFF', egr: 'EGR OFF', adblue: 'AdBlue OFF', immo: 'IMMO OFF', pops: 'Pops & Bangs', hardcut: 'Hardcut',
}
export const DEFAULT_TOOLS = ['Magic FLEX', 'KESS3', 'Autotuner', 'PCMFlash']
export const DEFAULT_SERVICES = ['stage1', 'stage2', 'dpf', 'egr', 'adblue', 'immo', 'hardcut']

export const FALLBACK_ECU_RULES: EcuDbRule[] = [
  { fabricante:'Bosch', ecu:'Bosch EDC17C64', familia:'EDC17C64', marcas:['Audi','Volkswagen','SEAT','Skoda'], vehiculo:'VAG 2.0 TDI', motor:'2.0 TDI', potencia:'110-190 CV', anios:'2012-2018', herramientas:['Magic FLEX','KESS3','Autotuner','CMDFlash','PCMFlash'], servicios:['stage1','stage2','dpf','egr','adblue','hardcut'], patrones:['edc17c64','1037\\d{6,}','04l\\s*906','audi|vw|volkswagen|seat|skoda'], tamanos:[2097152,4194304], activo:true },
  { fabricante:'Bosch', ecu:'Bosch EDC17C50', familia:'EDC17C50', marcas:['BMW','Mini'], vehiculo:'BMW/MINI Diesel', motor:'N47 / B47', potencia:'116-218 CV', anios:'2010-2018', herramientas:['Magic FLEX','KESS3','Autotuner','CMDFlash'], servicios:['stage1','stage2','dpf','egr','adblue','hardcut'], patrones:['edc17c50','bmw|mini','n47|b47','0281\\d{6,}'], tamanos:[2097152,4194304], activo:true },
  { fabricante:'Bosch', ecu:'Bosch MD1CS003', familia:'MD1CS003', marcas:['Opel','Peugeot','Citroën','Fiat'], vehiculo:'PSA / Opel BlueHDi', motor:'1.5 / 1.6 BlueHDi', potencia:'75-130 CV', anios:'2017-2024', herramientas:['Magic FLEX','KESS3','Autotuner','PCMFlash'], servicios:['stage1','dpf','egr','adblue'], patrones:['md1cs003','opel|peugeot|citroen|citroën|berlingo|combo|rifter|bluehdi'], tamanos:[4194304,8388608], activo:true },
  { fabricante:'Bosch', ecu:'Bosch MED17.x', familia:'MED17', marcas:['Audi','Volkswagen','SEAT','Skoda'], vehiculo:'VAG TSI/TFSI', motor:'TSI / TFSI', potencia:'122-400 CV', anios:'2008-2018', herramientas:['Magic FLEX','KESS3','Autotuner','CMDFlash','PCMFlash'], servicios:['stage1','stage2','pops','hardcut'], patrones:['med17','med17\\.5','tfsi|tsi|gti|s3|ea888'], tamanos:[2097152,4194304], activo:true },
  { fabricante:'Bosch', ecu:'Bosch EDC16U34', familia:'EDC16U34', marcas:['Audi','Volkswagen','SEAT','Skoda'], vehiculo:'VAG 1.9/2.0 TDI', motor:'TDI PD', potencia:'90-170 CV', anios:'2003-2010', herramientas:['KESS3','MPPS','Magic FLEX','CMDFlash'], servicios:['stage1','stage2','dpf','egr','hardcut'], patrones:['edc16u34','038\\s*906|03g\\s*906','1\\.9\\s*tdi|2\\.0\\s*tdi|bmn|bkd|bxe'], tamanos:[1048576,2097152], activo:true },
  { fabricante:'Continental', ecu:'Continental SID807', familia:'SID807', marcas:['Ford','Peugeot','Citroën'], vehiculo:'1.6 TDCi / HDi', motor:'1.6 TDCi / HDi', potencia:'90-115 CV', anios:'2010-2017', herramientas:['Magic FLEX','KESS3','Autotuner'], servicios:['stage1','dpf','egr','adblue'], patrones:['sid807','ford|focus|tdci|hdi|peugeot|citroen'], tamanos:[2097152,4194304], activo:true },
  { fabricante:'Bosch', ecu:'Bosch ME7.5', familia:'ME7.5', marcas:['Audi','Volkswagen','SEAT','Skoda'], vehiculo:'VAG 1.8T', motor:'1.8 Turbo', potencia:'150-225 CV', anios:'1999-2005', herramientas:['KESS3','MPPS','Galletto','Bench'], servicios:['stage1','stage2','pops','hardcut'], patrones:['me7\\.5|me75','1\\.8t|1\\.8\\s*turbo|bam|apy|aum|agu'], tamanos:[524288,1048576], activo:true },
]

export async function getEcuRules(): Promise<EcuDbRule[]> {
  const { data, error } = await supabase.from('ak_ecu_detection_rules').select('*').eq('activo', true).order('created_at', { ascending: false })
  if (error) { console.warn('AK ECU DB fallback:', error.message); return FALLBACK_ECU_RULES }
  return data && data.length ? (data as EcuDbRule[]) : FALLBACK_ECU_RULES
}
export async function getAllEcuRules(): Promise<EcuDbRule[]> {
  const { data, error } = await supabase.from('ak_ecu_detection_rules').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []) as EcuDbRule[]
}
export async function createEcuRule(payload: EcuDbRule) {
  const { data, error } = await supabase.from('ak_ecu_detection_rules').insert({ ...payload, activo: payload.activo ?? true }).select('*').single()
  if (error) throw new Error(error.message)
  return data as EcuDbRule
}
export async function deleteEcuRule(id: string) {
  const { error } = await supabase.from('ak_ecu_detection_rules').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
export function csvToArray(value: string) { return value.split(',').map((item) => item.trim()).filter(Boolean) }
export function csvToNumberArray(value: string) { return csvToArray(value).map(Number).filter((item) => Number.isFinite(item) && item > 0) }
