import { NextResponse } from 'next/server'
import crypto from 'crypto'
import {
  automaticSolutionsAdmin,
  automaticSolutionErrorStatus,
  createPrivateUpload,
  requireAutomaticSolutionsStaff,
  validateFileDescriptor,
} from '@/lib/automatic-solutions/server'
import { AUTOMATIC_SOLUTION_BUCKET } from '@/lib/automatic-solutions/types'

export const runtime = 'nodejs'

export async function GET() {
  try {
    await requireAutomaticSolutionsStaff()
    const { data, error } = await automaticSolutionsAdmin()
      .from('ak_auto_solutions')
      .select('id,name,service_code,service_name,ecu,hw,sw,vehicle_notes,ori_sha256,ori_size,ori_name,mod_sha256,mod_size,mod_name,price,status,verification_suite,verified_at,published_at,created_at,updated_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ ok: true, solutions: data || [] })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo cargar la biblioteca' }, { status: automaticSolutionErrorStatus(error) })
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireAutomaticSolutionsStaff()
    const body = await request.json()
    const oriName = validateFileDescriptor(String(body?.oriName || ''), Number(body?.oriSize))
    const modName = validateFileDescriptor(String(body?.modName || ''), Number(body?.modSize))
    const solutionId = crypto.randomUUID()
    const oriPath = `library/${solutionId}/ori/${oriName}`
    const modPath = `library/${solutionId}/mod/${modName}`
    const [oriUpload, modUpload] = await Promise.all([
      createPrivateUpload(oriPath),
      createPrivateUpload(modPath),
    ])

    return NextResponse.json({
      ok: true,
      solutionId,
      bucket: AUTOMATIC_SOLUTION_BUCKET,
      createdBy: user.id,
      uploads: {
        ori: { path: oriPath, token: oriUpload.token },
        mod: { path: modPath, token: modUpload.token },
      },
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo preparar la solución' }, { status: automaticSolutionErrorStatus(error) })
  }
}

