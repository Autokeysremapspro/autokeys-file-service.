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
      <style jsx global>{`
        html[data-ak-theme='light'] .ak5-shell [class*='bg-[#080b11]'] {
          background: rgba(255,255,255,.92) !important;
          border-color: rgba(15,23,42,.10) !important;
          box-shadow: 0 10px 28px rgba(15,23,42,.07) !important;
        }
        html[data-ak-theme='light'] .ak5-shell [class*='text-emerald-200'] {
          color: #047857 !important;
        }
        html[data-ak-theme='light'] .ak5-shell [class*='text-amber-200'] {
          color: #b45309 !important;
        }
        html[data-ak-theme='light'] .ak5-shell [class*='bg-[#0b1018]'] {
          background: #fff !important;
          color: #152033 !important;
          box-shadow: inset 0 0 0 1px rgba(15,23,42,.08);
        }
      `}</style>
    </>
  )
}
