import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, User, Zap, AlertCircle } from 'lucide-react'
import { loginApi } from '../api'
import { authStore } from '../authStore'
import { extractApiError } from '@/lib/apiClient'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)

  useEffect(() => {
    if (authStore.isAuthenticated()) {
      navigate('/dashboard', { replace: true })
    }
    const expired = sessionStorage.getItem('session_expired')
    if (expired) {
      setSessionExpired(true)
      sessionStorage.removeItem('session_expired')
    }
  }, [navigate])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormData) => {
    setServerError(null)
    try {
      const token = await loginApi(values)
      authStore.login(token.accessToken, token.expiresAtUtc)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const apiErr = extractApiError(err)
      setServerError(apiErr.message)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-gradient-glow" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-purple/30 to-transparent" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center max-w-md"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-md">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Products</span>
            <br />
            <span className="text-slate-100">Command Center</span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed mb-12">
            Enterprise-grade product management. Real-time inventory. Full visibility.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Products', value: 'Managed' },
              { label: 'Uptime', value: '99.9%' },
              { label: 'API', value: 'Secured' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <div className="text-brand-400 font-bold text-lg">{stat.value}</div>
                <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-bg-secondary relative">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-secondary" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Products Command Center</span>
          </div>

          <div className="glass-card p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-2">Sign in</h2>
              <p className="text-slate-400 text-sm">Enter your credentials to access the dashboard</p>
            </div>

            {sessionExpired && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Your session has expired. Please sign in again.</span>
              </motion.div>
            )}

            {serverError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{serverError}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <Input
                label="Username"
                leftIcon={<User className="w-4 h-4" />}
                placeholder="admin"
                error={errors.username?.message}
                autoComplete="username"
                {...register('username')}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  leftIcon={<Lock className="w-4 h-4" />}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  autoComplete="current-password"
                  {...register('password')}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full mt-2"
              >
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border-subtle text-center">
              <p className="text-xs text-slate-500">
                Protected by JWT Bearer authentication
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
