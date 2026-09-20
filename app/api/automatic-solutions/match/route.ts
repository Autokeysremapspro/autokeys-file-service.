import { NextResponse } from 'next/server'
import {
  auditAutomaticSolution,
  automaticSolutionsAdmin,
  automaticSolutionErrorStatus,
  hashStoredFile,
  requireAutomaticSolutionsUser,
} from '@/lib/automatic-solutions/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const user = await requireAutomaticSolutionsUser()
    const body = await request.json()
    const scanId = String(body?.scanId || '')
    const admin = automaticSolutionsAdmin()
    const { data: scan, error } = await admin.from('ak_auto_solution_scans').select('*').eq('id', scanId).eq('user_id', user.id).single()
    if (error || !scan) throw new Error('Análisis no encontrado')
    if (new Date(scan.expires_at).getTime() <= Date.now()) throw new Error('La subida ha caducado; vuelve a cargar el archivo')
    if (!['awaiting_upload', 'analyzed', 'matched', 'no_match'].includes(scan.status)) throw new Error('Este archivo ya no puede analizarse')

    const fingerprint = await hashStoredFile(scan.ori_path)
    const { data: solutions, error: matchError } = await admin
      .from('ak_auto_solutions')
      .select('id,name,service_code,service_name,ecu,hw,sw,vehicle_notes,price')
      .eq('ori_sha256', fingerprint.sha256)
      .eq('ori_size', fingerprint.size)
      .eq('status', 'published')
      .order('service_name')
    if (matchError) throw matchError

    const matches = solutions || []
    const status = matches.length ? 'matched' : 'no_match'
    const now = new Date().toISOString()
    const { error: updateError } = await admin.from('ak_auto_solution_scans').update({ ori_sha256: fingerprint.sha256, ori_size: fingerprint.size, status, match_count: matches.length, analyzed_at: now }).eq('id', scan.id).eq('user_id', user.id)
    if (updateError) throw updateError
    await auditAutomaticSolution({ actorUserId: user.id, action: matches.length ? 'exact_match_found' : 'exact_match_not_found', metadata: { scanId: scan.id, sha256: fingerprint.sha256, size: fingerprint.size, matches: matches.length } })

    return NextResponse.json({ ok: true, scanId: scan.id, exactMatch: matches.length > 0, solutions: matches })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo analizar el archivo' }, { status: automaticSolutionErrorStatus(error) })
  }
}

