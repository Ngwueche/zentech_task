import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, PackagePlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { createProduct } from '../api'
import { ProductForm } from '../components/ProductForm'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { extractApiError } from '@/lib/apiClient'
import type { ProductFormData } from '../schemas'

export function CreateProductPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (data: ProductFormData) => createProduct(data),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(`product created successfully!`)
      navigate(product?.id ? `/products/${product.id}` : '/products')
    },
    onError: (err) => {
      const apiErr = extractApiError(err)
      setFormError(apiErr.message)
      toast.error(apiErr.message)
    },
  })

  const handleSubmit = async (data: ProductFormData) => {
    setFormError(null)
    await mutation.mutateAsync(data)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <button
          onClick={() => navigate('/products')}
          className="hover:text-slate-300 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Products
        </button>
        <span>/</span>
        <span className="text-slate-300">Create Product</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
          <PackagePlus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Create Product</h1>
          <p className="text-slate-400 text-sm">Add a new product to your catalogue</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card topAccent>
          <CardHeader title="Product Information" description="Fill in the details for your new product" />
          <CardContent>
            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {formError}
              </div>
            )}
            <ProductForm
              onSubmit={handleSubmit}
              onCancel={() => navigate('/products')}
              submitLabel="Create Product"
              isSubmitting={mutation.isPending}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
