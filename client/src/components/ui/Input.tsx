import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightElement?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftIcon, rightElement, className, id, ...props },
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

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-slate-500 pointer-events-none">{leftIcon}</span>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-10 rounded-lg bg-bg-card border text-slate-100 text-sm',
            'placeholder:text-slate-600',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500',
            leftIcon ? 'pl-9' : 'pl-3',
            rightElement ? 'pr-10' : 'pr-3',
            error
              ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/30'
              : 'border-border-subtle hover:border-border-default',
            className,
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />

        {rightElement && (
          <span className="absolute right-3 flex items-center">{rightElement}</span>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-red-400 flex items-center gap-1">
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
