import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { deleteProduct } from '../api'
import { extractApiError } from '@/lib/apiClient'
import type { Product } from '../types'

type DeleteProductModalProps = {
  product: Product | null
  onClose: () => void
  onSuccess?: () => void
}

export function DeleteProductModal({ product, onClose, onSuccess }: DeleteProductModalProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(`"${product?.name}" deleted successfully`)
      onClose()
      onSuccess?.()
    },
    onError: (err) => {
      const apiErr = extractApiError(err)
      toast.error(apiErr.message)
    },
  })

  return (
    <ConfirmDialog
      open={product !== null}
      onClose={onClose}
      onConfirm={() => { if (product) mutation.mutate(product.id) }}
      title="Delete Product"
      description={`Are you sure you want to delete "${product?.name}"? This action cannot be undone.`}
      confirmLabel="Delete"
      loading={mutation.isPending}
    />
  )
}
