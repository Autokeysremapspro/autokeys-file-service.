import { NextResponse } from 'next/server'
import { confirmarSumUpYCrearPedido } from '@/lib/sumup'
import { getSupabaseAdmin } from '@/lib/paypal'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const pendienteId = String(body?.pendienteId || '')
    if (!pendienteId) return NextResponse.json({ error: 'Falta el identificador del pago' }, { status: 400 })

    // El retorno desde una pasarela externa no debe depender de la cookie de
    // sesión del navegador. La autorización del cierre se basa en el registro
    // pendiente creado antes de salir a SumUp y, sobre todo, en la verificación
    // server-to-server del checkout PAID que realiza confirmarSumUpYCrearPedido.
    const admin = getSupabaseAdmin()
    const { data: pendiente, error } = await admin
      .from('ak_pedidos_pendientes_pago')
      .select('payment_provider,sumup_checkout_id')
      .eq('id', pendienteId)
      .single()

    if (error || !pendiente) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }
    if (pendiente.payment_provider !== 'sumup' || !pendiente.sumup_checkout_id) {
      return NextResponse.json({ error: 'El pago no pertenece a SumUp' }, { status: 400 })
    }

    // Esta función consulta SumUp con la clave privada y solo crea el pedido si
    // el checkout está PAID y el importe/currency coinciden con el pendiente.
    const pedido = await confirmarSumUpYCrearPedido(pendienteId)
    return NextResponse.json({ ok: true, pedido })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'No se pudo confirmar el pago de SumUp' }, { status: 500 })
  }
}
