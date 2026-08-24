import type { Metadata } from 'next'
import './theme-fix.css'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  return <div className="ak-profile-theme-scope">{children}</div>
}
