import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
  dot?: boolean
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-700/60 text-slate-300 border-slate-600/40',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  danger: 'bg-red-500/15 text-red-400 border-red-500/20',
  info: 'bg-brand-500/15 text-brand-400 border-brand-500/20',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
}

const dotClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-red-400',
  info: 'bg-brand-400',
  purple: 'bg-purple-400',
}

export function Badge({ variant = 'default', dot = false, children, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotClasses[variant])} />}
      {children}
    </span>
  )
}
