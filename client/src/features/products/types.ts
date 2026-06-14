export type Product = {
  id: string
  name: string
  description: string
  colour: string
  price: number
  stockQuantity: number
  createdAtUtc: string
  updatedAtUtc: string | null
}

export type CreateProductRequest = {
  name: string
  description: string
  colour: string
  price: number
  stockQuantity: number
}

export type UpdateProductRequest = CreateProductRequest

export type PaginatedProducts = {
  items: Product[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type ProductsQuery = {
  search?: string
  colour?: string
  page?: number
  pageSize?: number
}
