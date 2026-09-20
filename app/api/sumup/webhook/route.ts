import { NextResponse } from 'next/server'
import { confirmarSumUpPorCheckoutId, getSumUpCheckout } from '@/lib/sumup'
import { automaticSolutionsEnabled } from '@/lib/automatic-solutions/server'
import { confirmAutomaticSolutionBySumUpCheckout } from '@/lib/automatic-solutions/payments'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const checkoutId = String(body?.id || '')
    if (!checkoutId) return new NextResponse(null, { status: 204 })

    const checkout = await getSumUpCheckout(checkoutId)
    if (checkout?.status === 'PAID') {
      const normalOrder = await confirmarSumUpPorCheckoutId(checkoutId)
      if (!normalOrder && automaticSolutionsEnabled()) {
        await confirmAutomaticSolutionBySumUpCheckout(checkoutId)
      }
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('SumUp webhook error', error)
    return new NextResponse(null, { status: 204 })
  }
}
