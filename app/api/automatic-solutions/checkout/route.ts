import { NextResponse } from 'next/server'
import {
  auditAutomaticSolution,
  automaticSolutionsAdmin,
  automaticSolutionErrorStatus,
  requireAutomaticSolutionsUser,
} from '@/lib/automatic-solutions/server'
import { createAutomaticSolutionCheckout } from '@/lib/automatic-solutions/payments'
import { AUTOMATIC_SOLUTION_LEGAL_VERSION, AUTOMATIC_SOLUTION_PRICE, type AutomaticPaymentProvider } from '@/lib/automatic-solutions/types'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const user = await requireAutomaticSolutionsUser()
    const body = await request.json()
    if (body?.legalAccepted !== true) throw new Error('Debes aceptar las condiciones antes de pagar')
    const provider: AutomaticPaymentProvider = body?.paymentProvider === 'paypal' ? 'paypal' : 'sumup'
    const scanId = String(body?.scanId || '')
    const solutionId = String(body?.solutionId || '')
    const admin = automaticSolutionsAdmin()
    const [{ data: scan }, { data: solution }] = await Promise.all([
      admin.from('ak_auto_solution_scans').select('*').eq('id', scanId).eq('user_id', user.id).single(),
      admin.from('ak_auto_solutions').select('*').eq('id', solutionId).eq('status', 'published').single(),
    ])
    if (!scan || !solution) throw new Error('La coincidencia o la solución ya no están disponibles')
    if (scan.status !== 'matched' || scan.ori_sha256 !== solution.ori_sha256 || Number(scan.ori_size) !== Number(solution.ori_size)) {
      throw new Error('La solución no coincide exactamente con el archivo analizado')
    }
    if (Number(solution.price) !== AUTOMATIC_SOLUTION_PRICE) throw new Error('Precio de solución no válido')

    const snapshot = {
      name: solution.name,
      service_code: solution.service_code,
      service_name: solution.service_name,
      ecu: solution.ecu,
      hw: solution.hw,
      sw: solution.sw,
      ori_sha256: solution.ori_sha256,
      ori_size: solution.ori_size,
      mod_bucket: solution.mod_bucket,
      mod_path: solution.mod_path,
      mod_name: solution.mod_name,
      mod_sha256: solution.mod_sha256,
      mod_size: solution.mod_size,
    }
    const { data: order, error } = await admin.from('ak_auto_solution_orders').insert({
      user_id: user.id,
      solution_id: solution.id,
      scan_id: scan.id,
      amount: AUTOMATIC_SOLUTION_PRICE,
      payment_provider: provider,
      legal_version: AUTOMATIC_SOLUTION_LEGAL_VERSION,
      legal_accepted_at: new Date().toISOString(),
      solution_snapshot: snapshot,
    }).select('*').single()
    if (error) throw error

    try {
      const approveUrl = await createAutomaticSolutionCheckout(order)
      await admin.from('ak_auto_solution_scans').update({ status: 'converted_to_order' }).eq('id', scan.id).eq('user_id', user.id)
      await auditAutomaticSolution({ actorUserId: user.id, solutionId: solution.id, orderId: order.id, action: 'automatic_checkout_started', metadata: { provider, amount: AUTOMATIC_SOLUTION_PRICE } })
      return NextResponse.json({ ok: true, orderId: order.id, approveUrl })
    } catch (checkoutError) {
      await admin.from('ak_auto_solution_orders').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', order.id)
      throw checkoutError
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo iniciar el pago' }, { status: automaticSolutionErrorStatus(error) })
  }
}

