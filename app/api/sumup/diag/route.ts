import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Diagnostic v7: validates only presence/length; never exposes secret values.
export async function GET() {
  const apiKey = process.env.AK_SUMUP_LIVE_API_KEY || ''
  const merchantCode = process.env.AK_SUMUP_LIVE_MERCHANT_CODE || ''
  const sandboxKey = process.env.SUMUP_SANDBOX_API_KEY || ''
  const sandboxMerchant = process.env.SUMUP_SANDBOX_MERCHANT_CODE || ''

  return NextResponse.json({
    vercelEnv: process.env.VERCEL_ENV || null,
    nodeEnv: process.env.NODE_ENV || null,
    hasApiKey: Boolean(apiKey),
    apiKeyLength: apiKey.length,
    hasMerchantCode: Boolean(merchantCode),
    merchantCodeLength: merchantCode.length,
    hasSandboxKey: Boolean(sandboxKey),
    sandboxKeyLength: sandboxKey.length,
    hasSandboxMerchant: Boolean(sandboxMerchant),
    sandboxMerchantLength: sandboxMerchant.length,
    diagnosticVersion: 7,
  })
}
