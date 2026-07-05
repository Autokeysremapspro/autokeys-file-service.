import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'soft'
  className?: string
}

const base = 'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition active:scale-[0.98] disabled:opacity-50'
const variants = {
  primary: 'bg-[var(--ak-red)] text-white shadow-[0_0_40px_rgba(217,4,41,.25)] hover:bg-[var(--ak-glow)]',
  ghost: 'border border-white/10 bg-white/[0.03] text-white hover:border-[var(--ak-red)]/50 hover:bg-white/[0.06]',
  soft: 'border border-[var(--ak-red)]/25 bg-[var(--ak-red)]/10 text-[var(--ak-glow)] hover:bg-[var(--ak-red)]/15',
}

export default function AKButton({ href, children, variant = 'primary', className = '', ...props }: Props) {
  const cls = `${base} ${variants[variant]} ${className}`
  if (href) return <Link href={href} className={cls}>{children}</Link>
  return <button className={cls} {...props}>{children}</button>
}
