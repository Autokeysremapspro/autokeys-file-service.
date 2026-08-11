'use client'

import AKPageShell from '@/components/ak/AKPageShell'
import LaboratoryStatusBanner from '@/components/LaboratoryStatusBanner'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AKPageShell>
      <LaboratoryStatusBanner />
      {children}
    </AKPageShell>
  )
}
