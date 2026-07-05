import type { ReactNode } from 'react'

export default function AKCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.025))] shadow-[0_24px_80px_rgba(0,0,0,.45)] backdrop-blur-xl ${className}`}>{children}</div>
}
