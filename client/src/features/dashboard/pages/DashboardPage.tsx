import { useMemo, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Package,
  Layers,
  AlertTriangle,
  Palette,
  Plus,
  ArrowRight,
  Activity,
  BarChart3,
} from 'lucide-react'
import { fetchDashboardStats } from '../api'
import { fetchAllProducts } from '@/features/products/api'
import { fetchHealth } from '@/features/health/api'
import { ColourBadge } from '@/features/products/components/ColourBadge'
import { MetricCardSkeleton } from '@/components/feedback/LoadingSkeleton'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/formatters'
import { formatRelative } from '@/lib/date'

type MetricCardProps = {
  icon: ReactNode
  label: string
  value: string | number
  sub?: string
  accent?: string
  delay?: number
}

function MetricCard({ icon, label, value, sub, accent = 'bg-brand-600', delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="metric-card relative overflow-hidden">
        <div className={['absolute inset-0 opacity-5 rounded-xl', accent].join(' ')} />
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div
              className={[
                'w-10 h-10 rounded-xl flex items-center justify-center text-white',
                accent,
              ].join(' ')}
            >
              {icon}
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-100 mb-1">{value}</div>
          <div className="text-sm font-medium text-slate-400">{label}</div>
          {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
        </div>
      </div>
    </motion.div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()

  const { data: dashStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 30_000,
  })

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => fetchAllProducts(),
  })

  const { data: health } = useQuery({
    queryKey: ['health-topbar'],
    queryFn: fetchHealth,
    staleTime: 30_000,
  })

  const derived = useMemo(() => {
    if (!products) return null
    const distinctColours = new Set(products.map((p) => p.colour.toLowerCase())).size
    const colourDist = products.reduce<Record<string, number>>((acc, p) => {
      acc[p.colour] = (acc[p.colour] ?? 0) + 1
      return acc
    }, {})
    const recentProducts = [...products]
      .sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime())
      .slice(0, 5)
    return { distinctColours, colourDist, recentProducts }
  }, [products])

  const cardsLoading = statsLoading

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Overview of your product catalogue and system status
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/products/create')}
        >
          Add Product
        </Button>
      </div>

      {/* Metric cards — sourced from GET /api/dashboard */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cardsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard
              icon={<Package className="w-5 h-5" />}
              label="Total Products"
              value={dashStats?.totalItems ?? 0}
              sub="In catalogue"
              accent="bg-brand-600"
              delay={0}
            />
            <MetricCard
              icon={<Layers className="w-5 h-5" />}
              label="Total Stock"
              value={dashStats?.totalQuantity ?? 0}
              sub="Units across all products"
              accent="bg-purple-600"
              delay={0.05}
            />
            <MetricCard
              icon={<AlertTriangle className="w-5 h-5" />}
              label="Low Stock Items"
              value={dashStats?.lowStockItems ?? 0}
              sub="Products running low"
              accent="bg-amber-600"
              delay={0.1}
            />
            <MetricCard
              icon={<Palette className="w-5 h-5" />}
              label="Distinct Colours"
              value={derived?.distinctColours ?? 0}
              sub="Unique colour variants"
              accent="bg-cyan-600"
              delay={0.15}
            />
          </>
        )}
      </div>

      {/* Status + charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* API health */}
        <Card>
          <CardHeader
            title="API Status"
            action={
              <button
                onClick={() => navigate('/health')}
                className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                Details <ArrowRight className="w-3 h-3" />
              </button>
            }
          />
          <CardContent>
            <div className="flex flex-col items-center py-4 gap-3">
              <div
                className={[
                  'w-16 h-16 rounded-full flex items-center justify-center',
                  health?.status === 'Healthy'
                    ? 'bg-emerald-500/10 border-2 border-emerald-500/30'
                    : health?.status === 'Unhealthy'
                      ? 'bg-red-500/10 border-2 border-red-500/30'
                      : 'bg-amber-500/10 border-2 border-amber-500/30',
                ].join(' ')}
              >
                <Activity
                  className={[
                    'w-7 h-7',
                    health?.status === 'Healthy'
                      ? 'text-emerald-400'
                      : health?.status === 'Unhealthy'
                        ? 'text-red-400'
                        : 'text-amber-400',
                  ].join(' ')}
                />
              </div>
              <div className="text-center">
                <div
                  className={[
                    'text-xl font-bold',
                    health?.status === 'Healthy'
                      ? 'text-emerald-400'
                      : health?.status === 'Unhealthy'
                        ? 'text-red-400'
                        : 'text-amber-400',
                  ].join(' ')}
                >
                  {health?.status ?? 'Unknown'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Products Web API</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Colour distribution */}
        <Card>
          <CardHeader title="Colour Distribution" />
          <CardContent>
            {productsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-7 rounded-lg bg-bg-elevated animate-pulse" />
                ))}
              </div>
            ) : !derived?.colourDist || Object.keys(derived.colourDist).length === 0 ? (
              <div className="text-center py-6 text-slate-600 text-sm">No data</div>
            ) : (
              <div className="space-y-2.5">
                {Object.entries(derived.colourDist)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 6)
                  .map(([colour, count]) => {
                    const pct = products?.length
                      ? Math.round((count / products.length) * 100)
                      : 0
                    return (
                      <div key={colour}>
                        <div className="flex items-center justify-between mb-1">
                          <ColourBadge colour={colour} />
                          <span className="text-xs text-slate-400">
                            {count} · {pct}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="h-full rounded-full bg-gradient-brand"
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock status */}
        <Card>
          <CardHeader title="Stock Status" />
          <CardContent>
            {statsLoading || productsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-lg bg-bg-elevated animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  {
                    label: 'In Stock',
                    count: (products ?? []).filter((p) => p.stockQuantity >= 5).length,
                    variant: 'success' as const,
                  },
                  {
                    label: 'Low Stock',
                    count: dashStats?.lowStockItems ?? 0,
                    variant: 'warning' as const,
                  },
                  {
                    label: 'Out of Stock',
                    count: (products ?? []).filter((p) => p.stockQuantity === 0).length,
                    variant: 'danger' as const,
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
                      <span className="text-sm text-slate-400">{item.label}</span>
                    </div>
                    <Badge variant={item.variant}>{item.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent products */}
      <Card>
        <CardHeader
          title="Recent Products"
          description="Latest additions to the catalogue"
          action={
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/products')}
            >
              View all
            </Button>
          }
        />
        <CardContent>
          {productsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-bg-elevated animate-pulse" />
              ))}
            </div>
          ) : !derived?.recentProducts?.length ? (
            <div className="text-center py-8 text-slate-600 text-sm">
              No products yet.{' '}
              <button
                onClick={() => navigate('/products/create')}
                className="text-brand-400 hover:text-brand-300"
              >
                Add your first
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border-subtle -mx-6">
              {derived.recentProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-bg-elevated/50 transition-colors cursor-pointer group"
                  onClick={() => product.id && navigate(`/products/${product.id}`)}
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                      {product.name}
                    </div>
                    <div className="text-xs text-slate-500">{formatRelative(product.createdAtUtc)}</div>
                  </div>
                  <ColourBadge colour={product.colour} />
                  <div className="text-sm font-mono text-slate-300 shrink-0">
                    {formatCurrency(product.price)}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-400 transition-colors shrink-0" />
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
