import { createClient } from '@supabase/supabase-js'

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

// =========================================================
// Pago por pedido (sin créditos) — el importe exacto de un pedido
// concreto, no un pack de créditos. El pedido en sí no se crea hasta
// que PayPal confirma el cobro (ver ak_pedidos_pendientes_pago).
// =========================================================

export async function createPayPalOrderForPedido(input: {
  userId: string
  userEmail?: string | null
  importe: number
  descripcion: string
  payload: Record<string, any>
}) {
  const supabase = getSupabaseAdmin()
  const siteUrl = getSiteUrl()

  const { data: pendiente, error: pendienteError } = await supabase
    .from('ak_pedidos_pendientes_pago')
    .insert({
      user_id: input.userId,
      payload: input.payload,
      importe: input.importe,
      estado: 'pendiente',
    })
    .select('*')
    .single()

  if (pendienteError) throw new Error(pendienteError.message)

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
        return_url: `${siteUrl}/paypal/pedido-completado?pendiente=${pendiente.id}`,
        cancel_url: `${siteUrl}/paypal/pedido-cancelado?pendiente=${pendiente.id}`,
      },
      purchase_units: [
        {
          reference_id: String(pendiente.id),
          custom_id: String(pendiente.id),
          description: input.descripcion.slice(0, 127),
          amount: {
            currency_code: 'EUR',
            value: Number(input.importe).toFixed(2),
          },
        },
      ],
    }),
    cache: 'no-store',
  })

  const order = await response.json()
  if (!response.ok) {
    await supabase.from('ak_pedidos_pendientes_pago').update({ estado: 'cancelado' }).eq('id', pendiente.id)
    throw new Error(order?.message || 'No se pudo crear la orden de PayPal')
  }

  const approveUrl = order.links?.find((link: any) => link.rel === 'approve')?.href
  if (!approveUrl) throw new Error('PayPal no devolvió URL de aprobación')

  await supabase.from('ak_pedidos_pendientes_pago').update({ paypal_order_id: order.id }).eq('id', pendiente.id)

  return { approveUrl: approveUrl as string, pendienteId: pendiente.id as string }
}

// Captura el pago y, si va bien, crea el pedido REAL a partir del payload
// guardado. Se usa tanto desde la página de vuelta de PayPal como desde
// el webhook (por si el usuario cierra la pestaña antes de volver).
export async function capturarYCrearPedido(pendienteId: string) {
  const supabase = getSupabaseAdmin()

  const { data: pendiente, error: fetchError } = await supabase
    .from('ak_pedidos_pendientes_pago')
    .select('*')
    .eq('id', pendienteId)
    .single()
  if (fetchError) throw new Error(fetchError.message)

  if (pendiente.estado === 'pagado') {
    // Ya se procesó antes (p. ej. por el webhook) — devolvemos el pedido ya creado.
    const { data: pedidoExistente } = await supabase
      .from('file_service_pedidos')
      .select('*')
      .eq('id', pendiente.payload.__pedido_id_creado)
      .maybeSingle()
    return pedidoExistente
  }

  if (!pendiente.paypal_order_id) throw new Error('Este pago no tiene orden de PayPal asociada')

  const captura = await capturePayPalOrder(pendiente.paypal_order_id)
  const status = captura?.status
  if (status !== 'COMPLETED') {
    throw new Error(`El pago no se completó (estado: ${status || 'desconocido'})`)
  }

  const payload = pendiente.payload as Record<string, any>

  const { data: pedido, error: pedidoError } = await supabase
    .from('file_service_pedidos')
    .insert({
      user_id: pendiente.user_id,
      cliente_nombre: payload.cliente_nombre || null,
      cliente_email: payload.cliente_email || null,
      servicios: payload.servicios_nombres || [],
      observaciones: payload.observaciones || null,
      marca: payload.marca,
      modelo: payload.modelo,
      motor: payload.motor || null,
      anio: payload.anio || null,
      ecu: payload.ecu || null,
      hw: payload.hw || null,
      sw: payload.sw || null,
      cv: payload.cv || null,
      cambio: payload.cambio || null,
      prioridad: payload.prioridad || 'normal',
      precio: pendiente.importe,
      estado: 'pendiente',
      ori_nombre: payload.ori?.nombre || null,
      ori_bucket: payload.ori?.bucket,
      ori_path: payload.ori?.path,
      ori_size: payload.ori?.size || null,
      ori_sha256: payload.ori?.sha256 || null,
    })
    .select('*')
    .single()

  if (pedidoError) throw new Error(pedidoError.message)

  await supabase
    .from('ak_pedidos_pendientes_pago')
    .update({ estado: 'pagado', pagado_at: new Date().toISOString(), payload: { ...payload, __pedido_id_creado: pedido.id } })
    .eq('id', pendienteId)

  await supabase.from('file_service_notificaciones').insert({
    user_id: pendiente.user_id,
    titulo: 'Pago confirmado — pedido creado',
    mensaje: `Tu pago de ${Number(pendiente.importe).toFixed(2)} € se confirmó y tu pedido ${pedido.numero || ''} ya está en cola.`,
    tipo: 'success',
  })

  return pedido
}
