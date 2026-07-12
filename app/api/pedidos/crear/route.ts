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
      .select('estado')
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

    const totalCreditos = seleccionados.reduce((sum, s) => sum + Number(s.creditos_final ?? s.creditos ?? 0), 0)
    const totalPrecio = seleccionados.reduce((sum, s) => sum + Number(s.precio_final ?? s.precio ?? 0), 0)

    // Saldo actual real (último movimiento del usuario)
    const { data: last } = await admin
      .from('ak_creditos_movimientos')
      .select('saldo_resultante')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    const saldoActual = Number(last?.saldo_resultante || 0)

    if (saldoActual < totalCreditos) {
      return NextResponse.json(
        { error: `Saldo insuficiente: necesitas ${totalCreditos} créditos y tienes ${saldoActual}.` },
        { status: 402 }
      )
    }

    // Crea el pedido
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

    // Descuenta el saldo — este es el movimiento que antes no existía.
    const nuevoSaldo = saldoActual - totalCreditos
    const { error: movError } = await admin.from('ak_creditos_movimientos').insert({
      user_id: user.id,
      tipo: 'consumo',
      concepto: `Pedido ${pedido.numero || pedido.id} — ${seleccionados.map((s) => s.nombre).join(', ')}`,
      pedido_id: pedido.id,
      creditos: -totalCreditos,
      saldo_resultante: nuevoSaldo,
    })

    if (movError) {
      // El pedido ya se creó pero el descuento falló — se revierte el pedido
      // en vez de dejar un trabajo "gratis" sin cobrar.
      await admin.from('file_service_pedidos').delete().eq('id', pedido.id)
      throw movError
    }

    return NextResponse.json({ ok: true, pedido, creditos_descontados: totalCreditos, saldo_resultante: nuevoSaldo })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creando el pedido' }, { status: 500 })
  }
}
