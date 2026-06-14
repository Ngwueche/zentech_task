import { type ReactNode } from 'react'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="w-14 h-14 rounded-2xl bg-bg-elevated border border-border-subtle flex items-center justify-center mb-4 text-slate-500">
        {icon ?? <Package className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-300 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
