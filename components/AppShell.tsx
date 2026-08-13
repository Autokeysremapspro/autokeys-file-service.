'use client'

import AKPageShell from '@/components/ak/AKPageShell'
import AKSessionIntro from '@/components/ak/AKSessionIntro'
import LaboratoryStatusBanner from '@/components/LaboratoryStatusBanner'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AKSessionIntro />
      <AKPageShell>
        <LaboratoryStatusBanner />
        {children}
      </AKPageShell>
    </>
  )
}
