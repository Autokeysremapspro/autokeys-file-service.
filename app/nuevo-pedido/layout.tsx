import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import AKOrderTechnicalMetadata from '@/components/ak/AKOrderTechnicalMetadata'
import AKPaymentProviderSelector from '@/components/ak/AKPaymentProviderSelector'
import './theme-fix.css'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function NuevoPedidoLayout({ children }: { children: ReactNode }) {
  return <><AKOrderTechnicalMetadata /><AKPaymentProviderSelector /><div className="ak-new-order-theme-scope">{children}</div></>
}
