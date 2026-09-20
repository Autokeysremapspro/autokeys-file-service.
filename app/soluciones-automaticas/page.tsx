import { redirect } from 'next/navigation'
import AutomaticSolutionsClient from './AutomaticSolutionsClient'
import { automaticSolutionsEnabled } from '@/lib/automatic-solutions/server'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false } }

export default function AutomaticSolutionsPage() {
  if (!automaticSolutionsEnabled()) redirect('/dashboard')
  return <AutomaticSolutionsClient />
}

