import { NextResponse } from 'next/server'
import { confirmarSumUpPorCheckoutId, getSumUpCheckout } from '@/lib/sumup'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const checkoutId = String(body?.id || '')
    if (!checkoutId) return new NextResponse(null, { status: 204 })

    const checkout = await getSumUpCheckout(checkoutId)
    if (checkout?.status === 'PAID') {
      await confirmarSumUpPorCheckoutId(checkoutId)
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('SumUp webhook error', error)
    return new NextResponse(null, { status: 204 })
  }
}
