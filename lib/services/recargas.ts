import { supabase } from '@/lib/supabase'

export type RecargaEstado = 'pendiente' | 'aprobado' | 'rechazado' | 'cancelada'
export type RecargaMetodo = 'paypal' | 'bizum' | 'transferencia' | 'tarjeta' | 'manual' | 'otro' | string

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

export const METODOS_PAGO: {
  key: RecargaMetodo
  label: string
  descripcion: string
  instrucciones: string
  requiereReferencia: boolean
}[] = [
  {
    key: 'paypal',
    label: 'PayPal / Tarjeta',
    descripcion: 'Pago rápido. Pega el ID de transacción o el email usado.',
    instrucciones: 'Realiza el pago por PayPal y pega el ID de transacción en la referencia.',
    requiereReferencia: true,
  },
  {
    key: 'bizum',
    label: 'Bizum',
    descripcion: 'Pago manual mediante Bizum.',
    instrucciones: 'Haz Bizum al número indicado por Autokeys e indica tu email como concepto.',
    requiereReferencia: true,
  },
  {
    key: 'transferencia',
    label: 'Transferencia',
    descripcion: 'Transferencia bancaria. Pega concepto o número de operación.',
    instrucciones: 'Haz la transferencia indicando tu email de AK Cloud como concepto.',
    requiereReferencia: true,
  },
  {
    key: 'tarjeta',
    label: 'Tarjeta / TPV',
    descripcion: 'Pago por enlace de tarjeta, SumUp o myPOS.',
    instrucciones: 'Solicita enlace de pago y pega la referencia cuando lo completes.',
    requiereReferencia: true,
  },
  {
    key: 'otro',
    label: 'Otro',
    descripcion: 'Bizum, efectivo o acuerdo manual con Autokeys.',
    instrucciones: 'Indica en notas cómo has realizado el pago para que podamos validarlo.',
    requiereReferencia: false,
  },
]

export function getMetodoPago(metodo: RecargaMetodo | string | null | undefined) {
  return METODOS_PAGO.find((item) => item.key === metodo) || METODOS_PAGO[0]
}

export async function solicitarRecarga(payload: {
  creditos: number
  importe: number
  metodo_pago: RecargaMetodo
  referencia_pago?: string
  notas_cliente?: string
}) {
  const metodo = getMetodoPago(String(payload.metodo_pago))
  const referencia = payload.referencia_pago?.trim() || ''

  if (metodo.requiereReferencia && referencia.length < 3) {
    throw new Error('Añade una referencia de pago para poder revisar la recarga.')
  }

  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user?.id) {
    throw new Error('Debes iniciar sesión para solicitar una recarga.')
  }

  const { data, error } = await supabase
    .from('ak_creditos_recargas')
    .insert({
      user_id: user.id,
      nombre_cliente: user.user_metadata?.nombre || user.user_metadata?.name || null,
      email_cliente: user.email || null,
      creditos: payload.creditos,
      importe: payload.importe,
      metodo_pago: String(payload.metodo_pago),
      referencia_pago: referencia || null,
      notas_cliente: payload.notas_cliente?.trim() || null,
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

  if (!userId) return []

  const { data, error } = await supabase
    .from('ak_creditos_recargas')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(80)

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
  if ((recarga.estado || 'pendiente') !== 'pendiente') {
    throw new Error('Esta recarga ya fue revisada.')
  }

  if (!recarga.user_id) {
    throw new Error('La recarga no tiene usuario asociado. No se pueden sumar créditos.')
  }

  const { data: userData } = await supabase.auth.getUser()
  const adminId = userData.user?.id || null

  const { data: movimientos, error: saldoError } = await supabase
    .from('ak_creditos_movimientos')
    .select('saldo_resultante')
    .eq('user_id', recarga.user_id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (saldoError) throw new Error(saldoError.message)

  const saldoAnterior = Number(movimientos?.[0]?.saldo_resultante || 0)
  const creditos = Number(recarga.creditos || 0)
  const nuevoSaldo = saldoAnterior + creditos

  const { error: movError } = await supabase.from('ak_creditos_movimientos').insert({
    user_id: recarga.user_id,
    tipo: 'recarga',
    concepto: `Recarga aprobada: ${creditos} créditos`,
    creditos,
    saldo_resultante: nuevoSaldo,
  })

  if (movError) throw new Error(movError.message)

  const { data, error } = await supabase
    .from('ak_creditos_recargas')
    .update({
      estado: 'aprobado',
      notas_admin: notas_admin || recarga.notas_admin || null,
      aprobada_por: adminId,
      aprobada_at: new Date().toISOString(),
    })
    .eq('id', recarga.id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  await crearNotificacionRecarga(recarga.user_id, 'Recarga aprobada', `Se han añadido ${creditos} créditos a tu cuenta.`)

  return data as RecargaCreditos
}

export async function rechazarRecarga(id: string, notas_admin?: string) {
  const { data, error } = await supabase
    .from('ak_creditos_recargas')
    .update({ estado: 'rechazado', notas_admin: notas_admin || null })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  if (data?.user_id) {
    await crearNotificacionRecarga(data.user_id, 'Recarga rechazada', notas_admin || 'La solicitud de recarga fue rechazada.')
  }

  return data as RecargaCreditos
}

async function crearNotificacionRecarga(userId: string | null, titulo: string, mensaje: string) {
  if (!userId) return

  try {
    await supabase.from('ak_notificaciones').insert({
      user_id: userId,
      tipo: 'creditos',
      titulo,
      mensaje,
      leida: false,
    })
  } catch {
    // La tabla de notificaciones puede no existir todavía en instalaciones antiguas.
  }
}

export function estadoRecargaClass(estado?: string | null) {
  if (estado === 'aprobado') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
  if (estado === 'rechazado') return 'border-red-500/30 bg-red-500/10 text-red-300'
  if (estado === 'cancelada') return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300'
  return 'border-amber-500/30 bg-amber-500/10 text-amber-300'
}

export function formatEuros(value?: number | null) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(value || 0))
}
