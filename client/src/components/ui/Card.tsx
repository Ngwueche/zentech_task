import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'metric'
  topAccent?: boolean
}

export function Card({ children, variant = 'default', topAccent = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border relative',
        variant === 'default' && 'bg-bg-card border-border-subtle shadow-card',
        variant === 'elevated' && 'bg-bg-elevated border-border-default shadow-elevated',
        variant === 'metric' && 'bg-bg-card border-border-subtle shadow-card overflow-hidden',
        className,
      )}
      {...props}
    >
      {topAccent && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
      )}
      {children}
    </div>
  )
}

type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  title: string
  description?: string
  action?: ReactNode
}

export function CardHeader({ title, description, action, className, ...props }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between p-6 pb-4', className)} {...props}>
      <div>
        <h3 className="text-base font-semibold text-slate-100">{title}</h3>
        {description && <p className="text-sm text-slate-400 mt-0.5">{description}</p>}
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  )
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 pb-6', className)} {...props}>
      {children}
    </div>
  )
}
