import { cn } from '@/lib/utils'

type SkeletonProps = {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-gradient-to-r from-bg-elevated via-bg-overlay to-bg-elevated shimmer',
        className,
      )}
    />
  )
}

export function ProductTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border-subtle">
          <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="glass-card p-6 space-y-3">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="grid grid-cols-2 gap-4 pt-2">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
      </div>
      <div className="glass-card p-6 space-y-3">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  )
}
