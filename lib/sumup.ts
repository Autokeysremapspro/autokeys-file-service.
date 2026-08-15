const SUMUP_BASE_URL = 'https://api.sumup.com'

function getSumUpApiKey() {
  const key = process.env.SUMUP_API_KEY || process.env.SUMUP_SANDBOX_API_KEY
  if (!key) throw new Error('Falta SUMUP_API_KEY o SUMUP_SANDBOX_API_KEY en Vercel')
  return key
}

async function sumupFetch(path: string, init: RequestInit = {}) {
  const response = await fetch(`${SUMUP_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getSumUpApiKey()}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  })

  const text = await response.text()
  let payload: any = null
  try { payload = text ? JSON.parse(text) : null } catch { payload = { raw: text } }

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error_message || payload?.error || `Error SumUp (${response.status})`)
  }

  return payload
}

export async function getSumUpProfile() {
  return sumupFetch('/v0.1/me', { method: 'GET' })
}

export async function getSumUpMerchantCode() {
  const explicit = process.env.SUMUP_MERCHANT_CODE
  if (explicit) return explicit

  const profile = await getSumUpProfile()
  const merchantCode = profile?.merchant_profile?.merchant_code || profile?.merchant_code
  if (!merchantCode) throw new Error('SumUp no devolvió merchant_code para esta API key')
  return merchantCode as string
}

export async function createSumUpHostedCheckout(input: {
  checkoutReference: string
  amount: number
  description: string
  returnUrl: string
  redirectUrl: string
}) {
  const merchantCode = await getSumUpMerchantCode()
  return sumupFetch('/v0.1/checkouts', {
    method: 'POST',
    body: JSON.stringify({
      checkout_reference: input.checkoutReference,
      amount: Number(input.amount.toFixed(2)),
      currency: 'EUR',
      merchant_code: merchantCode,
      description: input.description.slice(0, 255),
      return_url: input.returnUrl,
      redirect_url: input.redirectUrl,
      hosted_checkout: { enabled: true },
    }),
  })
}

export async function getSumUpCheckout(checkoutId: string) {
  return sumupFetch(`/v0.1/checkouts/${encodeURIComponent(checkoutId)}`, { method: 'GET' })
}

export function isSumUpCheckoutPaid(checkout: any) {
  if (checkout?.status !== 'PAID') return false
  const transactions = Array.isArray(checkout?.transactions) ? checkout.transactions : []
  if (transactions.length === 0) return true
  return transactions.some((tx: any) => tx?.status === 'SUCCESSFUL')
}
