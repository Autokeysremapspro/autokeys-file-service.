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

type ServicioRow = {
  id: string
  slug: string
  nombre: string
  precio: number
}

export type PricingRuleBadge = {
  ruleId: string
  label: string
  helper?: string
  tone: 'pack' | 'included'
  precioNormal?: number
  precioConjunto?: number
  ahorro?: number
  otherServiceSlug?: string
  otherServiceName?: string
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

function moneyShort(value: number) {
  const rounded = Number(value || 0)
  return `${rounded.toFixed(rounded % 1 === 0 ? 0 : 2)} €`
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

    if (error || !rules?.length) return map

    const allSlugs = Array.from(new Set((rules as PricingRuleRow[]).flatMap((raw) => [
      String(raw.servicio_principal_slug || '').trim(),
      ...(Array.isArray(raw.servicios_gratis) ? raw.servicios_gratis.map(String) : []),
      ...(Array.isArray(raw.servicios_requeridos) ? raw.servicios_requeridos.map(String) : []),
    ]).filter(Boolean)))

    const { data: serviciosData } = allSlugs.length
      ? await supabase.from('akcloud_servicios').select('id,slug,nombre,precio').in('slug', allSlugs)
      : { data: [] as ServicioRow[] }

    const servicios = (serviciosData || []) as ServicioRow[]
    const serviceIds = servicios.map((servicio) => servicio.id)
    const { data: overrides } = serviceIds.length
      ? await supabase
          .from('distribuidor_precios')
          .select('servicio_id,precio')
          .eq('distribuidor_id', distribuidor.id)
          .in('servicio_id', serviceIds)
      : { data: [] as Array<{ servicio_id: string; precio: number }> }

    const overrideMap = new Map((overrides || []).map((row: any) => [String(row.servicio_id), Number(row.precio)]))
    const bySlug = new Map(servicios.map((servicio) => [String(servicio.slug), servicio]))
    const effectivePrice = (slug: string) => {
      const servicio = bySlug.get(slug)
      if (!servicio) return 0
      return overrideMap.has(String(servicio.id)) ? overrideMap.get(String(servicio.id))! : Number(servicio.precio || 0)
    }
    const serviceName = (slug: string) => bySlug.get(slug)?.nombre || slug

    for (const raw of rules as PricingRuleRow[]) {
      const type = String(raw.tipo || 'extras_gratis')
      const ruleId = String(raw.id)
      const nombre = String(raw.nombre || 'Tarifa especial').trim()

      if (type === 'combo_fijo') {
        const slugs = Array.isArray(raw.servicios_requeridos)
          ? Array.from(new Set(raw.servicios_requeridos.map(String).filter(Boolean)))
          : []
        if (slugs.length !== 2) continue

        const precioConjunto = Number(raw.precio_conjunto)
        if (!Number.isFinite(precioConjunto) || precioConjunto < 0) continue

        const precioNormal = Number(slugs.reduce((sum, slug) => sum + effectivePrice(slug), 0).toFixed(2))
        const ahorro = Number(Math.max(0, precioNormal - precioConjunto).toFixed(2))
        const label = ahorro > 0
          ? `PACK · ${moneyShort(precioNormal)} → ${moneyShort(precioConjunto)} · AHORRAS ${moneyShort(ahorro)}`
          : `PACK ACTIVO · ${nombre}`

        slugs.forEach((slug, index) => {
          const otherSlug = slugs[index === 0 ? 1 : 0]
          addBadge(map, slug, {
            ruleId,
            label,
            helper: `Combínalo con ${serviceName(otherSlug)} y ambos quedan en ${moneyShort(precioConjunto)}.`,
            tone: 'pack',
            precioNormal,
            precioConjunto,
            ahorro,
            otherServiceSlug: otherSlug,
            otherServiceName: serviceName(otherSlug),
          })
        })
        continue
      }

      const trigger = String(raw.servicio_principal_slug || '').trim()
      const free = Array.isArray(raw.servicios_gratis)
        ? Array.from(new Set(raw.servicios_gratis.map(String).filter(Boolean)))
        : []
      if (!trigger) continue

      addBadge(map, trigger, {
        ruleId,
        label: `PROMO ACTIVA · EXTRAS INCLUIDOS`,
        helper: `${nombre}: los extras configurados quedan a 0 € al añadirlos con ${serviceName(trigger)}.`,
        tone: 'included',
      })

      free.forEach((slug) => addBadge(map, slug, {
        ruleId,
        label: `INCLUIDO CON ${serviceName(trigger).toUpperCase()} · 0 €`,
        helper: `Selecciona también ${serviceName(trigger)} y este extra queda incluido.`,
        tone: 'included',
      }))
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
