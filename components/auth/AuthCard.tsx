export default function AuthCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`ak10-auth-card px-6 py-8 sm:px-10 sm:py-10 ${className}`}
    >
      {children}
    </div>
  )
}

export function AuthButton({ children, loading, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`auth-primary flex h-[54px] w-full items-center justify-center gap-2 text-[16px] font-semibold text-white transition-[filter] duration-200 hover:brightness-[1.08] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100 ${props.className ?? ''}`}
    >
      {children}
    </button>
  )
}
