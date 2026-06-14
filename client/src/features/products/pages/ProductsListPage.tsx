import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Package,
  Plus,
  RefreshCw,
  Search,
  Eye,
  Pencil,
  Trash2,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { fetchProducts } from '../api'
import { ColourBadge } from '../components/ColourBadge'
import { DeleteProductModal } from '../components/DeleteProductModal'
import { ProductTableSkeleton } from '@/components/feedback/LoadingSkeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/formatters'
import { formatDate } from '@/lib/date'
import { extractApiError } from '@/lib/apiClient'
import type { Product } from '../types'

const PAGE_SIZE = 15
const COMMON_COLOURS = ['', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Black', 'White', 'Grey', 'Cyan', 'Pink']

export function ProductsListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [colourFilter, setColourFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  // Debounce search input — avoids firing a request on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // Reset page when filter changes
  useEffect(() => {
    setPage(1)
  }, [colourFilter])

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['products', 'list', { page, pageSize: PAGE_SIZE, search: debouncedSearch, colour: colourFilter }],
    queryFn: () =>
      fetchProducts({
        search: debouncedSearch || undefined,
        colour: colourFilter || undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
    placeholderData: (prev) => prev,
  })

  const products = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1
  const hasNextPage = data?.hasNextPage ?? false
  const hasPreviousPage = data?.hasPreviousPage ?? false
  const apiError = isError ? extractApiError(error) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Products</h1>
          <p className="text-slate-400 text-sm mt-1">
            {totalCount > 0
              ? `${totalCount} product${totalCount !== 1 ? 's' : ''} total`
              : 'Manage your product catalogue'}
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                leftIcon={<Search className="w-4 h-4" />}
                placeholder="Search by name or description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                rightElement={
                  search ? (
                    <button
                      onClick={() => { setSearch(''); setDebouncedSearch('') }}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : undefined
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="flex gap-1.5 flex-wrap">
                {COMMON_COLOURS.map((c) => (
                  <button
                    key={c || 'all'}
                    onClick={() => setColourFilter(c)}
                    className={[
                      'px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                      colourFilter === c
                        ? 'bg-brand-600 text-white border border-brand-500'
                        : 'bg-bg-elevated text-slate-400 border border-border-subtle hover:border-border-default hover:text-slate-200',
                    ].join(' ')}
                  >
                    {c || 'All'}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader
          title="Product Catalogue"
          description={
            data && (debouncedSearch || colourFilter)
              ? `${totalCount} result${totalCount !== 1 ? 's' : ''} found`
              : undefined
          }
        />
        <CardContent>
          {isLoading ? (
            <ProductTableSkeleton />
          ) : isError ? (
            <ErrorState message={apiError?.message} onRetry={() => refetch()} />
          ) : products.length === 0 ? (
            <EmptyState
              icon={<Package className="w-6 h-6" />}
              title={debouncedSearch || colourFilter ? 'No products match your filters' : 'No products yet'}
              description={
                debouncedSearch || colourFilter
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first product.'
              }
              action={
                !debouncedSearch && !colourFilter ? (
                  <Button
                    variant="primary"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => navigate('/products/create')}
                  >
                    Add Product
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <div className={['overflow-x-auto -mx-6 transition-opacity', isFetching ? 'opacity-60' : 'opacity-100'].join(' ')}>
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      {['Name', 'Colour', 'Price', 'Stock', 'Created', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {products.map((product, i) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.025 }}
                        className="group hover:bg-bg-elevated/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-200 text-sm group-hover:text-white transition-colors">
                            {product.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">
                            {product.description}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <ColourBadge colour={product.colour} />
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-slate-300">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={[
                              'text-sm font-medium',
                              product.stockQuantity === 0
                                ? 'text-red-400'
                                : product.stockQuantity < 5
                                  ? 'text-amber-400'
                                  : 'text-emerald-400',
                            ].join(' ')}
                          >
                            {product.stockQuantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {formatDate(product.createdAtUtc)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => product.id && navigate(`/products/${product.id}`)}
                              title="View"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => product.id && navigate(`/products/${product.id}/edit`)}
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget(product)}
                              title="Delete"
                              className="text-red-500/70 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-border-subtle">
                  <p className="text-xs text-slate-500">
                    Page {page} of {totalPages} · {totalCount} total
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                      disabled={!hasPreviousPage}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const pageNum =
                          totalPages <= 5
                            ? i + 1
                            : page <= 3
                              ? i + 1
                              : page >= totalPages - 2
                                ? totalPages - 4 + i
                                : page - 2 + i
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={[
                              'w-8 h-8 rounded-lg text-xs font-medium transition-all',
                              pageNum === page
                                ? 'bg-brand-600 text-white'
                                : 'text-slate-400 hover:bg-bg-elevated hover:text-slate-200',
                            ].join(' ')}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                      disabled={!hasNextPage}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <DeleteProductModal
        product={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
