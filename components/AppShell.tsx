'use client'

import AKPageShell from '@/components/ak/AKPageShell'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return <AKPageShell>{children}</AKPageShell>
}
