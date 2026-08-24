import { supabase } from '@/lib/supabase'

export type ComboPricingRule = {
  id: string
  nombre: string
  tipo: 'combo_fijo'
  servicios_requeridos: string[]
  precio_conjunto: number
  orden: number
}

export type AppliedComboRule = {
  id: string
  nombre: string
  servicios: string[]
  precioConjunto: number
  precioSinRegla: number
  ahorro: number
}

export async function getReglasPrecioAplicables(): Promise<ComboPricingRule[]> {
  try {
    const { data: auth } = await supabase.auth.getUser()
    const user = auth.user
    if (!user) return []

    const { data: distribuidor } = await supabase
      .from('akcloud_distribuidores')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()
    if (!distribuidor?.id) return []

    const { data, error } = await supabase
      .from('akcloud_reglas_precios')
      .select('id,nombre,tipo,servicios_requeridos,precio_conjunto,orden,activo')
      .eq('activo', true)
      .eq('tipo', 'combo_fijo')
      .contains('solo_distribuidores', [distribuidor.id])
      .order('orden', { ascending: true })

    if (error || !data) return []

    return data
      .map((row: any) => ({
        id: String(row.id),
        nombre: String(row.nombre),
        tipo: 'combo_fijo' as const,
        servicios_requeridos: Array.isArray(row.servicios_requeridos) ? row.servicios_requeridos.map(String) : [],
        precio_conjunto: Number(row.precio_conjunto ?? 0),
        orden: Number(row.orden || 100),
      }))
      .filter((rule) => rule.servicios_requeridos.length >= 2 && Number.isFinite(rule.precio_conjunto) && rule.precio_conjunto >= 0)
  } catch {
    return []
  }
}

export function aplicarReglasPrecioCombo<T extends { slug: string; precio_final: number }>(
  selectedServices: T[],
  rules: ComboPricingRule[],
) {
  const bySlug = new Map(selectedServices.map((service) => [service.slug, service]))
  const totalBase = Number(selectedServices.reduce((sum, service) => sum + Number(service.precio_final || 0), 0).toFixed(2))

  const candidates = rules
    .map((rule) => {
      const uniqueSlugs = Array.from(new Set(rule.servicios_requeridos))
      if (uniqueSlugs.length < 2 || !uniqueSlugs.every((slug) => bySlug.has(slug))) return null
      const precioSinRegla = Number(uniqueSlugs.reduce((sum, slug) => sum + Number(bySlug.get(slug)?.precio_final || 0), 0).toFixed(2))
      const precioConjunto = Number(rule.precio_conjunto)
      const ahorro = Number((precioSinRegla - precioConjunto).toFixed(2))
      if (!(ahorro > 0)) return null
      return { rule, uniqueSlugs, precioSinRegla, precioConjunto, ahorro }
    })
    .filter(Boolean) as Array<{
      rule: ComboPricingRule
      uniqueSlugs: string[]
      precioSinRegla: number
      precioConjunto: number
      ahorro: number
    }>

  // Primero la regla que más ahorra. Si dos ahorran lo mismo, se respeta el orden administrativo.
  // Un servicio no puede formar parte de dos packs aplicados a la vez: evita descuentos dobles.
  candidates.sort((a, b) => b.ahorro - a.ahorro || a.rule.orden - b.rule.orden || a.rule.nombre.localeCompare(b.rule.nombre))

  const used = new Set<string>()
  const aplicadas: AppliedComboRule[] = []
  let descuento = 0

  for (const candidate of candidates) {
    if (candidate.uniqueSlugs.some((slug) => used.has(slug))) continue
    candidate.uniqueSlugs.forEach((slug) => used.add(slug))
    descuento += candidate.ahorro
    aplicadas.push({
      id: candidate.rule.id,
      nombre: candidate.rule.nombre,
      servicios: candidate.uniqueSlugs,
      precioConjunto: candidate.precioConjunto,
      precioSinRegla: candidate.precioSinRegla,
      ahorro: candidate.ahorro,
    })
  }

  descuento = Number(descuento.toFixed(2))
  const totalFinal = Number(Math.max(0, totalBase - descuento).toFixed(2))
  return { totalBase, descuento, totalFinal, aplicadas }
}
