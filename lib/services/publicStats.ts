import { createClient } from '@supabase/supabase-js'

export type PublicStats = {
  pedidosCompletados: number
  talleresActivos: number
  ecusSoportadas: number
}

// Umbral mínimo para mostrar la franja de cifras en la home: mejor no
// enseñar nada que enseñar un número pequeño que dé la impresión contraria
// a la que busca la sección (probar que ya hay actividad real detrás).
const MIN_PEDIDOS_PARA_MOSTRAR = 15
const MIN_TALLERES_PARA_MOSTRAR = 5

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// Cifras reales leídas de la base de datos para la portada pública.
// Nunca se inventan ni se rellenan con un valor por defecto si falla la
// consulta: devolvemos null y la home simplemente no pinta esa sección.
export async function getPublicStats(): Promise<PublicStats | null> {
  const admin = adminClient()
  if (!admin) return null

  try {
    const [pedidos, talleres, ecus] = await Promise.all([
      admin.from('file_service_pedidos').select('id', { count: 'exact', head: true }).eq('estado', 'finalizado'),
      admin.from('akcloud_distribuidores').select('id', { count: 'exact', head: true }).eq('estado', 'activo'),
      admin.from('ak_ecu_detection_rules').select('id', { count: 'exact', head: true }).eq('activo', true),
    ])

    if (pedidos.error || talleres.error || ecus.error) return null

    const stats: PublicStats = {
      pedidosCompletados: pedidos.count || 0,
      talleresActivos: talleres.count || 0,
      ecusSoportadas: ecus.count || 0,
    }

    if (stats.pedidosCompletados < MIN_PEDIDOS_PARA_MOSTRAR || stats.talleresActivos < MIN_TALLERES_PARA_MOSTRAR) {
      return null
    }

    return stats
  } catch {
    return null
  }
}
