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
      .select('estado, plan_id, plan_expira_at')
      .eq('auth_user_id', user.id)
      .maybeSingle()
    if (!distribuidor || distribuidor.estado !== 'activo') {
      return NextResponse.json({ error: 'Cuenta no autorizada para crear pedidos' }, { status: 403 })
    }

    // Si el plan tiene fecha de caducidad y ya pasó, se trata como si no
    // tuviera plan (precio completo en todo) hasta que renueve o pase a
    // Free — así no sigue recibiendo el descuento de una cuota sin pagar.
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

    // Descuento de plan — dos niveles, por orden de prioridad:
    // 1º akcloud_plan_servicios: si hay una fila explícita para este plan +
    //    este servicio, manda ella (incluido sí/no, y su descuento propio).
    // 2º Si no hay fila explícita: se usa el sistema de grupos (anulacion/
    //    tuning) como respaldo, para no romper planes ya configurados así.
    let grupoIncluidos: string[] = []
    let descuentoPct = 0
    let planServiciosMap = new Map<string, { incluido: boolean; descuento_pct: number | null; precio_override: number | null; creditos_override: number | null }>()

    if (planIdEfectivo) {
      const [{ data: plan }, { data: planServicios }] = await Promise.all([
        admin.from('akcloud_planes').select('grupos_incluidos, descuento_plan_pct, limite_diario_pedidos, nombre').eq('id', planIdEfectivo).maybeSingle(),
        admin.from('akcloud_plan_servicios').select('servicio_id, incluido, descuento_pct, precio_override, creditos_override').eq('plan_id', planIdEfectivo),
      ])
      grupoIncluidos = plan?.grupos_incluidos || []
      descuentoPct = Number(plan?.descuento_plan_pct || 0)
      for (const row of planServicios || []) {
        planServiciosMap.set(row.servicio_id, {
          incluido: row.incluido,
          descuento_pct: row.descuento_pct,
          precio_override: row.precio_override,
          creditos_override: row.creditos_override,
        })
      }

      // Límite diario de pedidos del plan (no de créditos — un tope de
      // "cuántos archivos al día"). Se cuentan los pedidos creados desde
      // las 00:00 de hoy (hora del servidor).
      if (plan?.limite_diario_pedidos) {
        const inicioHoy = new Date()
        inicioHoy.setHours(0, 0, 0, 0)
        const { count } = await admin
          .from('file_service_pedidos')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', inicioHoy.toISOString())

        if ((count || 0) >= plan.limite_diario_pedidos) {
          return NextResponse.json(
            { error: `Has llegado al límite diario de tu plan ${plan.nombre} (${plan.limite_diario_pedidos} pedidos al día). Vuelve mañana o pide algo fuera del plan.` },
            { status: 429 }
          )
        }
      }
    }

    const conDescuentoPlan = seleccionados.map((s) => {
      const override = s.id ? planServiciosMap.get(s.id) : undefined

      // Prioridad 1: precio/créditos exactos puestos en "Planes AK" — manda
      // siempre que el servicio esté incluido en el plan, sin cálculos.
      if (override?.incluido && (override.precio_override != null || override.creditos_override != null)) {
        return {
          ...s,
          precio_final: override.precio_override ?? s.precio_final ?? s.precio,
          creditos_final: override.creditos_override ?? s.creditos_final ?? s.creditos,
        }
      }

      // Prioridad 2: descuento en % (de la pestaña "Servicios por plan" o del grupo general).
      let aplicaDescuento = false
      let pctAplicado = 0
      if (override) {
        aplicaDescuento = override.incluido
        pctAplicado = override.descuento_pct ?? descuentoPct
      } else {
        aplicaDescuento = Boolean(s.grupo_facturacion && grupoIncluidos.includes(s.grupo_facturacion))
        pctAplicado = descuentoPct
      }

      if (!aplicaDescuento || pctAplicado <= 0) return s
      const factor = 1 - pctAplicado / 100
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
