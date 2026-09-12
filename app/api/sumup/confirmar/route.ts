import { NextResponse } from 'next/server'
import { confirmarSumUpYCrearPedido } from '@/lib/sumup'
import { getSupabaseAdmin } from '@/lib/paypal'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// POST /api/sumup/confirmar — body: { pendienteId }
// Llamada desde la página de vuelta de SumUp tras el checkout alojado.
export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Sesión requerida para confirmar el pago' }, { status: 401 })

    const body = await request.json()
    const pendienteId = String(body?.pendienteId || '')
    if (!pendienteId) return NextResponse.json({ error: 'Falta el identificador del pago' }, { status: 400 })

    // El pendiente solo puede confirmarlo el usuario dueño de la sesión que
    // lo creó — igual que hace /api/pedidos/capturar con PayPal. La verificación
    // server-to-server del checkout PAID (importe y moneda incluidos) la hace
    // confirmarSumUpYCrearPedido contra la API de SumUp con la clave privada.
    const admin = getSupabaseAdmin()
    const { data: pendiente, error } = await admin
      .from('ak_pedidos_pendientes_pago')
      .select('user_id,payment_provider,sumup_checkout_id')
      .eq('id', pendienteId)
      .single()

    if (error || !pendiente) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }
    if (pendiente.user_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }
    if (pendiente.payment_provider !== 'sumup' || !pendiente.sumup_checkout_id) {
      return NextResponse.json({ error: 'El pago no pertenece a SumUp' }, { status: 400 })
    }

    const pedido = await confirmarSumUpYCrearPedido(pendienteId, user.id)
    return NextResponse.json({ ok: true, pedido })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'No se pudo confirmar el pago de SumUp' }, { status: 500 })
  }
}
