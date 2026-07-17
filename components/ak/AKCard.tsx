import type { ReactNode } from 'react'

export default function AKCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`ak-glass overflow-hidden rounded-[24px] ${className}`}>
      {children}
    </div>
  )
}
