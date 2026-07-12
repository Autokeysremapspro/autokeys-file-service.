import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Ruta PÚBLICA a propósito (sin comprobación de sesión): alimenta el widget
// embebible de potencia/par, pensado para poder ponerse en cualquier web,
// incluida la pública. Por eso selecciona explícitamente solo columnas de
// catálogo (marca, modelo, motor, potencia, par) y NUNCA `patrones` ni
// `tamanos`, que son la lógica interna del detector de ECU y no deben
// quedar expuestos a quien inspeccione esta respuesta.
export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Faltan variables de entorno de Supabase')

    const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data, error } = await admin
      .from('ak_ecu_detection_rules')
      .select('id, fabricante, ecu, familia, marcas, vehiculo, modelo, motor, potencia, par_nm, potencia_stage1, anios')
      .eq('activo', true)
      .order('familia', { ascending: true })

    if (error) throw error

    // Conteo de pedidos reales finalizados por ECU — así el visitante ve que
    // la cifra no es una tabla estática inventada, sino trabajo ya hecho.
    const { data: pedidos } = await admin
      .from('file_service_pedidos')
      .select('ecu')
      .eq('estado', 'finalizado')

    const conteoPorEcu = new Map<string, number>()
    for (const p of pedidos || []) {
      if (!p.ecu) continue
      conteoPorEcu.set(p.ecu, (conteoPorEcu.get(p.ecu) || 0) + 1)
    }

    const vehiculos = (data || []).map((rule) => ({
      ...rule,
      pedidos_reales: conteoPorEcu.get(rule.ecu) || 0,
    }))

    return NextResponse.json(
      { vehiculos },
      { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' } }
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error cargando el catálogo' }, { status: 500 })
  }
}
