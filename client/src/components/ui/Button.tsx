import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg' | 'icon'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: [
    'bg-brand-600 hover:bg-brand-500 text-white',
    'shadow-glow-sm hover:shadow-glow-md',
    'border border-brand-500/50',
    'disabled:bg-brand-900 disabled:border-brand-900 disabled:text-brand-700',
  ].join(' '),
  secondary: [
    'bg-bg-elevated hover:bg-bg-overlay text-slate-200',
    'border border-border-default hover:border-border-strong',
  ].join(' '),
  outline: [
    'bg-transparent hover:bg-bg-elevated text-slate-300 hover:text-slate-100',
    'border border-border-default hover:border-border-strong',
  ].join(' '),
  ghost: [
    'bg-transparent hover:bg-bg-elevated text-slate-400 hover:text-slate-100',
    'border border-transparent',
  ].join(' '),
  danger: [
    'bg-red-600/90 hover:bg-red-500 text-white',
    'border border-red-500/50',
    'disabled:bg-red-900 disabled:text-red-700',
  ].join(' '),
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-sm gap-2',
  icon: 'h-9 w-9 p-0',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    children,
    className,
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium',
        'transition-all duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon
      )}
      {children && <span>{children}</span>}
      {!loading && rightIcon}
    </button>
  )
})
