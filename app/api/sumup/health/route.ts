import { NextResponse } from 'next/server'
import { getSumUpMerchantCode, getSumUpProfile } from '@/lib/sumup'

export const dynamic = 'force-dynamic'

export async function GET() {
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
