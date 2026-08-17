import './theme-fix.css'

export default function PedidosLayout({ children }: { children: React.ReactNode }) {
  return <div className="ak-orders-theme-scope">{children}</div>
}
