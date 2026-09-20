import { NextResponse } from 'next/server'
import {
  automaticSolutionsAdmin,
  automaticSolutionErrorStatus,
  requireAutomaticSolutionsStaff,
} from '@/lib/automatic-solutions/server'

export const runtime = 'nodejs'

function missingSchema(error: { code?: string; message?: string } | null) {
  return error?.code === '42P01' || Boolean(error?.message?.includes('schema cache'))
}

export async function GET() {
  try {
    await requireAutomaticSolutionsStaff()
    const admin = automaticSolutionsAdmin()
    const [solutionsResult, testsResult, scansResult, auditResult] = await Promise.all([
      admin
        .from('ak_auto_solutions')
        .select('id,name,service_code,service_name,ecu,hw,sw,vehicle_notes,ori_size,mod_size,status,verification_suite,verified_at,published_at,created_at,updated_at')
        .order('updated_at', { ascending: false })
        .limit(250),
      admin
        .from('ak_auto_solution_tests')
        .select('id,solution_id,test_type,status,notes,created_at')
        .order('created_at', { ascending: false })
        .limit(250),
      admin
        .from('ak_auto_solution_scans')
        .select('id,ori_name,status,match_count,created_at,analyzed_at')
        .order('created_at', { ascending: false })
        .limit(100),
      admin
        .from('ak_auto_solution_audit')
        .select('id,solution_id,action,metadata,created_at')
        .order('created_at', { ascending: false })
        .limit(100),
    ])

    const results = [solutionsResult, testsResult, scansResult, auditResult]
    const schemaError = results.find((result) => missingSchema(result.error))?.error
    if (schemaError) {
      return NextResponse.json({
        ok: true,
        schemaReady: false,
        mode: 'laboratory',
        customerAccess: false,
        paymentsEnabled: false,
        pricePerFile: 44.9,
        solutions: [],
        tests: [],
        scans: [],
        audit: [],
      })
    }

    const error = results.find((result) => result.error)?.error
    if (error) throw error

    return NextResponse.json({
      ok: true,
      schemaReady: true,
      mode: process.env.AK_AUTO_SOLUTIONS_ENABLED === 'true' ? 'customer' : 'laboratory',
      customerAccess: process.env.AK_AUTO_SOLUTIONS_ENABLED === 'true',
      paymentsEnabled: false,
      pricePerFile: 44.9,
      solutions: solutionsResult.data || [],
      tests: testsResult.data || [],
      scans: scansResult.data || [],
      audit: auditResult.data || [],
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No se pudo cargar el motor automático' },
      { status: automaticSolutionErrorStatus(error) },
    )
  }
}
