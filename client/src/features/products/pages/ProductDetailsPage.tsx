import { useState, type ReactNode } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Pencil, Trash2, Package, Tag, DollarSign, Layers, Calendar, Clock } from 'lucide-react'
import { fetchProduct } from '../api'
import { ColourBadge } from '../components/ColourBadge'
import { DeleteProductModal } from '../components/DeleteProductModal'
import { ProductDetailSkeleton } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/formatters'
import { formatDateTime, formatRelative } from '@/lib/date'
import { extractApiError } from '@/lib/apiClient'

type DetailRowProps = { icon: ReactNode; label: string; value: ReactNode }

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border-subtle last:border-0">
      <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-slate-500 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-500 mb-0.5">{label}</div>
        <div className="text-sm text-slate-200 font-medium">{value}</div>
      </div>
    </div>
  )
}

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showDelete, setShowDelete] = useState(false)

  const validId = id && id !== 'undefined' && id !== 'null' ? id : null

  const { data: product, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['products', validId],
    queryFn: () => fetchProduct(validId!),
    enabled: !!validId,
  })

  if (!validId) {
    return <Navigate to="/products" replace />
  }

  const apiError = isError ? extractApiError(error) : null

  return (
    <div className="space-y-6">
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
        <span className="text-slate-300">{product?.name ?? 'Product Details'}</span>
      </div>

      {isLoading ? (
        <ProductDetailSkeleton />
      ) : isError ? (
        <ErrorState message={apiError?.message} onRetry={() => refetch()} />
      ) : product ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header card */}
          <Card topAccent>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm shrink-0">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-100">{product.name}</h1>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <ColourBadge colour={product.colour} />
                      <Badge
                        variant={
                          product.stockQuantity === 0
                            ? 'danger'
                            : product.stockQuantity < 5
                              ? 'warning'
                              : 'success'
                        }
                        dot
                      >
                        {product.stockQuantity === 0
                          ? 'Out of stock'
                          : product.stockQuantity < 5
                            ? 'Low stock'
                            : 'In stock'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    leftIcon={<Pencil className="w-4 h-4" />}
                    onClick={() => navigate(`/products/${product.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    onClick={() => setShowDelete(true)}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {product.description && (
                <p className="mt-5 text-slate-400 text-sm leading-relaxed max-w-2xl">
                  {product.description}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Product details */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Product Details
                </h2>
                <DetailRow
                  icon={<Tag className="w-4 h-4" />}
                  label="Colour"
                  value={<ColourBadge colour={product.colour} />}
                />
                <DetailRow
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Price"
                  value={
                    <span className="text-brand-400 font-bold text-lg font-mono">
                      {formatCurrency(product.price)}
                    </span>
                  }
                />
                <DetailRow
                  icon={<Layers className="w-4 h-4" />}
                  label="Stock Quantity"
                  value={
                    <span
                      className={
                        product.stockQuantity === 0
                          ? 'text-red-400'
                          : product.stockQuantity < 5
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                      }
                    >
                      {product.stockQuantity} units
                    </span>
                  }
                />
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Metadata
                </h2>
                <DetailRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="Created"
                  value={
                    <div>
                      <div>{formatDateTime(product.createdAtUtc)}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {formatRelative(product.createdAtUtc)}
                      </div>
                    </div>
                  }
                />
                <DetailRow
                  icon={<Clock className="w-4 h-4" />}
                  label="Last Updated"
                  value={
                    product.updatedAtUtc ? (
                      <div>
                        <div>{formatDateTime(product.updatedAtUtc)}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {formatRelative(product.updatedAtUtc)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500">Never updated</span>
                    )
                  }
                />
                <DetailRow
                  icon={<Tag className="w-4 h-4" />}
                  label="ID"
                  value={
                    <span className="font-mono text-xs text-slate-400 break-all">{product.id}</span>
                  }
                />
              </CardContent>
            </Card>
          </div>
        </motion.div>
      ) : null}

      <DeleteProductModal
        product={showDelete ? product ?? null : null}
        onClose={() => setShowDelete(false)}
        onSuccess={() => navigate('/products')}
      />
    </div>
  )
}
