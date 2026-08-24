'use client'

import { supabase } from '@/lib/supabase'

type PricingRuleRow = {
  id: string
  nombre: string
  tipo: string | null
  servicio_principal_slug: string | null
  servicios_gratis: string[] | null
  servicios_requeridos: string[] | null
  precio_conjunto: number | null
}

export type PricingRuleBadge = {
  ruleId: string
  label: string
  tone: 'pack' | 'included'
}

let badgesPromise: Promise<Map<string, PricingRuleBadge[]>> | null = null

function addBadge(map: Map<string, PricingRuleBadge[]>, slug: string, badge: PricingRuleBadge) {
  if (!slug) return
  const current = map.get(slug) || []
  if (!current.some((item) => item.ruleId === badge.ruleId)) {
    current.push(badge)
    map.set(slug, current)
  }
}

async function loadPricingRuleBadges() {
  const map = new Map<string, PricingRuleBadge[]>()

  try {
    const { data: auth } = await supabase.auth.getUser()
    const user = auth.user
    if (!user) return map

    const { data: distribuidor } = await supabase
      .from('akcloud_distribuidores')
      .select('id')
      .eq('auth_user_id', user.id)
      .eq('estado', 'activo')
      .maybeSingle()

    if (!distribuidor?.id) return map

    const { data: rules, error } = await supabase
      .from('akcloud_reglas_precios')
      .select('id,nombre,tipo,servicio_principal_slug,servicios_gratis,servicios_requeridos,precio_conjunto')
      .eq('activo', true)
      .contains('solo_distribuidores', [distribuidor.id])
      .order('orden', { ascending: true })

    if (error || !rules) return map

    for (const raw of rules as PricingRuleRow[]) {
      const type = String(raw.tipo || 'extras_gratis')
      const ruleId = String(raw.id)
      const nombre = String(raw.nombre || 'Tarifa especial').trim()

      if (type === 'combo_fijo') {
        const slugs = Array.isArray(raw.servicios_requeridos)
          ? Array.from(new Set(raw.servicios_requeridos.map(String).filter(Boolean)))
          : []
        if (slugs.length < 2) continue

        const precio = Number(raw.precio_conjunto)
        const priceText = Number.isFinite(precio)
          ? ` · ${precio.toFixed(precio % 1 === 0 ? 0 : 2)} € total`
          : ''
        const badge = { ruleId, label: `PACK ACTIVO · ${nombre}${nombre.includes('€') ? '' : priceText}`, tone: 'pack' as const }
        slugs.forEach((slug) => addBadge(map, slug, badge))
        continue
      }

      const trigger = String(raw.servicio_principal_slug || '').trim()
      const free = Array.isArray(raw.servicios_gratis)
        ? Array.from(new Set(raw.servicios_gratis.map(String).filter(Boolean)))
        : []
      const badge = { ruleId, label: `PROMO ACTIVA · ${nombre}`, tone: 'included' as const }
      if (trigger) addBadge(map, trigger, badge)
      free.forEach((slug) => addBadge(map, slug, badge))
    }
  } catch {
    // Las etiquetas son informativas. Un fallo aquí nunca debe bloquear Nuevo pedido.
  }

  return map
}

export function getPricingRuleBadges() {
  if (!badgesPromise) badgesPromise = loadPricingRuleBadges()
  return badgesPromise
}

export function clearPricingRuleBadgesCache() {
  badgesPromise = null
}
