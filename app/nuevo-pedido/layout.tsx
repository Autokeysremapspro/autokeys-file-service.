import type { ReactNode } from 'react'
import AKOrderTechnicalMetadata from '@/components/ak/AKOrderTechnicalMetadata'
import AKPaymentProviderSelector from '@/components/ak/AKPaymentProviderSelector'

export default function NuevoPedidoLayout({ children }: { children: ReactNode }) {
  return <><AKOrderTechnicalMetadata /><AKPaymentProviderSelector />{children}</>
}
