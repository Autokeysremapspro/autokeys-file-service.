import { supabase } from '@/lib/supabase'

export type RecargaEstado = 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada'
export type RecargaMetodo = 'paypal' | 'transferencia' | 'tarjeta' | 'manual' | 'otro'

export type RecargaCreditos = {
  id: string
  user_id: string | null
  nombre_cliente: string | null
  email_cliente: string | null
  creditos: number
  importe: number | null
  metodo_pago: RecargaMetodo | string | null
  estado: RecargaEstado | string | null
  referencia_pago: string | null
  notas_cliente: string | null
  notas_admin: string | null
  aprobada_por: string | null
  aprobada_at: string | null
  created_at: string | null
}

export const PACKS_CREDITOS = [
  {
    key: 'starter',
    nombre: 'Starter',
    creditos: 50,
    precio: 50,
    descripcion: 'Ideal para probar el portal o trabajos puntuales.',
    destacado: false,
  },
  {
    key: 'pro',
    nombre: 'Professional',
    creditos: 120,
    precio: 110,
    descripcion: 'El pack más equilibrado para talleres activos.',
    destacado: true,
  },
  {
    key: 'business',
    nombre: 'Business',
    creditos: 300,
    precio: 260,
    descripcion: 'Para distribuidores con volumen semanal.',
    destacado: false,
  },
]

export async function solicitarRecarga(payload: {
  creditos: number
  importe: number
  metodo_pago: RecargaMetodo
  referencia_pago?: string
  notas_cliente?: string
}) {
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  const { data, error } = await supabase
    .from('ak_creditos_recargas')
    .insert({
      user_id: user?.id || null,
      nombre_cliente: user?.user_metadata?.nombre || user?.user_metadata?.name || null,
      email_cliente: user?.email || null,
      creditos: payload.creditos,
      importe: payload.importe,
      metodo_pago: payload.metodo_pago,
      referencia_pago: payload.referencia_pago || null,
      notas_cliente: payload.notas_cliente || null,
      estado: 'pendiente',
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data as RecargaCreditos
}

export async function getMisRecargas() {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id

  let query = supabase
    .from('ak_creditos_recargas')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(80)

  if (userId) query = query.eq('user_id', userId)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data || []) as RecargaCreditos[]
}

export async function getTodasRecargas() {
  const { data, error } = await supabase
    .from('ak_creditos_recargas')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw new Error(error.message)
  return (data || []) as RecargaCreditos[]
}

export async function actualizarRecarga(id: string, payload: Partial<RecargaCreditos>) {
  const { data, error } = await supabase
    .from('ak_creditos_recargas')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data as RecargaCreditos
}

export async function aprobarRecarga(recarga: RecargaCreditos, notas_admin?: string) {
  const { data: userData } = await supabase.auth.getUser()
  const adminId = userData.user?.id || null

  const { data: movimientos } = await supabase
    .from('ak_creditos_movimientos')
    .select('saldo_resultante')
    .eq('user_id', recarga.user_id)
    .order('created_at', { ascending: false })
    .limit(1)

  const saldoAnterior = Number(movimientos?.[0]?.saldo_resultante || 0)
  const nuevoSaldo = saldoAnterior + Number(recarga.creditos || 0)

  const { error: movError } = await supabase.from('ak_creditos_movimientos').insert({
    user_id: recarga.user_id,
    tipo: 'recarga',
    concepto: `Recarga aprobada: ${recarga.creditos} créditos`,
    creditos: Number(recarga.creditos || 0),
    saldo_resultante: nuevoSaldo,
  })

  if (movError) throw new Error(movError.message)

  const { data, error } = await supabase
    .from('ak_creditos_recargas')
    .update({
      estado: 'aprobada',
      notas_admin: notas_admin || recarga.notas_admin || null,
      aprobada_por: adminId,
      aprobada_at: new Date().toISOString(),
    })
    .eq('id', recarga.id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data as RecargaCreditos
}

export async function rechazarRecarga(id: string, notas_admin?: string) {
  const { data, error } = await supabase
    .from('ak_creditos_recargas')
    .update({ estado: 'rechazada', notas_admin: notas_admin || null })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data as RecargaCreditos
}

export function estadoRecargaClass(estado?: string | null) {
  if (estado === 'aprobada') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
  if (estado === 'rechazada') return 'border-red-500/30 bg-red-500/10 text-red-300'
  if (estado === 'cancelada') return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300'
  return 'border-amber-500/30 bg-amber-500/10 text-amber-300'
}

export function formatEuros(value?: number | null) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(value || 0))
}
