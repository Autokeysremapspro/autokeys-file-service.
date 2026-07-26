import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'soft' | 'dark'
  className?: string
}

const base = 'group relative inline-flex min-h-[46px] items-center justify-center gap-2 overflow-hidden rounded-[14px] px-5 py-3 text-sm font-bold tracking-[-.01em] transition duration-200 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45'
const variants = {
  primary: 'border border-[#ffb870]/30 bg-[linear-gradient(135deg,#8a4a1f,#e2954d)] text-[#0a0d12] shadow-[0_14px_42px_rgba(226,149,77,.22),inset_0_1px_0_rgba(255,255,255,.28)] hover:-translate-y-0.5 hover:shadow-[0_20px_58px_rgba(226,149,77,.32),inset_0_1px_0_rgba(255,255,255,.3)]',
  ghost: 'border border-white/[.09] bg-white/[.035] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.035)] hover:-translate-y-0.5 hover:border-white/[.17] hover:bg-white/[.065]',
  soft: 'border border-[#e2954d]/25 bg-[#e2954d]/[.08] text-[#ffb870] hover:-translate-y-0.5 hover:border-[#e2954d]/40 hover:bg-[#e2954d]/[.13]',
  dark: 'border border-white/[.08] bg-black/25 text-white/70 hover:-translate-y-0.5 hover:border-white/[.15] hover:bg-white/[.05] hover:text-white',
}

export default function AKButton({ href, children, variant = 'primary', className = '', ...props }: Props) {
  const cls = `${base} ${variants[variant]} ${className}`
  const content = <><span className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/[.16] to-transparent transition-transform duration-700 group-hover:translate-x-[120%]" /><span className="relative inline-flex items-center justify-center gap-2">{children}</span></>
  if (href) return <Link href={href} className={cls}>{content}</Link>
  return <button className={cls} {...props}>{content}</button>
}
