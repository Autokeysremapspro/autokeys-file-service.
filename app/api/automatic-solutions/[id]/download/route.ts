import { NextResponse } from 'next/server'
import {
  auditAutomaticSolution,
  automaticSolutionsAdmin,
  automaticSolutionErrorStatus,
  requireAutomaticSolutionsUser,
} from '@/lib/automatic-solutions/server'

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAutomaticSolutionsUser()
    const admin = automaticSolutionsAdmin()
    const { data: order, error } = await admin.from('ak_auto_solution_orders').select('*').eq('id', params.id).eq('user_id', user.id).single()
    if (error || !order) throw new Error('Compra no encontrada')
    if (!['paid', 'delivered'].includes(order.status)) throw new Error('El pago todavía no está confirmado')
    if (Number(order.download_count) >= 5) throw new Error('Se alcanzó el límite de descargas; contacta con soporte')
    const snapshot = order.solution_snapshot || {}
    if (!snapshot.mod_bucket || !snapshot.mod_path || !snapshot.mod_name) throw new Error('La entrega no está disponible')
    const { data, error: signError } = await admin.storage.from(snapshot.mod_bucket).createSignedUrl(snapshot.mod_path, 120, { download: snapshot.mod_name })
    if (signError || !data?.signedUrl) throw new Error(signError?.message || 'No se pudo preparar la descarga')
    const now = new Date().toISOString()
    const nextCount = Number(order.download_count) + 1
    const { data: updated, error: updateError } = await admin.from('ak_auto_solution_orders').update({ status: 'delivered', delivered_at: order.delivered_at || now, download_count: nextCount, last_download_at: now, updated_at: now }).eq('id', order.id).eq('user_id', user.id).eq('download_count', order.download_count).select('id').maybeSingle()
    if (updateError || !updated) throw new Error('Otra descarga está en curso; espera unos segundos y vuelve a intentarlo')
    await auditAutomaticSolution({ actorUserId: user.id, solutionId: order.solution_id, orderId: order.id, action: 'automatic_solution_downloaded', metadata: { download: nextCount } })
    return NextResponse.json({ ok: true, url: data.signedUrl, expiresIn: 120, remainingDownloads: 5 - nextCount })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo descargar la solución' }, { status: automaticSolutionErrorStatus(error) })
  }
}
