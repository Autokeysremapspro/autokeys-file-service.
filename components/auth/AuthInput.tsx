import { forwardRef } from 'react'
import type { LucideIcon } from 'lucide-react'

type BaseProps = {
  icon: LucideIcon
  label: string
  error?: string
  rightSlot?: React.ReactNode
}

type InputProps = BaseProps &
  React.InputHTMLAttributes<HTMLInputElement> & { as?: 'input' }

type TextareaProps = BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { as: 'textarea' }

const fieldClasses =
  'w-full rounded-lg border bg-[#0e1013] pl-11 pr-4 text-[15px] text-white placeholder:text-[#85868c] outline-none transition-colors duration-200 focus:border-[rgba(239,16,24,.75)] focus:shadow-[0_0_0_2px_rgba(239,16,24,.10)]'

export const AuthInput = forwardRef<HTMLInputElement, InputProps>(function AuthInput(
  { icon: Icon, label, error, rightSlot, className, ...props },
  ref
) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/85">{label}</span>
      <div className="relative">
        <Icon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#85868c]" />
        <input
          ref={ref}
          className={`${fieldClasses} h-[55px] ${error ? 'border-[#ef1018]/60' : 'border-white/[.13]'} ${rightSlot ? 'pr-12' : ''} ${className ?? ''}`}
          {...props}
        />
        {rightSlot && <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
      {error && <p className="mt-1.5 text-xs text-[#ff4d4d]">{error}</p>}
    </label>
  )
})

export function AuthTextarea({ icon: Icon, label, error, className, ...props }: BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/85">{label}</span>
      <div className="relative">
        <Icon size={18} className="pointer-events-none absolute left-4 top-3.5 text-[#85868c]" />
        <textarea
          className={`${fieldClasses} min-h-[80px] resize-y py-3 ${error ? 'border-[#ef1018]/60' : 'border-white/[.13]'} ${className ?? ''}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-[#ff4d4d]">{error}</p>}
    </label>
  )
}
