import type { ReactNode } from 'react'

export default function AKCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`ak-glass rounded-[2rem] ${className}`}>
      {children}
    </div>
  )
}
