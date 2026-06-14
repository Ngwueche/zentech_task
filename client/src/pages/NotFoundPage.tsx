import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-glow" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-md"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-md">
            <Zap className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="text-8xl font-black gradient-text mb-4">404</div>

        <h1 className="text-2xl font-bold text-slate-100 mb-3">Page not found</h1>
        <p className="text-slate-400 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>

        <Button
          variant="primary"
          size="lg"
          leftIcon={<Home className="w-4 h-4" />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </motion.div>
    </div>
  )
}
