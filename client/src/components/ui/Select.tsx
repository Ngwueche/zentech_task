import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type SelectOption = {
  value: string
  label: string
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, options, placeholder, className, id, ...props },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-10 pl-3 pr-9 rounded-lg bg-bg-card border text-slate-100 text-sm',
            'appearance-none cursor-pointer',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500',
            error
              ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/30'
              : 'border-border-subtle hover:border-border-default',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" className="bg-bg-card text-slate-400">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-bg-card">
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
      </div>

      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}

      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
    </div>
  )
})
