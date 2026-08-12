import type { ReactNode } from 'react'
import AKOrderTechnicalMetadata from '@/components/ak/AKOrderTechnicalMetadata'

export default function NuevoPedidoLayout({ children }: { children: ReactNode }) {
  return <><AKOrderTechnicalMetadata />{children}</>
}
