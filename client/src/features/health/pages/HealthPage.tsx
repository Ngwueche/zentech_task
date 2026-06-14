import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Activity, RefreshCw, CheckCircle2, XCircle, HelpCircle, Clock } from 'lucide-react'
import { fetchHealth } from '../api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { formatDateTime } from '@/lib/date'
import type { HealthStatus } from '../types'

function StatusIcon({ status }: { status: HealthStatus }) {
  if (status === 'Healthy') return <CheckCircle2 className="w-8 h-8 text-emerald-400" />
  if (status === 'Unhealthy') return <XCircle className="w-8 h-8 text-red-400" />
  return <HelpCircle className="w-8 h-8 text-amber-400" />
}

const statusConfig: Record<HealthStatus, {
  bg: string
  border: string
  glow: string
  text: string
  dot: string
  description: string
}> = {
  Healthy: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_40px_rgba(16,185,129,0.15)]',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    description: 'All systems operational. The API is responding normally.',
  },
  Unhealthy: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    glow: 'shadow-[0_0_40px_rgba(239,68,68,0.15)]',
    text: 'text-red-400',
    dot: 'bg-red-400',
    description: 'The API is experiencing issues or is unreachable.',
  },
  Unknown: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_40px_rgba(245,158,11,0.15)]',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    description: 'Health status could not be determined.',
  },
}

export function HealthPage() {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 30_000,
    staleTime: 15_000,
  })

  const status = data?.status ?? 'Unknown'
  const config = statusConfig[status]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">API Health</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor the health status of the Products API</p>
        </div>
        <Button
          variant="secondary"
          leftIcon={<RefreshCw className={['w-4 h-4', isFetching ? 'animate-spin' : ''].join(' ')} />}
          onClick={() => refetch()}
          loading={isFetching}
        >
          Refresh
        </Button>
      </div>

      {/* Main status card */}
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className={[
            config.bg,
            config.border,
            config.glow,
            'transition-all duration-500',
          ].join(' ')}
        >
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center text-center gap-4">
              {isLoading ? (
                <div className="w-16 h-16 rounded-full bg-bg-elevated animate-pulse" />
              ) : (
                <div
                  className={[
                    'w-20 h-20 rounded-full flex items-center justify-center',
                    config.bg,
                    'border-2',
                    config.border,
                  ].join(' ')}
                >
                  <StatusIcon status={status} />
                </div>
              )}

              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div
                    className={[
                      'w-2.5 h-2.5 rounded-full',
                      config.dot,
                      status === 'Healthy' ? 'animate-pulse' : '',
                    ].join(' ')}
                  />
                  <h2 className={['text-3xl font-bold', config.text].join(' ')}>
                    {isLoading ? '…' : status}
                  </h2>
                </div>
                <p className="text-slate-400 text-sm max-w-sm">{config.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Details grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center text-slate-500">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Service</div>
                <div className="text-sm font-semibold text-slate-200">Products Web API</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center text-slate-500">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Last Checked</div>
                <div className="text-sm font-semibold text-slate-200">
                  {data?.checkedAt ? formatDateTime(data.checkedAt.toISOString()) : '—'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-refresh note */}
      <p className="text-xs text-slate-600 text-center">
        Status auto-refreshes every 30 seconds · Click refresh to check immediately
      </p>
    </div>
  )
}
