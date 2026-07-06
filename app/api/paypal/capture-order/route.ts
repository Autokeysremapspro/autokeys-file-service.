import { NextResponse } from 'next/server'
import { capturePayPalOrder, completePayPalPayment } from '@/lib/paypal'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const orderId = String(body?.orderId || '')
    if (!orderId) return NextResponse.json({ error: 'Falta orderId' }, { status: 400 })

    const capture = await capturePayPalOrder(orderId)
    const payment = await completePayPalPayment(orderId, capture)

    return NextResponse.json({ ok: true, payment })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'No se pudo confirmar el pago' }, { status: 500 })
  }
}
