import { NextResponse } from 'next/server'
import { createPayPalOrder, getSupabaseAuthClient } from '@/lib/paypal'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '').trim()
    if (!token) return NextResponse.json({ error: 'Sesión no válida' }, { status: 401 })

    const supabase = getSupabaseAuthClient()
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) return NextResponse.json({ error: 'Sesión no válida' }, { status: 401 })

    const body = await request.json()
    const packKey = String(body?.packKey || '')
    const order = await createPayPalOrder({ packKey, userId: data.user.id, userEmail: data.user.email })

    return NextResponse.json(order)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'No se pudo crear el pago PayPal' }, { status: 500 })
  }
}
