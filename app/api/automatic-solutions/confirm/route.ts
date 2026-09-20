import { NextResponse } from 'next/server'
import { automaticSolutionErrorStatus, requireAutomaticSolutionsUser } from '@/lib/automatic-solutions/server'
import { confirmAutomaticSolutionOrder } from '@/lib/automatic-solutions/payments'

export async function POST(request: Request) {
  try {
    const user = await requireAutomaticSolutionsUser()
    const body = await request.json()
    const orderId = String(body?.orderId || '')
    if (!orderId) throw new Error('Falta la compra')
    const order = await confirmAutomaticSolutionOrder(orderId, user.id)
    return NextResponse.json({ ok: true, order: { id: order.id, status: order.status, solution: order.solution_snapshot } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo confirmar el pago' }, { status: automaticSolutionErrorStatus(error) })
  }
}

