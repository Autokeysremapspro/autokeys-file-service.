import { NextResponse } from 'next/server'
import {
  auditAutomaticSolution,
  automaticSolutionsAdmin,
  automaticSolutionErrorStatus,
  hashStoredFile,
  requireAutomaticSolutionsStaff,
  safeFileName,
} from '@/lib/automatic-solutions/server'
import { AUTOMATIC_SOLUTION_BUCKET, AUTOMATIC_SOLUTION_PRICE } from '@/lib/automatic-solutions/types'

export const runtime = 'nodejs'

function clean(value: unknown, max: number) {
  return String(value || '').trim().slice(0, max)
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireAutomaticSolutionsStaff()
    const body = await request.json()
    const id = params.id
    if (!/^[a-f0-9-]{36}$/i.test(id)) throw new Error('Identificador no válido')

    const oriName = safeFileName(String(body?.oriName || ''))
    const modName = safeFileName(String(body?.modName || ''))
    const oriPath = String(body?.oriPath || '')
    const modPath = String(body?.modPath || '')
    if (oriPath !== `library/${id}/ori/${oriName}` || modPath !== `library/${id}/mod/${modName}`) {
      throw new Error('Las rutas de los archivos no corresponden a esta solución')
    }

    const [ori, mod] = await Promise.all([hashStoredFile(oriPath), hashStoredFile(modPath)])
    const record = {
      id,
      name: clean(body?.name, 140),
      service_code: clean(body?.serviceCode, 50).toLowerCase(),
      service_name: clean(body?.serviceName, 100),
      ecu: clean(body?.ecu, 80).toUpperCase(),
      hw: clean(body?.hw, 80).toUpperCase() || null,
      sw: clean(body?.sw, 80).toUpperCase() || null,
      vehicle_notes: clean(body?.vehicleNotes, 500) || null,
      ori_sha256: ori.sha256,
      ori_size: ori.size,
      ori_bucket: AUTOMATIC_SOLUTION_BUCKET,
      ori_path: oriPath,
      ori_name: oriName,
      mod_sha256: mod.sha256,
      mod_size: mod.size,
      mod_bucket: AUTOMATIC_SOLUTION_BUCKET,
      mod_path: modPath,
      mod_name: modName,
      price: AUTOMATIC_SOLUTION_PRICE,
      status: 'testing',
      created_by: user.id,
    }
    if (!record.name || !record.service_code || !record.service_name || !record.ecu) {
      throw new Error('Completa nombre, servicio y ECU')
    }

    const admin = automaticSolutionsAdmin()
    const { data, error } = await admin.from('ak_auto_solutions').insert(record).select('*').single()
    if (error) throw error
    await auditAutomaticSolution({ actorUserId: user.id, solutionId: id, action: 'solution_created', metadata: { oriSha256: ori.sha256, modSha256: mod.sha256 } })
    return NextResponse.json({ ok: true, solution: data })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo guardar la solución' }, { status: automaticSolutionErrorStatus(error) })
  }
}

