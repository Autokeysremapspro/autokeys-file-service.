import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { aplicarReglasPrecios, FALLBACK_SERVICIOS, type AkCloudServicio, type AkCloudReglaPrecio } from '@/lib/services/akCloudConfig'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// POST /api/pedidos/crear
// El precio y los créditos SIEMPRE se recalculan aquí, en el servidor, a
// partir de los slugs de servicio — nunca se confía en el "precio" que
// pudiera mandar el navegador. Antes de esta ruta, crear un pedido no
// descontaba ningún crédito: cualquiera podía pedir servicios ilimitados
// gratis. Esta ruta es la única forma correcta de crear un pedido.
export async function POST(request: Request) {
  try {
    const userClient = createServerSupabaseClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const admin = adminClient()

    // Debe ser distribuidor aprobado y activo (misma comprobación que el middleware,
    // repetida aquí porque una ruta API nunca debe fiarse solo de que el middleware
    // ya haya filtrado — alguien podría llamarla directamente).
    const { data: distribuidor } = await admin
      .from('akcloud_distribuidores')
      .select('estado, plan_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()
    if (!distribuidor || distribuidor.estado !== 'activo') {
      return NextResponse.json({ error: 'Cuenta no autorizada para crear pedidos' }, { status: 403 })
    }

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

    // Precio y créditos: SIEMPRE calculados aquí, con los datos reales de Core/AK Cloud.
    const [{ data: serviciosData }, { data: reglasData }] = await Promise.all([
      admin.from('akcloud_servicios').select('*').eq('activo', true),
      admin.from('akcloud_reglas_precios').select('*').eq('activo', true),
    ])
    const servicios = (serviciosData && serviciosData.length ? serviciosData : FALLBACK_SERVICIOS) as AkCloudServicio[]
    const reglas = (reglasData || []) as AkCloudReglaPrecio[]

    const calculados = aplicarReglasPrecios(servicios, serviciosSlugs, reglas)
    const seleccionados = calculados.filter((s) => serviciosSlugs.includes(s.slug))

    if (seleccionados.length !== serviciosSlugs.length) {
      return NextResponse.json({ error: 'Alguno de los servicios seleccionados no existe o no está activo' }, { status: 400 })
    }

    // Descuento de plan: solo se aplica a los servicios cuyo "grupo de
    // facturación" (anulacion / tuning) esté entre los que cubre el plan del
    // distribuidor. Si pide algo fuera de lo que cubre su plan (p. ej. Stage 1
    // con el plan Essential), lo paga al precio completo — "aparte" del plan,
    // tal como se decidió.
    let grupoIncluidos: string[] = []
    let descuentoPct = 0
    if (distribuidor.plan_id) {
      const { data: plan } = await admin
        .from('akcloud_planes')
        .select('grupos_incluidos, descuento_plan_pct')
        .eq('id', distribuidor.plan_id)
        .maybeSingle()
      grupoIncluidos = plan?.grupos_incluidos || []
      descuentoPct = Number(plan?.descuento_plan_pct || 0)
    }

    const conDescuentoPlan = seleccionados.map((s) => {
      const cubiertoPorPlan = s.grupo_facturacion && grupoIncluidos.includes(s.grupo_facturacion)
      if (!cubiertoPorPlan || descuentoPct <= 0) return s
      const factor = 1 - descuentoPct / 100
      return {
        ...s,
        creditos_final: Math.round(Number(s.creditos_final ?? s.creditos ?? 0) * factor),
        precio_final: Number(((s.precio_final ?? s.precio ?? 0) * factor).toFixed(2)),
      }
    })

    const totalCreditos = conDescuentoPlan.reduce((sum, s) => sum + Number(s.creditos_final ?? s.creditos ?? 0), 0)
    const totalPrecio = conDescuentoPlan.reduce((sum, s) => sum + Number(s.precio_final ?? s.precio ?? 0), 0)

    // Crea el pedido primero (sin cobrar todavía)
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
        precio: totalPrecio,
        estado: 'pendiente',
        ori_nombre: body.ori.nombre || null,
        ori_bucket: body.ori.bucket,
        ori_path: body.ori.path,
        ori_size: body.ori.size || null,
      })
      .select('*')
      .single()

    if (pedidoError) throw pedidoError

    // Descuento atómico — la función ak_consumir_creditos() (SQL) hace la
    // comprobación de saldo y el descuento en una sola operación indivisible,
    // así dos pedidos creados casi a la vez nunca pueden gastar más saldo
    // del que hay de verdad, aunque las peticiones se solapen.
    const { data: nuevoSaldo, error: movError } = await admin.rpc('ak_consumir_creditos', {
      p_user_id: user.id,
      p_creditos: totalCreditos,
      p_concepto: `Pedido ${pedido.numero || pedido.id} — ${seleccionados.map((s) => s.nombre).join(', ')}`,
      p_pedido_id: pedido.id,
    })

    if (movError) {
      // El pedido ya se creó pero el descuento falló (normalmente por saldo
      // insuficiente) — se revierte el pedido en vez de dejar un trabajo
      // "gratis" sin cobrar.
      await admin.from('file_service_pedidos').delete().eq('id', pedido.id)
      if (movError.message?.includes('saldo_insuficiente')) {
        return NextResponse.json({ error: `Saldo insuficiente para este pedido (necesitas ${totalCreditos} créditos).` }, { status: 402 })
      }
      throw movError
    }

    return NextResponse.json({ ok: true, pedido, creditos_descontados: totalCreditos, saldo_resultante: nuevoSaldo })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creando el pedido' }, { status: 500 })
  }
}
