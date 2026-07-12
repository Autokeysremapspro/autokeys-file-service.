import { supabase } from '@/lib/supabase'

export type CreditoMovimiento = {
  id: string
  user_id: string | null
  pedido_id: string | null
  tipo: 'recarga' | 'consumo' | 'ajuste' | 'devolucion'
  concepto: string | null
  creditos: number
  saldo_resultante: number | null
  created_at: string | null
}

export type ServicioPrecio = {
  key: string
  label: string
  categoria: string
  creditos: number
  descripcion?: string
}

export const SERVICIOS_PRECIOS: ServicioPrecio[] = [
  { key: 'stage_1', label: 'Stage 1', categoria: 'Reprogramación', creditos: 35, descripcion: 'Optimización de potencia y par' },
  { key: 'stage_2', label: 'Stage 2', categoria: 'Reprogramación', creditos: 50, descripcion: 'Preparación con hardware' },
  { key: 'dpf_off', label: 'DPF OFF', categoria: 'Anticontaminación', creditos: 30, descripcion: 'Anulación filtro partículas' },
  { key: 'egr_off', label: 'EGR OFF', categoria: 'Anticontaminación', creditos: 20, descripcion: 'Anulación válvula EGR' },
  { key: 'adblue_off', label: 'AdBlue OFF', categoria: 'Anticontaminación', creditos: 35, descripcion: 'Anulación sistema SCR' },
  { key: 'nox_off', label: 'NOx OFF', categoria: 'Anticontaminación', creditos: 25, descripcion: 'Anulación NOx' },
  { key: 'pops_bangs', label: 'Pops & Bangs', categoria: 'Opciones', creditos: 25, descripcion: 'Sonido deportivo' },
  { key: 'hardcut', label: 'Hardcut', categoria: 'Opciones', creditos: 20, descripcion: 'Corte deportivo' },
  { key: 'launch_control', label: 'Launch Control', categoria: 'Opciones', creditos: 30, descripcion: 'Salida asistida' },
  { key: 'immo_off', label: 'IMMO OFF', categoria: 'Electrónica', creditos: 35, descripcion: 'Solución inmovilizador' },
  { key: 'clonacion_ecu', label: 'Clonación ECU', categoria: 'Electrónica', creditos: 45, descripcion: 'Clonado de datos ECU' },
]

export async function getCreditoMovimientos() {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id

  let query = supabase
    .from('ak_creditos_movimientos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(80)

  if (userId) query = query.eq('user_id', userId)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data || []) as CreditoMovimiento[]
}

export async function getSaldoCreditos() {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) return 0

  const { data, error } = await supabase
    .from('ak_creditos_saldos')
    .select('saldo')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return Number(data?.saldo || 0)
}

export function calcularCreditosServicios(servicios: string[]) {
  return servicios.reduce((acc, key) => {
    const servicio = SERVICIOS_PRECIOS.find((item) => item.key === key)
    return acc + (servicio?.creditos || 0)
  }, 0)
}
