import { type ComponentType } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  Activity,
  Zap,
  X,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  exact?: boolean
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/products', label: 'Products', icon: Package, exact: true },
  { to: '/products/create', label: 'Create Product', icon: PackagePlus },
  { to: '/health', label: 'API Health', icon: Activity },
]

type SidebarProps = {
  mobile?: boolean
  onClose?: () => void
}

export function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const location = useLocation()

  const isActive = (item: NavItem) => {
    if (item.exact) return location.pathname === item.to
    return location.pathname.startsWith(item.to)
  }

  return (
    <aside
      className={cn(
        'flex flex-col bg-bg-secondary border-r border-border-subtle',
        mobile ? 'w-72' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100 leading-none">Products</div>
            <div className="text-[10px] text-slate-500 leading-none mt-0.5 font-mono tracking-wide">
              CMD CENTER
            </div>
          </div>
        </div>

        {mobile && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-bg-overlay transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
        <div className="text-[10px] font-semibold tracking-widest text-slate-600 uppercase px-3 mb-3">
          Navigation
        </div>

        {navItems.map((item) => {
          const active = isActive(item)
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={mobile ? onClose : undefined}
              className={cn(
                'flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                active
                  ? 'text-brand-400 bg-brand-500/10 border border-brand-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-bg-overlay border border-transparent',
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0',
                    active ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300',
                  )}
                />
                <span>{item.label}</span>
              </div>

              {active && (
                <ChevronRight className="w-3.5 h-3.5 text-brand-500" />
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border-subtle">
        <div className="text-[10px] text-slate-600 font-mono">
          v1.0.0 · Products API
        </div>
      </div>
    </aside>
  )
}

type MobileSidebarProps = {
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 h-full lg:hidden"
          >
            <Sidebar mobile onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
