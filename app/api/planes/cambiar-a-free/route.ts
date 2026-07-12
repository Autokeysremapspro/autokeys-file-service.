import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan variables de entorno de Supabase')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// POST /api/planes/cambiar-a-free
// El distribuidor puede pasarse a sí mismo al plan Free en cualquier
// momento (no hace falta que el staff lo confirme — no implica dinero,
// solo dejar de tener cuota mensual y pagar cada solución por separado).
export async function POST() {
  try {
    const userClient = createServerSupabaseClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const admin = adminClient()
    const { data: free } = await admin.from('akcloud_planes').select('id, slug').eq('slug', 'free').maybeSingle()
    if (!free) return NextResponse.json({ error: 'El plan Free no está configurado todavía' }, { status: 500 })

    const { error } = await admin
      .from('akcloud_distribuidores')
      .update({
        plan_id: free.id,
        plan_inicio_at: new Date().toISOString(),
        plan_expira_at: null,
        solicito_renovacion: false,
        solicito_renovacion_at: null,
      })
      .eq('auth_user_id', user.id)

    if (error) throw error

    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { plan_slug: 'free' },
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'No se pudo cambiar de plan' }, { status: 500 })
  }
}
