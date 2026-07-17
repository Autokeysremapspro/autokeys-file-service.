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
// nada que mande el navegador. Ya no se paga con créditos: si el servicio
// está cubierto por tu plan, es gratis de verdad (solo limitado por el tope
// diario de pedidos); si no lo está (o estás en el plan Free), se paga el
// precio real en euros con PayPal antes de crear el pedido.
export async function POST(request: Request) {
  try {
    const userClient = createServerSupabaseClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const admin = adminClient()

    const { data: distribuidor } = await admin
      .from('akcloud_distribuidores')
      .select('estado, plan_id, plan_expira_at')
      .eq('auth_user_id', user.id)
      .maybeSingle()
    if (!distribuidor || distribuidor.estado !== 'activo') {
      return NextResponse.json({ error: 'Cuenta no autorizada para crear pedidos' }, { status: 403 })
    }

    // Plan caducado = se trata como si no tuviera plan (todo a precio completo)
    // hasta que renueve o pase a Free.
    const planCaducado = Boolean(distribuidor.plan_expira_at && new Date(distribuidor.plan_expira_at).getTime() < Date.now())
    const planIdEfectivo = planCaducado ? null : distribuidor.plan_id

    const body = await request.json()
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

    // Precio real por servicio, por orden de prioridad:
    // 1º "Planes AK" (akcloud_plan_servicios.precio_override): el número
    //    exacto que pusiste ahí manda siempre. 0 = gratis/ilimitado de verdad.
    // 2º Si no hay fila explícita para este plan+servicio: precio completo
    //    del catálogo — ya no hay descuentos por grupo/porcentaje, es
    //    "cubierto por tu plan" o "precio real", sin término medio.
    let planNombre = 'Free'
    let limiteDiario: number | null = null
    let planServiciosMap = new Map<string, { incluido: boolean; precio_override: number | null }>()

    if (planIdEfectivo) {
      const [{ data: plan }, { data: planServicios }] = await Promise.all([
        admin.from('akcloud_planes').select('nombre, limite_diario_pedidos').eq('id', planIdEfectivo).maybeSingle(),
        admin.from('akcloud_plan_servicios').select('servicio_id, incluido, precio_override').eq('plan_id', planIdEfectivo),
      ])
      planNombre = plan?.nombre || 'tu plan'
      limiteDiario = plan?.limite_diario_pedidos ?? null
      for (const row of planServicios || []) {
        planServiciosMap.set(row.servicio_id, { incluido: row.incluido, precio_override: row.precio_override })
      }
    }

    // Tope diario de pedidos (no de créditos) — se aplica siempre que el
    // plan lo tenga configurado, cubra o no cubra todos los servicios pedidos.
    if (limiteDiario) {
      const inicioHoy = new Date()
      inicioHoy.setHours(0, 0, 0, 0)
      const { count } = await admin
        .from('file_service_pedidos')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', inicioHoy.toISOString())

      if ((count || 0) >= limiteDiario) {
        return NextResponse.json(
          { error: `Has llegado al límite diario de tu plan ${planNombre} (${limiteDiario} pedidos al día). Vuelve mañana.` },
          { status: 429 }
        )
      }
    }

    const conPrecioReal = seleccionados.map((s) => {
      const override = s.id ? planServiciosMap.get(s.id) : undefined
      if (override?.incluido) {
        // precio_override null también cuenta como "gratis" si está marcado
        // incluido sin precio puesto — mejor pecar de gratis que de cobrar
        // algo no configurado.
        return { ...s, precio_final: Number(override.precio_override ?? 0) }
      }
      // No cubierto por el plan (o sin plan): precio real del catálogo, sin descuentos.
      return { ...s, precio_final: Number(s.precio ?? 0) }
    })

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
          estado: 'pendiente',
          ori_nombre: body.ori.nombre || null,
          ori_bucket: body.ori.bucket,
          ori_path: body.ori.path,
          ori_size: body.ori.size || null,
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
        ori: body.ori,
      },
    })

    return NextResponse.json({ ok: true, requierePago: true, importe: totalPrecio, approveUrl, pendienteId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creando el pedido' }, { status: 500 })
  }
}
