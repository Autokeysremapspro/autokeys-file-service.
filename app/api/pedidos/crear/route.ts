import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createPayPalOrderForPedido } from '@/lib/paypal'
import { FALLBACK_SERVICIOS, type AkCloudServicio } from '@/lib/services/akCloudConfig'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// POST /api/pedidos/crear
// El precio SIEMPRE se recalcula aquí, en el servidor — nunca se confía en
// nada que mande el navegador. Modelo pago por archivo: cada servicio se
// cobra a su precio real de catálogo, sin planes ni límites diarios.
export async function POST(request: Request) {
  try {
    const userClient = createServerSupabaseClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const admin = adminClient()

    const { data: distribuidor } = await admin
      .from('akcloud_distribuidores')
      .select('estado')
      .eq('auth_user_id', user.id)
      .maybeSingle()
    if (!distribuidor || distribuidor.estado !== 'activo') {
      return NextResponse.json({ error: 'Cuenta no autorizada para crear pedidos' }, { status: 403 })
    }

    const body = await request.json()
    if (body.legalAccepted !== true) return NextResponse.json({ error: 'Debes aceptar las condiciones del servicio' }, { status: 400 })
    const legalVersion = String(body.legalVersion || 'AKCLOUD-LEGAL-2026-07-17')
    const forwardedFor = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null

    const serviciosSlugs: string[] = Array.isArray(body.servicios) ? body.servicios : []
    if (serviciosSlugs.length === 0) {
      return NextResponse.json({ error: 'Selecciona al menos un servicio' }, { status: 400 })
    }
    if (!body.ori?.path || !body.ori?.bucket) {
      return NextResponse.json({ error: 'Falta el archivo ORI' }, { status: 400 })
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

    // Pago por archivo: siempre el precio real del catálogo, calculado en el
    // servidor. Sin planes, sin descuentos, sin límite diario de pedidos.
    const conPrecioReal = seleccionados.map((s) => ({ ...s, precio_final: Number(s.precio ?? 0) }))

    const totalPrecio = Number(conPrecioReal.reduce((sum, s) => sum + Number(s.precio_final ?? 0), 0).toFixed(2))

    // Caso 1: todo gratis (cubierto por el plan) — se crea el pedido ya mismo,
    // sin pasar por ningún pago.
    if (totalPrecio <= 0) {
      const { data: pedido, error: pedidoError } = await admin
        .from('file_service_pedidos')
        .insert({
          user_id: user.id,
          cliente_nombre: user.user_metadata?.name || user.email || null,
          cliente_email: user.email || null,
          servicios: seleccionados.map((s) => s.nombre),
          observaciones: body.observaciones || null,
          marca: body.marca,
          modelo: body.modelo,
          motor: body.motor || null,
          anio: body.anio || null,
          ecu: body.ecu || null,
          hw: body.hw || null,
          sw: body.sw || null,
          cv: body.cv || null,
          cambio: body.cambio || null,
          prioridad: body.prioridad || 'normal',
          precio: 0,
          precio_inicial: 0,
          precio_final: 0,
          legal_aceptado: true, legal_version: legalVersion, legal_aceptado_at: new Date().toISOString(), legal_ip: forwardedFor,
          estado: 'pendiente',
          ori_nombre: body.ori.nombre || null,
          ori_bucket: body.ori.bucket,
          ori_path: body.ori.path,
          ori_size: body.ori.size || null,
          ori_sha256: body.ori.sha256 || null,
        })
        .select('*')
        .single()

      if (pedidoError) throw pedidoError
      return NextResponse.json({ ok: true, requierePago: false, pedido })
    }

    // Caso 2: hay que pagar — se crea una orden de PayPal por el importe
    // exacto y el pedido se queda "en espera" hasta que se confirme el cobro.
    const { approveUrl, pendienteId } = await createPayPalOrderForPedido({
      userId: user.id,
      userEmail: user.email,
      importe: totalPrecio,
      descripcion: `AK Cloud — ${seleccionados.map((s) => s.nombre).join(', ')}`,
      payload: {
        cliente_nombre: user.user_metadata?.name || user.email || null,
        cliente_email: user.email || null,
        servicios_nombres: seleccionados.map((s) => s.nombre),
        observaciones: body.observaciones || null,
        marca: body.marca,
        modelo: body.modelo,
        motor: body.motor || null,
        anio: body.anio || null,
        ecu: body.ecu || null,
        hw: body.hw || null,
        sw: body.sw || null,
        cv: body.cv || null,
        cambio: body.cambio || null,
        prioridad: body.prioridad || 'normal',
        legal_aceptado: true, legal_version: legalVersion, legal_aceptado_at: new Date().toISOString(), legal_ip: forwardedFor,
        ori: body.ori,
      },
    })

    return NextResponse.json({ ok: true, requierePago: true, importe: totalPrecio, approveUrl, pendienteId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creando el pedido' }, { status: 500 })
  }
}
