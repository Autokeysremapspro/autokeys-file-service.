import { NextResponse } from 'next/server'
import { automaticSolutionsAdmin, automaticSolutionErrorStatus, requireAutomaticSolutionsUser } from '@/lib/automatic-solutions/server'

export async function GET() {
  try {
    const user = await requireAutomaticSolutionsUser()
    const { data, error } = await automaticSolutionsAdmin()
      .from('ak_auto_solution_orders')
      .select('id,amount,currency,payment_provider,status,paid_at,delivered_at,download_count,solution_snapshot,created_at')
      .eq('user_id', user.id)
      .in('status', ['paid', 'delivered'])
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return NextResponse.json({ ok: true, orders: data || [] })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudieron cargar las compras' }, { status: automaticSolutionErrorStatus(error) })
  }
}

