import './theme-fix.css'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="ak-dashboard-theme-scope">{children}</div>
}
