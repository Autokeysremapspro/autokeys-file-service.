import { NextResponse } from 'next/server'
import { getSumUpMerchantCode, getSumUpProfile } from '@/lib/sumup'
import { requireStaff } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Solo staff: esto hace una llamada real (autenticada con la clave privada
// de SumUp) contra su API y devuelve datos del comercio, así que no puede
// ser público ni dejar que cualquiera consuma la cuota de la clave a voluntad.
export async function GET() {
  try {
    await requireStaff()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const [profile, merchantCode] = await Promise.all([
      getSumUpProfile(),
      getSumUpMerchantCode(),
    ])

    return NextResponse.json({
      ok: true,
      environment: process.env.SUMUP_SANDBOX_API_KEY && !process.env.SUMUP_API_KEY ? 'sandbox' : 'configured',
      merchantCode,
      businessName: profile?.merchant_profile?.business_name || profile?.merchant_profile?.business_name || profile?.first_name || 'AKCloud',
    })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'No se pudo conectar con SumUp' }, { status: 500 })
  }
}
