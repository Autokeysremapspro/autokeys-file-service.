import { createClient } from '@supabase/supabase-js'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Falta la configuración de Supabase')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function markAkCloudAccess(userId: string) {
  const admin = adminClient()
  const { data: account, error } = await admin
    .from('akcloud_distribuidores')
    .select('id, estado, primer_acceso_at, desactivada_por_inactividad_at')
    .eq('auth_user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!account) return { found: false, reactivated: false, estado: null }

  const now = new Date().toISOString()
  const reactivated = account.estado === 'suspendido' && Boolean(account.desactivada_por_inactividad_at)
  const updates: Record<string, string | null> = {
    ultimo_acceso: now,
    updated_at: now,
  }

  if (!account.primer_acceso_at) updates.primer_acceso_at = now
  if (reactivated) {
    updates.estado = 'activo'
    updates.desactivada_por_inactividad_at = null
    updates.aviso_inactividad_enviado_at = null
  }

  const { error: updateError } = await admin
    .from('akcloud_distribuidores')
    .update(updates)
    .eq('id', account.id)

  if (updateError) throw updateError

  return {
    found: true,
    reactivated,
    estado: reactivated ? 'activo' : account.estado,
  }
}
