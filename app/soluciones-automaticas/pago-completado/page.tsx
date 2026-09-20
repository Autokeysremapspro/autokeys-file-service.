import { redirect } from 'next/navigation'
import PaymentCompleteClient from './PaymentCompleteClient'
import { automaticSolutionsEnabled } from '@/lib/automatic-solutions/server'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false } }

export default function PaymentCompletePage({ searchParams }: { searchParams: { order?: string } }) {
  if (!automaticSolutionsEnabled()) redirect('/dashboard')
  return <PaymentCompleteClient orderId={String(searchParams.order || '')} />
}

