import { createClient } from '@supabase/supabase-js'
import { FALLBACK_PLANES, type AkCloudPlan } from '@/lib/services/akCloudConfig'
import { sendNotificationEmail } from '@/lib/email'

const PAYPAL_ENV = process.env.PAYPAL_ENV || 'sandbox'
const PAYPAL_BASE_URL = PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'

function getRequiredEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Falta variable de entorno ${name}`)
  return value
}

export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (fromEnv) return fromEnv.startsWith('http') ? fromEnv : `https://${fromEnv}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export function getSupabaseAdmin() {
  const url = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || ''
  if (!key) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY en Vercel para confirmar pagos automáticamente')
  return createClient(url, key, { auth: { persistSession: false } })
}

export function getSupabaseAuthClient() {
  const url = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
  const key = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function getPayPalAccessToken() {
  const clientId = getRequiredEnv('PAYPAL_CLIENT_ID')
  const clientSecret = getRequiredEnv('PAYPAL_CLIENT_SECRET')
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })

  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.error_description || payload?.message || 'No se pudo conectar con PayPal')
  return payload.access_token as string
}

export async function getPackByKey(packKey: string): Promise<AkCloudPlan> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('akcloud_planes')
    .select('*')
    .eq('slug', packKey)
    .eq('activo', true)
    .maybeSingle()

  if (!error && data) {
    return {
      ...data,
      precio_mensual: Number(data.precio_mensual || 0),
      creditos_mes: Number(data.creditos_mes || 0),
      ventajas: Array.isArray(data.ventajas) ? data.ventajas : [],
    } as AkCloudPlan
  }

  const fallback = FALLBACK_PLANES.find((item) => item.slug === packKey)
  if (!fallback) throw new Error('Pack de créditos no válido')
  return fallback
}

export async function createPayPalOrder(input: {
  packKey: string
  userId: string
  userEmail?: string | null
}) {
  const pack = await getPackByKey(input.packKey)
  const supabase = getSupabaseAdmin()
  const siteUrl = getSiteUrl()

  const { data: recarga, error: recargaError } = await supabase
    .from('ak_creditos_recargas')
    .insert({
      user_id: input.userId,
      email_cliente: input.userEmail || null,
      creditos: pack.creditos_mes,
      importe: pack.precio_mensual,
      metodo_pago: 'paypal',
      referencia_pago: null,
      notas_cliente: `Compra automática PayPal - ${pack.nombre}`,
      estado: 'pendiente',
    })
    .select('*')
    .single()

  if (recargaError) throw new Error(recargaError.message)

  const accessToken = await getPayPalAccessToken()
  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      application_context: {
        brand_name: 'AK Cloud',
        landing_page: 'LOGIN',
        user_action: 'PAY_NOW',
        return_url: `${siteUrl}/paypal/success`,
        cancel_url: `${siteUrl}/paypal/cancel?recarga=${recarga.id}`,
      },
      purchase_units: [
        {
          reference_id: String(recarga.id),
          custom_id: String(recarga.id),
          description: `AK Cloud - ${pack.nombre} (${pack.creditos_mes} créditos)`,
          amount: {
            currency_code: 'EUR',
            value: Number(pack.precio_mensual).toFixed(2),
          },
        },
      ],
    }),
    cache: 'no-store',
  })

  const order = await response.json()
  if (!response.ok) throw new Error(order?.message || 'No se pudo crear la orden de PayPal')

  const approveUrl = order.links?.find((link: any) => link.rel === 'approve')?.href
  if (!approveUrl) throw new Error('PayPal no devolvió URL de aprobación')

  const { error: pagoError } = await supabase.from('ak_paypal_pagos').insert({
    recarga_id: recarga.id,
    user_id: input.userId,
    paypal_order_id: order.id,
    estado: 'created',
    pack_key: input.packKey,
    creditos: pack.creditos_mes,
    importe: pack.precio_mensual,
    currency: 'EUR',
    raw_order: order,
  })

  if (pagoError) throw new Error(pagoError.message)

  await supabase
    .from('ak_creditos_recargas')
    .update({ referencia_pago: order.id })
    .eq('id', recarga.id)

  return { orderId: order.id as string, approveUrl: approveUrl as string, recargaId: recarga.id as string }
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken()
  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.message || 'No se pudo capturar el pago de PayPal')
  return payload
}

export async function completePayPalPayment(orderId: string, rawPayload: any) {
  const supabase = getSupabaseAdmin()

  const { data: pago, error: pagoError } = await supabase
    .from('ak_paypal_pagos')
    .select('*')
    .eq('paypal_order_id', orderId)
    .maybeSingle()

  if (pagoError) throw new Error(pagoError.message)
  if (!pago) throw new Error('Pago PayPal no encontrado en AK Cloud')
  if (pago.estado === 'paid') return pago

  const capture = rawPayload?.purchase_units?.[0]?.payments?.captures?.[0]
  const captureId = capture?.id || rawPayload?.resource?.id || null
  const status = capture?.status || rawPayload?.status || rawPayload?.resource?.status || 'COMPLETED'

  if (!['COMPLETED', 'APPROVED'].includes(String(status).toUpperCase())) {
    await supabase.from('ak_paypal_pagos').update({ estado: 'failed', raw_capture: rawPayload }).eq('id', pago.id)
    throw new Error(`Pago no completado: ${status}`)
  }

  const { data: nuevoSaldo, error: movError } = await supabase.rpc('ak_anadir_creditos', {
    p_user_id: pago.user_id,
    p_creditos: Number(pago.creditos || 0),
    p_concepto: `Recarga PayPal automática: ${pago.creditos} créditos`,
    p_tipo: 'recarga',
  })

  if (movError) throw new Error(movError.message)

  const paidAt = new Date().toISOString()

  const { error: recargaError } = await supabase
    .from('ak_creditos_recargas')
    .update({
      estado: 'aprobado',
      referencia_pago: captureId || orderId,
      notas_admin: 'Pago confirmado automáticamente por PayPal',
      aprobada_at: paidAt,
    })
    .eq('id', pago.recarga_id)

  if (recargaError) throw new Error(recargaError.message)

  const { data: updated, error: updateError } = await supabase
    .from('ak_paypal_pagos')
    .update({
      estado: 'paid',
      paypal_capture_id: captureId,
      raw_capture: rawPayload,
      paid_at: paidAt,
    })
    .eq('id', pago.id)
    .select('*')
    .single()

  if (updateError) throw new Error(updateError.message)

  await supabase.from('file_service_notificaciones').insert({
    user_id: pago.user_id,
    pedido_id: null,
    titulo: 'Créditos añadidos',
    mensaje: `Tu pago PayPal se confirmó y se añadieron ${pago.creditos} créditos a tu saldo.`,
    tipo: 'success',
    leida: false,
    metadata: { origen: 'paypal', creditos: pago.creditos },
  }).then(() => null)

  if (pago.user_id) {
    const { data: authUser } = await supabase.auth.admin.getUserById(pago.user_id)
    await sendNotificationEmail({
      to: authUser?.user?.email,
      subject: 'Pago confirmado — créditos añadidos',
      title: '¡Pago recibido!',
      bodyHtml: `Tu pago por PayPal se ha confirmado correctamente y se han añadido <b>${pago.creditos} créditos</b> a tu saldo AK Cloud.`,
      ctaHref: process.env.NEXT_PUBLIC_AKCLOUD_URL ? `${process.env.NEXT_PUBLIC_AKCLOUD_URL}/creditos` : undefined,
      ctaLabel: 'Ver mis créditos',
    })
  }

  return updated
}

export async function verifyPayPalWebhook(headers: Headers, body: string) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) return false

  const accessToken = await getPayPalAccessToken()
  const transmissionId = headers.get('paypal-transmission-id')
  const transmissionTime = headers.get('paypal-transmission-time')
  const certUrl = headers.get('paypal-cert-url')
  const authAlgo = headers.get('paypal-auth-algo')
  const transmissionSig = headers.get('paypal-transmission-sig')

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) return false

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    }),
    cache: 'no-store',
  })

  const payload = await response.json()
  return payload?.verification_status === 'SUCCESS'
}
