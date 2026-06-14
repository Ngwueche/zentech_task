import { useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchProduct, updateProduct } from '../api'
import { ProductForm } from '../components/ProductForm'
import { ProductDetailSkeleton } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { extractApiError } from '@/lib/apiClient'
import type { ProductFormData } from '../schemas'

export function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)

  const validId = id && id !== 'undefined' && id !== 'null' ? id : null

  const { data: product, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['products', validId],
    queryFn: () => fetchProduct(validId!),
    enabled: !!validId,
  })

  const mutation = useMutation({
    mutationFn: (data: ProductFormData) => updateProduct(validId!, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(`"${updated.name}" updated successfully!`)
      navigate(updated.id ? `/products/${updated.id}` : '/products')
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

  const apiError = isError ? extractApiError(error) : null

  if (!validId) {
    return <Navigate to="/products" replace />
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
        {product && (
          <>
            <button
              onClick={() => navigate(`/products/${id}`)}
              className="hover:text-slate-300 transition-colors"
            >
              {product.name}
            </button>
            <span>/</span>
          </>
        )}
        <span className="text-slate-300">Edit</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-brand-600 flex items-center justify-center shadow-glow-sm">
          <Pencil className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            {product ? `Edit "${product.name}"` : 'Edit Product'}
          </h1>
          <p className="text-slate-400 text-sm">Update the product information</p>
        </div>
      </div>

      {isLoading ? (
        <ProductDetailSkeleton />
      ) : isError ? (
        <ErrorState message={apiError?.message} onRetry={() => refetch()} />
      ) : product ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card topAccent>
            <CardHeader title="Product Information" description="Modify the details below" />
            <CardContent>
              {formError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {formError}
                </div>
              )}
              <ProductForm
                defaultValues={product}
                onSubmit={handleSubmit}
                onCancel={() => navigate(`/products/${id}`)}
                submitLabel="Save Changes"
                isSubmitting={mutation.isPending}
              />
            </CardContent>
          </Card>
        </motion.div>
      ) : null}
    </div>
  )
}
