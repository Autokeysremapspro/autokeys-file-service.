import { NextResponse } from 'next/server'
import { completePayPalPayment, verifyPayPalWebhook } from '@/lib/paypal'

function extractOrderId(event: any) {
  return (
    event?.resource?.supplementary_data?.related_ids?.order_id ||
    event?.resource?.purchase_units?.[0]?.payments?.captures?.[0]?.supplementary_data?.related_ids?.order_id ||
    event?.resource?.id ||
    null
  )
}

export async function POST(request: Request) {
  const body = await request.text()

  try {
    const valid = await verifyPayPalWebhook(request.headers, body)
    if (!valid) return NextResponse.json({ error: 'Webhook PayPal no válido' }, { status: 400 })

    const event = JSON.parse(body)
    const eventType = event?.event_type

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
      const orderId = extractOrderId(event)
      if (orderId) await completePayPalPayment(orderId, event)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error procesando webhook PayPal' }, { status: 500 })
  }
}
