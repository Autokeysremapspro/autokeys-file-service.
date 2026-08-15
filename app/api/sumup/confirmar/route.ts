import { NextResponse } from 'next/server'
import { confirmarSumUpYCrearPedido } from '@/lib/sumup'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/paypal'

export async function POST(request: Request) {
  try {
    const userClient = createServerSupabaseClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json()
    const pendienteId = String(body?.pendienteId || '')
    if (!pendienteId) return NextResponse.json({ error: 'Falta el identificador del pago' }, { status: 400 })

    const admin = getSupabaseAdmin()
    const { data: pendiente, error } = await admin
      .from('ak_pedidos_pendientes_pago')
      .select('user_id,payment_provider')
      .eq('id', pendienteId)
      .single()

    if (error) throw new Error(error.message)
    if (pendiente.user_id !== user.id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    if (pendiente.payment_provider !== 'sumup') return NextResponse.json({ error: 'El pago no pertenece a SumUp' }, { status: 400 })

    const pedido = await confirmarSumUpYCrearPedido(pendienteId)
    return NextResponse.json({ ok: true, pedido })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'No se pudo confirmar el pago de SumUp' }, { status: 500 })
  }
}
