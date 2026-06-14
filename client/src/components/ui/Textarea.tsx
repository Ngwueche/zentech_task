import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, id, ...props },
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

      <textarea
        ref={ref}
        id={inputId}
        className={cn(
          'w-full min-h-[100px] px-3 py-2.5 rounded-lg bg-bg-card border text-slate-100 text-sm',
          'placeholder:text-slate-600 resize-y',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500',
          error
            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/30'
            : 'border-border-subtle hover:border-border-default',
          className,
        )}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />

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
