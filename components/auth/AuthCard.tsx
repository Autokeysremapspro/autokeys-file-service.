export default function AuthCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`w-full max-w-[570px] rounded-[18px] border border-white/[.11] bg-[rgba(7,8,10,.96)] px-6 py-9 shadow-[0_25px_80px_rgba(0,0,0,.55)] sm:px-10 sm:py-11 ${className}`}
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
      className={`flex h-[60px] w-full items-center justify-center gap-2 rounded-[7px] bg-[#ef1018] text-[18px] font-semibold text-white transition-[filter] duration-200 hover:brightness-[1.08] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100 ${props.className ?? ''}`}
    >
      {children}
    </button>
  )
}
