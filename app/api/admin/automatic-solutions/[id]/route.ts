import { NextResponse } from 'next/server'
import {
  auditAutomaticSolution,
  automaticSolutionsAdmin,
  automaticSolutionErrorStatus,
  hashStoredFile,
  requireAutomaticSolutionsStaff,
} from '@/lib/automatic-solutions/server'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAutomaticSolutionsStaff()
    const admin = automaticSolutionsAdmin()
    const [{ data: solution, error }, { data: tests }] = await Promise.all([
      admin.from('ak_auto_solutions').select('*').eq('id', params.id).single(),
      admin.from('ak_auto_solution_tests').select('*').eq('solution_id', params.id).order('created_at'),
    ])
    if (error) throw error
    return NextResponse.json({ ok: true, solution, tests: tests || [] })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo cargar la solución' }, { status: automaticSolutionErrorStatus(error) })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireAutomaticSolutionsStaff()
    const body = await request.json()
    const action = String(body?.action || '')
    const admin = automaticSolutionsAdmin()
    const { data: solution, error } = await admin.from('ak_auto_solutions').select('*').eq('id', params.id).single()
    if (error || !solution) throw error || new Error('Solución no encontrada')

    if (action === 'run_verification') {
      const [ori, mod] = await Promise.all([hashStoredFile(solution.ori_path), hashStoredFile(solution.mod_path)])
      const checks = [
        { test_type: 'ori_integrity', expected_value: solution.ori_sha256, actual_value: ori.sha256, status: ori.sha256 === solution.ori_sha256 && ori.size === Number(solution.ori_size) ? 'passed' : 'failed' },
        { test_type: 'mod_integrity', expected_value: solution.mod_sha256, actual_value: mod.sha256, status: mod.sha256 === solution.mod_sha256 && mod.size === Number(solution.mod_size) ? 'passed' : 'failed' },
        { test_type: 'exact_matching', expected_value: `${solution.ori_sha256}:${solution.ori_size}`, actual_value: `${ori.sha256}:${ori.size}`, status: ori.sha256 === solution.ori_sha256 && ori.size === Number(solution.ori_size) ? 'passed' : 'failed' },
      ]
      const rows = checks.map((check) => ({ ...check, solution_id: solution.id, tested_by: user.id }))
      const { error: testError } = await admin.from('ak_auto_solution_tests').upsert(rows, { onConflict: 'solution_id,test_type' })
      if (testError) throw testError
      const passed = checks.every((check) => check.status === 'passed')
      const suite = { integrityPassed: passed, technicalApproved: false, tests: checks.length, checkedAt: new Date().toISOString() }
      const { error: updateError } = await admin.from('ak_auto_solutions').update({ verification_suite: suite, status: 'testing', verified_by: null, verified_at: null, updated_at: new Date().toISOString() }).eq('id', solution.id)
      if (updateError) throw updateError
      await auditAutomaticSolution({ actorUserId: user.id, solutionId: solution.id, action: passed ? 'integrity_suite_passed' : 'integrity_suite_failed' })
      return NextResponse.json({ ok: true, passed, checks })
    }

    if (action === 'approve_technical') {
      const notes = String(body?.notes || '').trim().slice(0, 1000)
      if (body?.confirmation !== 'CONFIRMO_PRUEBA_TECNICA' || notes.length < 10) {
        throw new Error('Confirma la prueba técnica e indica cómo se verificó el MOD')
      }
      if (solution.status !== 'testing' || solution.verification_suite?.integrityPassed !== true) {
        throw new Error('Primero debe superar las tres pruebas de integridad')
      }
      const now = new Date().toISOString()
      const suite = { ...solution.verification_suite, technicalApproved: true, technicalApprovedAt: now, technicalNotes: notes }
      const { error: updateError } = await admin.from('ak_auto_solutions').update({ verification_suite: suite, status: 'verified', verified_by: user.id, verified_at: now, updated_at: now }).eq('id', solution.id)
      if (updateError) throw updateError
      await auditAutomaticSolution({ actorUserId: user.id, solutionId: solution.id, action: 'technical_verification_approved', metadata: { notes } })
      return NextResponse.json({ ok: true })
    }

    if (action === 'publish') {
      if (solution.status !== 'verified' || solution.verification_suite?.integrityPassed !== true || solution.verification_suite?.technicalApproved !== true) throw new Error('La solución debe superar la integridad y la prueba técnica antes de publicarse')
      const { error: updateError } = await admin.from('ak_auto_solutions').update({ status: 'published', published_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', solution.id)
      if (updateError) throw updateError
      await auditAutomaticSolution({ actorUserId: user.id, solutionId: solution.id, action: 'solution_published' })
      return NextResponse.json({ ok: true })
    }

    if (action === 'retire') {
      const { error: updateError } = await admin.from('ak_auto_solutions').update({ status: 'retired', updated_at: new Date().toISOString() }).eq('id', solution.id)
      if (updateError) throw updateError
      await auditAutomaticSolution({ actorUserId: user.id, solutionId: solution.id, action: 'solution_retired' })
      return NextResponse.json({ ok: true })
    }

    throw new Error('Acción no válida')
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo actualizar la solución' }, { status: automaticSolutionErrorStatus(error) })
  }
}
