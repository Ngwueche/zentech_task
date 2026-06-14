import { type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

type ConfirmDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  loading?: boolean
  children?: ReactNode
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div
          className={[
            'w-12 h-12 rounded-xl flex items-center justify-center',
            variant === 'danger' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400',
          ].join(' ')}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
          {description && <p className="text-sm text-slate-400">{description}</p>}
          {children}
        </div>

        <div className="flex gap-3 w-full pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading} className="flex-1">
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
