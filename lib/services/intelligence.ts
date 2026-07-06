export type AkDetectedEcu = {
  marca: string
  modelo: string
  motor: string
  anio: string
  ecu: string
  hw: string
  sw: string
  cv: string
  cambio?: string
  familia: string
  checksum: 'OK' | 'Pendiente'
  riesgo: 'Bajo' | 'Medio' | 'Alto'
  herramientas: string[]
  compatibles: string[]
  noDisponibles: string[]
  recomendaciones: string[]
  historial: {
    conocido: boolean
    ultimoTrabajo?: string
    fecha?: string
    servicios?: string[]
  }
}

export type AkAnalysisStep = {
  label: string
  detail: string
}

export const akAnalysisSteps: AkAnalysisStep[] = [
  { label: 'Archivo recibido', detail: 'Validando extensión y tamaño' },
  { label: 'Detectando ECU', detail: 'Buscando patrón de familia' },
  { label: 'Leyendo HW / SW', detail: 'Extrayendo referencias técnicas' },
  { label: 'Comprobando checksum', detail: 'Verificación visual preparada' },
  { label: 'Buscando historial', detail: 'Comparando con trabajos anteriores' },
  { label: 'Servicios compatibles', detail: 'Generando recomendaciones' },
]

const defaultResult: AkDetectedEcu = {
  marca: 'Audi',
  modelo: 'A4 B8',
  motor: '2.0 TDI',
  anio: '2014-2018',
  ecu: 'Bosch EDC17C64',
  hw: '1037XXXXXX',
  sw: 'SW 5521',
  cv: '150 CV',
  cambio: 'Manual / DSG',
  familia: 'Bosch EDC17',
  checksum: 'OK',
  riesgo: 'Bajo',
  herramientas: ['Magic FLEX', 'KESS3', 'Autotuner', 'PCMFlash'],
  compatibles: ['stage1', 'stage2', 'dpf', 'egr', 'adblue', 'hardcut'],
  noDisponibles: ['pops'],
  recomendaciones: ['Stage 1', 'DPF OFF', 'EGR OFF'],
  historial: {
    conocido: false,
  },
}

export function analizarArchivoLocal(fileName?: string | null): AkDetectedEcu {
  const name = (fileName || '').toLowerCase()

  if (name.includes('md1') || name.includes('md1cs003') || name.includes('combo') || name.includes('opel')) {
    return {
      marca: 'Opel / PSA',
      modelo: 'Combo / Berlingo',
      motor: '1.5 BlueHDi',
      anio: '2018+',
      ecu: 'Bosch MD1CS003',
      hw: 'MD1CS003-HW',
      sw: 'SW pendiente',
      cv: '100-130 CV',
      cambio: 'Manual',
      familia: 'Bosch MD1',
      checksum: 'OK',
      riesgo: 'Medio',
      herramientas: ['Magic FLEX', 'KESS3', 'PCMFlash'],
      compatibles: ['stage1', 'dpf', 'egr', 'adblue'],
      noDisponibles: ['pops', 'hardcut'],
      recomendaciones: ['Stage 1', 'AdBlue OFF', 'DPF OFF'],
      historial: {
        conocido: true,
        ultimoTrabajo: 'MD1CS003 no arranca tras campaña',
        fecha: 'Caso interno Autokeys',
        servicios: ['Diagnóstico', 'EEPROM', 'Clonado'],
      },
    }
  }

  if (name.includes('edc17c50') || name.includes('bmw') || name.includes('320d')) {
    return {
      marca: 'BMW',
      modelo: '320d / Serie 1-3',
      motor: '2.0d',
      anio: '2011-2018',
      ecu: 'Bosch EDC17C50',
      hw: '1037 BMW',
      sw: 'SW pendiente',
      cv: '143-190 CV',
      cambio: 'Manual / Auto',
      familia: 'Bosch EDC17',
      checksum: 'OK',
      riesgo: 'Bajo',
      herramientas: ['Magic FLEX', 'KESS3', 'Autotuner'],
      compatibles: ['stage1', 'stage2', 'dpf', 'egr', 'adblue', 'hardcut'],
      noDisponibles: ['pops'],
      recomendaciones: ['Stage 1', 'DPF OFF', 'EGR OFF'],
      historial: {
        conocido: false,
      },
    }
  }

  if (name.includes('med17') || name.includes('gti') || name.includes('tfsi')) {
    return {
      marca: 'Volkswagen / Audi',
      modelo: 'GTI / TFSI',
      motor: '2.0 TFSI',
      anio: '2009-2018',
      ecu: 'Bosch MED17',
      hw: 'MED17-HW',
      sw: 'SW pendiente',
      cv: '200-300 CV',
      cambio: 'Manual / DSG',
      familia: 'Bosch MED17',
      checksum: 'OK',
      riesgo: 'Medio',
      herramientas: ['Magic FLEX', 'KESS3', 'Autotuner', 'CMDFlash'],
      compatibles: ['stage1', 'stage2', 'pops', 'hardcut'],
      noDisponibles: ['dpf', 'adblue'],
      recomendaciones: ['Stage 1', 'Pops & Bangs', 'Hardcut'],
      historial: {
        conocido: false,
      },
    }
  }

  return defaultResult
}

export function calcularPrecioServicios(servicios: { price: number }[]) {
  return servicios.reduce((sum, item) => sum + item.price, 0)
}
