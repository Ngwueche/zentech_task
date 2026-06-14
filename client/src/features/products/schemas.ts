import { z } from 'zod'

export const productFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(100, 'Name must be 100 characters or fewer'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or fewer'),
  colour: z
    .string()
    .min(1, 'Colour is required')
    .max(50, 'Colour must be 50 characters or fewer'),
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .positive('Price must be greater than 0')
    .max(1_000_000, 'Price seems too high'),
  stockQuantity: z
    .number({ invalid_type_error: 'Stock quantity must be a number' })
    .int('Stock quantity must be a whole number')
    .min(0, 'Stock quantity must be 0 or greater')
    .max(100_000, 'Stock quantity seems too high'),
})

export type ProductFormData = z.infer<typeof productFormSchema>
