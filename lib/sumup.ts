import { getSiteUrl, getSupabaseAdmin } from '@/lib/paypal'

const SUMUP_BASE_URL = 'https://api.sumup.com'

function getSumUpApiKey() {
  const isPreview = process.env.VERCEL_ENV === 'preview'

  if (isPreview) {
    const sandboxKey = process.env.SUMUP_SANDBOX_API_KEY
    if (!sandboxKey) {
      throw new Error('Falta SUMUP_SANDBOX_API_KEY en el entorno Preview de Vercel')
    }
    return sandboxKey
  }

  const liveKey = process.env.SUMUP_API_KEY
  if (!liveKey) {
    throw new Error('Falta SUMUP_API_KEY en el entorno Production de Vercel')
  }
  return liveKey
}

async function sumupFetch(path: string, init: RequestInit = {}) {
  const response = await fetch(`${SUMUP_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getSumUpApiKey()}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  })

  const text = await response.text()
  let payload: any = null
  try { payload = text ? JSON.parse(text) : null } catch { payload = { raw: text } }

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error_message || payload?.error || `Error SumUp (${response.status})`)
  }

  return payload
}

export async function getSumUpProfile() {
  return sumupFetch('/v0.1/me', { method: 'GET' })
}

export async function getSumUpMerchantCode() {
  const isPreview = process.env.VERCEL_ENV === 'preview'

  if (isPreview) {
    const sandboxMerchantCode = process.env.SUMUP_SANDBOX_MERCHANT_CODE
    if (!sandboxMerchantCode) {
      throw new Error('Falta SUMUP_SANDBOX_MERCHANT_CODE en el entorno Preview de Vercel')
    }
    return sandboxMerchantCode
  }

  const liveMerchantCode = process.env.SUMUP_MERCHANT_CODE
  if (!liveMerchantCode) {
    throw new Error('Falta SUMUP_MERCHANT_CODE en el entorno Production de Vercel')
  }
  return liveMerchantCode
}

export async function createSumUpHostedCheckout(input: {
  checkoutReference: string
  amount: number
  description: string
  returnUrl: string
  redirectUrl: string
}) {
  const merchantCode = await getSumUpMerchantCode()
  return sumupFetch('/v0.1/checkouts', {
    method: 'POST',
    body: JSON.stringify({
      checkout_reference: input.checkoutReference,
      amount: Number(input.amount.toFixed(2)),
      currency: 'EUR',
      merchant_code: merchantCode,
      description: input.description.slice(0, 255),
      return_url: input.returnUrl,
      redirect_url: input.redirectUrl,
      hosted_checkout: { enabled: true },
    }),
  })
}

export async function getSumUpCheckout(checkoutId: string) {
  return sumupFetch(`/v0.1/checkouts/${encodeURIComponent(checkoutId)}`, { method: 'GET' })
}

export function isSumUpCheckoutPaid(checkout: any) {
  return checkout?.status === 'PAID'
}

export async function createSumUpOrderForPedido(input: {
  userId: string
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
      payment_provider: 'sumup',
    })
    .select('*')
    .single()

  if (pendienteError) throw new Error(pendienteError.message)

  const checkoutReference = `akcloud-${pendiente.id}`
  try {
    const checkout = await createSumUpHostedCheckout({
      checkoutReference,
      amount: input.importe,
      description: input.descripcion,
      returnUrl: `${siteUrl}/api/sumup/webhook`,
      redirectUrl: `${siteUrl}/sumup/pedido-completado?pendiente=${pendiente.id}`,
    })

    if (!checkout?.id || !checkout?.hosted_checkout_url) {
      throw new Error('SumUp no devolvió la URL del checkout alojado')
    }

    const { error: updateError } = await supabase
      .from('ak_pedidos_pendientes_pago')
      .update({
        sumup_checkout_id: checkout.id,
        sumup_checkout_reference: checkoutReference,
      })
      .eq('id', pendiente.id)

    if (updateError) throw new Error(updateError.message)

    return {
      approveUrl: checkout.hosted_checkout_url as string,
      pendienteId: pendiente.id as string,
      checkoutId: checkout.id as string,
    }
  } catch (error) {
    await supabase.from('ak_pedidos_pendientes_pago').update({ estado: 'cancelado' }).eq('id', pendiente.id)
    throw error
  }
}

export async function confirmarSumUpYCrearPedido(pendienteId: string) {
  const supabase = getSupabaseAdmin()
  const { data: pendiente, error: fetchError } = await supabase
    .from('ak_pedidos_pendientes_pago')
    .select('*')
    .eq('id', pendienteId)
    .single()

  if (fetchError) throw new Error(fetchError.message)
  if (pendiente.payment_provider !== 'sumup') throw new Error('El pago no pertenece a SumUp')

  if (pendiente.estado === 'pagado') {
    const pedidoId = pendiente.payload?.__pedido_id_creado
    if (!pedidoId) throw new Error('Pago completado sin pedido asociado')
    const { data: pedidoExistente, error } = await supabase.from('file_service_pedidos').select('*').eq('id', pedidoId).single()
    if (error) throw new Error(error.message)
    return pedidoExistente
  }

  if (!pendiente.sumup_checkout_id) throw new Error('Este pago no tiene checkout de SumUp asociado')
  const checkout = await getSumUpCheckout(pendiente.sumup_checkout_id)
  if (!isSumUpCheckoutPaid(checkout)) {
    throw new Error(`El pago todavía no está confirmado por SumUp (estado: ${checkout?.status || 'desconocido'})`)
  }

  if (Number(checkout.amount).toFixed(2) !== Number(pendiente.importe).toFixed(2) || checkout.currency !== 'EUR') {
    throw new Error('El importe confirmado por SumUp no coincide con el pedido')
  }

  const payload = pendiente.payload as Record<string, any>
  const { data: pedido, error: pedidoError } = await supabase.from('file_service_pedidos').insert({
    user_id: pendiente.user_id,
    cliente_nombre: payload.cliente_nombre || null,
    cliente_email: payload.cliente_email || null,
    servicios: payload.servicios_nombres || [],
    observaciones: payload.observaciones || null,
    dtc_codes: Array.isArray(payload.dtc_codes) ? payload.dtc_codes : [],
    marca: payload.marca,
    modelo: payload.modelo,
    motor: payload.motor || null,
    anio: payload.anio || null,
    ecu: payload.ecu || null,
    hw: payload.hw || null,
    sw: payload.sw || null,
    cv: payload.cv || null,
    cambio: payload.cambio || null,
    herramienta_lectura: payload.herramienta_lectura || null,
    metodo_lectura: payload.metodo_lectura || null,
    archivo_origen: payload.archivo_origen || null,
    modificaciones_hardware: payload.modificaciones_hardware || null,
    prioridad: payload.prioridad || 'normal',
    precio: Number(pendiente.importe),
    precio_inicial: Number(payload.precio_inicial ?? pendiente.importe),
    precio_final: Number(payload.precio_final ?? pendiente.importe),
    pagado: true,
    legal_aceptado: payload.legal_aceptado === true,
    legal_version: payload.legal_version || null,
    legal_aceptado_at: payload.legal_aceptado_at || null,
    legal_ip: payload.legal_ip || null,
    estado: 'pendiente',
    ori_nombre: payload.ori?.nombre || null,
    ori_bucket: payload.ori?.bucket,
    ori_path: payload.ori?.path,
    ori_size: payload.ori?.size || null,
    ori_sha256: payload.ori?.sha256 || null,
  }).select('*').single()

  if (pedidoError) throw new Error(pedidoError.message)

  await supabase
    .from('ak_pedidos_pendientes_pago')
    .update({
      estado: 'pagado',
      pagado_at: new Date().toISOString(),
      payload: { ...payload, __pedido_id_creado: pedido.id },
    })
    .eq('id', pendienteId)

  await supabase.from('file_service_notificaciones').insert({
    user_id: pendiente.user_id,
    pedido_id: pedido.id,
    titulo: 'Pago SumUp confirmado — pedido creado',
    mensaje: `Tu pago de ${Number(pendiente.importe).toFixed(2)} € se confirmó y tu pedido ${pedido.numero || ''} ya está en cola.`,
    tipo: 'success',
  })

  return pedido
}

export async function confirmarSumUpPorCheckoutId(checkoutId: string) {
  const supabase = getSupabaseAdmin()
  const { data: pendiente, error } = await supabase
    .from('ak_pedidos_pendientes_pago')
    .select('id')
    .eq('sumup_checkout_id', checkoutId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!pendiente?.id) return null
  return confirmarSumUpYCrearPedido(pendiente.id)
}
