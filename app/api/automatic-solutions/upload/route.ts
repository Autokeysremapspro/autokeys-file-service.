import { NextResponse } from 'next/server'
import crypto from 'crypto'
import {
  automaticSolutionsAdmin,
  automaticSolutionErrorStatus,
  createPrivateUpload,
  requireAutomaticSolutionsUser,
  validateFileDescriptor,
} from '@/lib/automatic-solutions/server'
import { AUTOMATIC_SOLUTION_BUCKET } from '@/lib/automatic-solutions/types'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const user = await requireAutomaticSolutionsUser()
    const body = await request.json()
    const fileName = validateFileDescriptor(String(body?.fileName || ''), Number(body?.fileSize))
    const scanId = crypto.randomUUID()
    const path = `scans/${user.id}/${scanId}/${fileName}`
    const { data: scan, error } = await automaticSolutionsAdmin().from('ak_auto_solution_scans').insert({
      id: scanId,
      user_id: user.id,
      ori_bucket: AUTOMATIC_SOLUTION_BUCKET,
      ori_path: path,
      ori_name: fileName,
    }).select('id,expires_at').single()
    if (error) throw error
    const upload = await createPrivateUpload(path)
    return NextResponse.json({ ok: true, scan, upload: { bucket: AUTOMATIC_SOLUTION_BUCKET, path, token: upload.token } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo preparar el análisis' }, { status: automaticSolutionErrorStatus(error) })
  }
}

