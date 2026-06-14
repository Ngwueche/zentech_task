import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productFormSchema, type ProductFormData } from '../schemas'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Save, X } from 'lucide-react'
import type { Product } from '../types'

const COMMON_COLOURS = [
  'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple',
  'Black', 'White', 'Grey', 'Cyan', 'Pink', 'Brown',
]

type ProductFormProps = {
  defaultValues?: Partial<Product>
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  isSubmitting?: boolean
}

export function ProductForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save Product',
  isSubmitting = false,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      colour: defaultValues?.colour ?? '',
      price: defaultValues?.price ?? ('' as unknown as number),
      stockQuantity: defaultValues?.stockQuantity ?? ('' as unknown as number),
    },
  })

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name ?? '',
        description: defaultValues.description ?? '',
        colour: defaultValues.colour ?? '',
        price: defaultValues.price ?? ('' as unknown as number),
        stockQuantity: defaultValues.stockQuantity ?? ('' as unknown as number),
      })
    }
  }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Name */}
        <div className="sm:col-span-2">
          <Input
            label="Product Name"
            placeholder="e.g. Premium Wireless Headphones"
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <Textarea
            label="Description"
            placeholder="Describe the product in detail…"
            error={errors.description?.message}
            hint="Max 500 characters"
            {...register('description')}
          />
        </div>

        {/* Colour */}
        <div>
          <Controller
            name="colour"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="colour-input" className="text-sm font-medium text-slate-300">
                  Colour
                </label>
                <Input
                  id="colour-input"
                  placeholder="e.g. Blue"
                  list="colour-suggestions"
                  error={errors.colour?.message}
                  {...field}
                />
                <datalist id="colour-suggestions">
                  {COMMON_COLOURS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>

                {/* Quick colour pills */}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {COMMON_COLOURS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => field.onChange(c)}
                      className={[
                        'px-2 py-0.5 rounded-full text-xs transition-all',
                        field.value === c
                          ? 'bg-brand-600 text-white border border-brand-500'
                          : 'bg-bg-elevated text-slate-400 border border-border-subtle hover:border-border-default hover:text-slate-200',
                      ].join(' ')}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          />
        </div>

        {/* Price */}
        <div>
          <Input
            label="Price (USD)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={errors.price?.message}
            {...register('price', { valueAsNumber: true })}
          />
        </div>

        {/* Stock Quantity */}
        <div>
          <Input
            label="Stock Quantity"
            type="number"
            step="1"
            min="0"
            placeholder="0"
            error={errors.stockQuantity?.message}
            {...register('stockQuantity', { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-border-subtle">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            leftIcon={<X className="w-4 h-4" />}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          leftIcon={<Save className="w-4 h-4" />}
          loading={isSubmitting}
          disabled={!isDirty && !!defaultValues}
          className="ml-auto"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
