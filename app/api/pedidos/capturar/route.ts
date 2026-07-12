import { NextResponse } from 'next/server'
import { capturarYCrearPedido } from '@/lib/paypal'

// POST /api/pedidos/capturar — body: { pendienteId }
// Llamada desde la página de vuelta de PayPal tras aprobar el pago.
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const pendienteId = String(body.pendienteId || '')
    if (!pendienteId) return NextResponse.json({ error: 'Falta el identificador del pago' }, { status: 400 })

    const pedido = await capturarYCrearPedido(pendienteId)
    return NextResponse.json({ ok: true, pedido })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'No se pudo confirmar el pago' }, { status: 500 })
  }
}
