import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createPayPalOrderForPedido } from '@/lib/paypal'
import { createSumUpOrderForPedido } from '@/lib/sumup'
import { FALLBACK_SERVICIOS, type AkCloudServicio } from '@/lib/services/akCloudConfig'
import { extractDtcCodes } from '@/lib/dtc'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function normalizarDtcs(value: unknown, observaciones: unknown) {
  const explicit = Array.isArray(value) ? value.join(',') : String(value || '')
  return extractDtcCodes(`${explicit},${String(observaciones || '')}`)
}

function normalizarMetodoLectura(value: unknown) {
  const normalized = String(value || '').trim().toUpperCase()
  return ['OBD', 'BENCH', 'BOOT', 'BDM', 'JTAG', 'OTRO'].includes(normalized) ? normalized : null
}

function normalizarArchivoOrigen(value: unknown) {
  const normalized = String(value || '').trim().toUpperCase()
  return ['ORI', 'MODIFICADO', 'DESCONOCIDO'].includes(normalized) ? normalized : null
}

export async function POST(request: Request) {
  try {
    const userClient = createServerSupabaseClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const admin = adminClient()
    const [{ data: distribuidor }, { data: staff }] = await Promise.all([
      admin
        .from('akcloud_distribuidores')
        .select('estado')
        .eq('auth_user_id', user.id)
        .maybeSingle(),
      admin
        .from('usuarios_app')
        .select('activo, rol')
        .eq('auth_user_id', user.id)
        .maybeSingle(),
    ])

    const distribuidorActivo = distribuidor?.estado === 'activo'
    const staffActivo = staff?.activo === true && ['admin', 'desarrollo', 'laboratorio', 'atencion_cliente'].includes(String(staff?.rol || ''))

    if (!distribuidorActivo && !staffActivo) {
      return NextResponse.json({ error: 'Cuenta no autorizada para crear pedidos' }, { status: 403 })
    }

    const body = await request.json()
    if (body.legalAccepted !== true) {
      return NextResponse.json({ error: 'Debes aceptar las condiciones del servicio' }, { status: 400 })
    }

    const paymentMethod = body.paymentMethod === 'sumup' ? 'sumup' : 'paypal'
    const legalVersion = String(body.legalVersion || 'AKCLOUD-LEGAL-2026-07-17')
    const forwardedFor = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
    const serviciosSlugs: string[] = Array.isArray(body.servicios) ? body.servicios : []

    if (serviciosSlugs.length === 0) {
      return NextResponse.json({ error: 'Selecciona al menos un servicio' }, { status: 400 })
    }

    const oriBucket = String(body.ori?.bucket || '')
    const oriPath = String(body.ori?.path || '')
    const expectedPrefix = `ori/${user.id}/`
    if (oriBucket !== 'file-service' || !oriPath.startsWith(expectedPrefix)) {
      return NextResponse.json({ error: 'El archivo ORI no pertenece a esta cuenta' }, { status: 400 })
    }

    if (!String(body.marca || '').trim() || !String(body.modelo || '').trim()) {
      return NextResponse.json({ error: 'Añade marca y modelo del vehículo' }, { status: 400 })
    }

    const { data: serviciosData } = await admin.from('akcloud_servicios').select('*').eq('activo', true)
    const servicios = (serviciosData && serviciosData.length ? serviciosData : FALLBACK_SERVICIOS) as AkCloudServicio[]
    const seleccionados = servicios.filter((s) => serviciosSlugs.includes(s.slug))

    if (seleccionados.length !== serviciosSlugs.length) {
      return NextResponse.json({ error: 'Alguno de los servicios seleccionados no existe o no está activo' }, { status: 400 })
    }

    const solicitaDtcOff = seleccionados.some((s) => /dtc/i.test(`${s.slug} ${s.nombre}`))
    const dtcCodes = normalizarDtcs(body.dtcCodes, body.observaciones)
    if (solicitaDtcOff && dtcCodes.length === 0) {
      return NextResponse.json({ error: 'Para DTC OFF indica los códigos DTC separados por comas, por ejemplo P0401, P2002.' }, { status: 400 })
    }

    const herramientaLectura = String(body.herramientaLectura || '').trim() || null
    const metodoLectura = normalizarMetodoLectura(body.metodoLectura)
    const archivoOrigen = normalizarArchivoOrigen(body.archivoOrigen)
    const modificacionesHardware = String(body.modificacionesHardware || '').trim() || null

    const conPrecioReal = seleccionados.map((s) => ({ ...s, precio_final: Number(s.precio ?? 0) }))
    const totalPrecio = Number(conPrecioReal.reduce((sum, s) => sum + Number(s.precio_final ?? 0), 0).toFixed(2))

    const commonPayload = {
      user_id: user.id,
      cliente_nombre: user.user_metadata?.name || user.email || null,
      cliente_email: user.email || null,
      servicios: seleccionados.map((s) => s.nombre),
      observaciones: body.observaciones || null,
      dtc_codes: dtcCodes,
      marca: body.marca,
      modelo: body.modelo,
      motor: body.motor || null,
      anio: body.anio || null,
      ecu: body.ecu || null,
      hw: body.hw || null,
      sw: body.sw || null,
      cv: body.cv || null,
      cambio: body.cambio || null,
      herramienta_lectura: herramientaLectura,
      metodo_lectura: metodoLectura,
      archivo_origen: archivoOrigen,
      modificaciones_hardware: modificacionesHardware,
      prioridad: body.prioridad || 'normal',
      legal_aceptado: true,
      legal_version: legalVersion,
      legal_aceptado_at: new Date().toISOString(),
      legal_ip: forwardedFor,
      ori_nombre: body.ori.nombre || null,
      ori_bucket: oriBucket,
      ori_path: oriPath,
      ori_size: body.ori.size || null,
      ori_sha256: body.ori.sha256 || null,
    }

    if (totalPrecio <= 0) {
      const { data: pedido, error: pedidoError } = await admin
        .from('file_service_pedidos')
        .insert({
          ...commonPayload,
          precio: 0,
          precio_inicial: 0,
          precio_final: 0,
          pagado: true,
          estado: 'pendiente',
        })
        .select('*')
        .single()

      if (pedidoError) throw pedidoError
      return NextResponse.json({ ok: true, requierePago: false, pedido })
    }

    const paymentPayload = {
      cliente_nombre: commonPayload.cliente_nombre,
      cliente_email: commonPayload.cliente_email,
      servicios_nombres: commonPayload.servicios,
      observaciones: commonPayload.observaciones,
      dtc_codes: commonPayload.dtc_codes,
      marca: commonPayload.marca,
      modelo: commonPayload.modelo,
      motor: commonPayload.motor,
      anio: commonPayload.anio,
      ecu: commonPayload.ecu,
      hw: commonPayload.hw,
      sw: commonPayload.sw,
      cv: commonPayload.cv,
      cambio: commonPayload.cambio,
      herramienta_lectura: commonPayload.herramienta_lectura,
      metodo_lectura: commonPayload.metodo_lectura,
      archivo_origen: commonPayload.archivo_origen,
      modificaciones_hardware: commonPayload.modificaciones_hardware,
      prioridad: commonPayload.prioridad,
      legal_aceptado: commonPayload.legal_aceptado,
      legal_version: commonPayload.legal_version,
      legal_aceptado_at: commonPayload.legal_aceptado_at,
      legal_ip: commonPayload.legal_ip,
      precio_inicial: totalPrecio,
      precio_final: totalPrecio,
      ori: {
        nombre: commonPayload.ori_nombre,
        bucket: commonPayload.ori_bucket,
        path: commonPayload.ori_path,
        size: commonPayload.ori_size,
        sha256: commonPayload.ori_sha256,
      },
    }

    const descripcion = `AK Cloud — ${seleccionados.map((s) => s.nombre).join(', ')}`
    const payment = paymentMethod === 'sumup'
      ? await createSumUpOrderForPedido({
          userId: user.id,
          importe: totalPrecio,
          descripcion,
          payload: paymentPayload,
        })
      : await createPayPalOrderForPedido({
          userId: user.id,
          userEmail: user.email,
          importe: totalPrecio,
          descripcion,
          payload: paymentPayload,
        })

    return NextResponse.json({
      ok: true,
      requierePago: true,
      importe: totalPrecio,
      approveUrl: payment.approveUrl,
      pendienteId: payment.pendienteId,
      paymentMethod,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creando el pedido' }, { status: 500 })
  }
}
