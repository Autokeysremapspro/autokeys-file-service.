import type { Metadata } from 'next'
import './theme-fix.css'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function PedidosLayout({ children }: { children: React.ReactNode }) {
  return <div className="ak-orders-theme-scope">{children}</div>
}
