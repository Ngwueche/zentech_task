import { apiClient, normalizeApiResponse } from '@/lib/apiClient'
import type { Product, CreateProductRequest, UpdateProductRequest, ProductsQuery, PaginatedProducts } from './types'

export async function fetchProducts(query?: ProductsQuery): Promise<PaginatedProducts> {
  const params: Record<string, string | number> = {}
  if (query?.search) params.search = query.search
  if (query?.colour) params.colour = query.colour
  params.page = query?.page ?? 1
  params.pageSize = query?.pageSize ?? 20

  const { data } = await apiClient.get('/api/products', { params })
  return normalizeApiResponse<PaginatedProducts>(data)
}

export async function fetchAllProducts(query?: Pick<ProductsQuery, 'colour'>): Promise<Product[]> {
  const params: Record<string, string | number> = {
    page: 1,
    pageSize: 100,
  }
  if (query?.colour) params.colour = query.colour

  const { data } = await apiClient.get('/api/products', { params })
  const paged = normalizeApiResponse<PaginatedProducts>(data)
  return paged.items
}

export async function fetchProduct(id: string): Promise<Product> {
  if (!id || id === 'undefined' || id === 'null') {
    throw new Error(`Invalid product ID: "${id}"`)
  }
  const { data } = await apiClient.get(`/api/products/${id}`)
  return normalizeApiResponse<Product>(data)
}

export async function createProduct(payload: CreateProductRequest): Promise<Product> {
  const { data } = await apiClient.post('/api/products', payload)
  return normalizeApiResponse<Product>(data)
}

export async function updateProduct(id: string, payload: UpdateProductRequest): Promise<Product> {
  const { data } = await apiClient.put(`/api/products/${id}`, payload)
  return normalizeApiResponse<Product>(data)
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/api/products/${id}`)
}
