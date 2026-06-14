import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Menu, LogOut, User, RefreshCw, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { authStore } from '@/features/auth/authStore'
import { fetchHealth } from '@/features/health/api'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type TopBarProps = {
  onMenuClick: () => void
}

function HealthIndicator() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['health-topbar'],
    queryFn: fetchHealth,
    refetchInterval: 60_000,
    staleTime: 30_000,
  })

  const status = data?.status ?? 'Unknown'

  const dotClass =
    status === 'Healthy'
      ? 'status-dot-healthy'
      : status === 'Unhealthy'
        ? 'status-dot-unhealthy'
        : 'status-dot-unknown'

  const labelClass =
    status === 'Healthy'
      ? 'text-emerald-400'
      : status === 'Unhealthy'
        ? 'text-red-400'
        : 'text-amber-400'

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <div className="w-2 h-2 rounded-full bg-slate-600 animate-pulse" />
        <span>Checking…</span>
      </div>
    )
  }

  return (
    <button
      onClick={() => refetch()}
      className="flex items-center gap-2 text-xs hover:opacity-80 transition-opacity group"
      title="Refresh health status"
    >
      <div className={cn('status-dot', dotClass)} />
      <span className={labelClass}>{status}</span>
      <RefreshCw
        className={cn(
          'w-3 h-3 text-slate-500 group-hover:text-slate-300',
          isFetching && 'animate-spin',
        )}
      />
    </button>
  )
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    authStore.logout()
    toast.success('Signed out successfully')
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-bg-secondary border-b border-border-subtle shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 font-mono">
          <span className="text-slate-700">API</span>
          <span className="text-border-default">·</span>
          <HealthIndicator />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Health on mobile */}
        <div className="flex sm:hidden items-center">
          <HealthIndicator />
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((p) => !p)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-bg-elevated transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-300">Admin</span>
            <ChevronDown
              className={cn(
                'hidden sm:block w-3.5 h-3.5 text-slate-500 transition-transform',
                userMenuOpen && 'rotate-180',
              )}
            />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 glass-card-elevated py-1 z-40"
                >
                  <div className="px-3 py-2 border-b border-border-subtle mb-1">
                    <div className="text-sm font-medium text-slate-200">Admin</div>
                    <div className="text-xs text-slate-500">Administrator</div>
                  </div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      handleLogout()
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
