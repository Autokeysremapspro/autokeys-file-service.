import type { Metadata } from 'next'
import './theme-fix.css'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="ak-dashboard-theme-scope">{children}</div>
}
