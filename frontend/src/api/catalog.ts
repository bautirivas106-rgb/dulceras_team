import client from './client'
import type { Category, Product, PaginatedResponse } from '../types/catalog'

export async function getCategories(tenantSlug: string): Promise<Category[]> {
  const { data } = await client.get<PaginatedResponse<Category>>(
    `/api/public/${tenantSlug}/categories/`
  )
  return data.results
}

export async function getProducts(
  tenantSlug: string,
  categorySlug?: string
): Promise<Product[]> {
  const params = categorySlug ? { category: categorySlug } : {}
  const { data } = await client.get<PaginatedResponse<Product>>(
    `/api/public/${tenantSlug}/products/`,
    { params }
  )
  return data.results
}

export async function getProduct(tenantSlug: string, id: number): Promise<Product> {
  const { data } = await client.get<Product>(
    `/api/public/${tenantSlug}/products/${id}/`
  )
  return data
}
