import { capturePayPalOrder, getPayPalAccessToken, getSiteUrl } from '@/lib/paypal'
import { createSumUpHostedCheckout, getSumUpCheckout, isSumUpCheckoutPaid } from '@/lib/sumup'
import { auditAutomaticSolution, automaticSolutionsAdmin } from './server'
import { AUTOMATIC_SOLUTION_PRICE } from './types'

const PAYPAL_ENV = process.env.PAYPAL_ENV || 'sandbox'
const PAYPAL_BASE_URL = PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'

function verifyAmount(value: unknown, currency: unknown) {
  if (Number(value).toFixed(2) !== AUTOMATIC_SOLUTION_PRICE.toFixed(2) || currency !== 'EUR') {
    throw new Error('El importe confirmado no coincide con la solución')
  }
}

export async function createAutomaticSolutionCheckout(order: any) {
  const admin = automaticSolutionsAdmin()
  const siteUrl = getSiteUrl()
  const description = `AK Cloud · ${String(order.solution_snapshot?.service_name || 'Solución automática')}`.slice(0, 127)

  if (order.payment_provider === 'sumup') {
    const reference = `akauto-${order.id}`
    const checkout = await createSumUpHostedCheckout({
      checkoutReference: reference,
      amount: AUTOMATIC_SOLUTION_PRICE,
      description,
      returnUrl: `${siteUrl}/api/sumup/webhook`,
      redirectUrl: `${siteUrl}/soluciones-automaticas/pago-completado?provider=sumup&order=${order.id}`,
    })
    if (!checkout?.id || !checkout?.hosted_checkout_url) throw new Error('SumUp no devolvió el enlace de pago')
    const { error } = await admin.from('ak_auto_solution_orders').update({ sumup_checkout_id: checkout.id, sumup_checkout_reference: reference, updated_at: new Date().toISOString() }).eq('id', order.id)
    if (error) throw error
    return checkout.hosted_checkout_url as string
  }

  if (process.env.VERCEL_ENV === 'preview' && PAYPAL_ENV === 'live') {
    throw new Error('PayPal Live está bloqueado en el entorno de pruebas')
  }
  const accessToken = await getPayPalAccessToken()
  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      application_context: {
        brand_name: 'AK Cloud',
        landing_page: 'LOGIN',
        user_action: 'PAY_NOW',
        return_url: `${siteUrl}/soluciones-automaticas/pago-completado?provider=paypal&order=${order.id}`,
        cancel_url: `${siteUrl}/soluciones-automaticas?payment=cancelled`,
      },
      purchase_units: [{
        reference_id: order.id,
        custom_id: order.id,
        description,
        amount: { currency_code: 'EUR', value: AUTOMATIC_SOLUTION_PRICE.toFixed(2) },
      }],
    }),
    cache: 'no-store',
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.message || 'No se pudo crear el pago de PayPal')
  const approveUrl = payload.links?.find((link: any) => link.rel === 'approve')?.href
  if (!approveUrl) throw new Error('PayPal no devolvió el enlace de pago')
  const { error } = await admin.from('ak_auto_solution_orders').update({ paypal_order_id: payload.id, updated_at: new Date().toISOString() }).eq('id', order.id)
  if (error) throw error
  return approveUrl as string
}

async function markPaid(order: any, providerReference: string) {
  const admin = automaticSolutionsAdmin()
  const now = new Date().toISOString()
  const { error } = await admin.from('ak_auto_solution_orders').update({ status: 'paid', paid_at: now, updated_at: now }).eq('id', order.id).eq('status', 'awaiting_payment')
  if (error) throw error
  await auditAutomaticSolution({ actorUserId: order.user_id, solutionId: order.solution_id, orderId: order.id, action: 'automatic_payment_confirmed', metadata: { provider: order.payment_provider, providerReference, amount: AUTOMATIC_SOLUTION_PRICE } })
  return { ...order, status: 'paid', paid_at: now }
}

export async function confirmAutomaticSolutionOrder(orderId: string, expectedUserId?: string) {
  const admin = automaticSolutionsAdmin()
  const { data: order, error } = await admin.from('ak_auto_solution_orders').select('*').eq('id', orderId).single()
  if (error || !order) throw error || new Error('Compra no encontrada')
  if (expectedUserId && order.user_id !== expectedUserId) throw new Error('No autorizado')
  if (['paid', 'delivered'].includes(order.status)) return order
  if (order.status !== 'awaiting_payment') throw new Error('Esta compra no está pendiente de pago')

  if (order.payment_provider === 'sumup') {
    if (!order.sumup_checkout_id) throw new Error('Falta el identificador de SumUp')
    const checkout = await getSumUpCheckout(order.sumup_checkout_id)
    if (!isSumUpCheckoutPaid(checkout)) throw new Error(`El pago todavía no está confirmado (${checkout?.status || 'desconocido'})`)
    verifyAmount(checkout.amount, checkout.currency)
    return markPaid(order, order.sumup_checkout_id)
  }

  if (!expectedUserId) throw new Error('PayPal requiere confirmación desde la sesión del comprador')
  if (!order.paypal_order_id) throw new Error('Falta el identificador de PayPal')
  const capture = await capturePayPalOrder(order.paypal_order_id)
  if (capture?.status !== 'COMPLETED') throw new Error(`El pago todavía no está confirmado (${capture?.status || 'desconocido'})`)
  const capturedAmount = capture?.purchase_units?.[0]?.payments?.captures?.[0]?.amount
  verifyAmount(capturedAmount?.value, capturedAmount?.currency_code)
  return markPaid(order, order.paypal_order_id)
}

export async function confirmAutomaticSolutionBySumUpCheckout(checkoutId: string) {
  const admin = automaticSolutionsAdmin()
  const { data } = await admin.from('ak_auto_solution_orders').select('id').eq('sumup_checkout_id', checkoutId).maybeSingle()
  if (!data?.id) return null
  return confirmAutomaticSolutionOrder(data.id)
}

