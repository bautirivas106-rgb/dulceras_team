import adminClient from './adminClient'

export interface CatalogCategory {
  id: number
  name: string
  slug: string
  description: string
  is_active: boolean
  created_at: string
}

export interface CatalogVariant {
  id: number
  product: number
  name: string
  price: string
  stock_quantity: number
  is_active: boolean
  sort_order: number
}

export interface CatalogProduct {
  id: number
  name: string
  description: string
  image: string | null
  category: number
  category_name: string
  is_active: boolean
  made_to_order: boolean
  requires_advance_hours: number
  sort_order: number
  variants: CatalogVariant[]
  created_at: string
}

// Categories
export const getCategories = () =>
  adminClient.get<{ count: number; results: CatalogCategory[] }>('/api/admin/catalog/categories/')

export const createCategory = (data: Partial<CatalogCategory>) =>
  adminClient.post<CatalogCategory>('/api/admin/catalog/categories/', data)

export const updateCategory = (id: number, data: Partial<CatalogCategory>) =>
  adminClient.patch<CatalogCategory>(`/api/admin/catalog/categories/${id}/`, data)

export const deleteCategory = (id: number) =>
  adminClient.delete(`/api/admin/catalog/categories/${id}/`)

// Products
export const getProducts = (params?: { category?: number | string; is_active?: boolean }) =>
  adminClient.get<{ count: number; results: CatalogProduct[] }>('/api/admin/catalog/products/', { params })

export const getProduct = (id: number) =>
  adminClient.get<CatalogProduct>(`/api/admin/catalog/products/${id}/`)

export const createProduct = (data: FormData) =>
  adminClient.post<CatalogProduct>('/api/admin/catalog/products/', data, {
    headers: { 'Content-Type': undefined as unknown as string },
  })

export const updateProduct = (id: number, data: FormData | Record<string, unknown>) =>
  adminClient.patch<CatalogProduct>(`/api/admin/catalog/products/${id}/`, data, {
    headers: data instanceof FormData ? { 'Content-Type': undefined as unknown as string } : {},
  })

export const deleteProduct = (id: number) =>
  adminClient.delete(`/api/admin/catalog/products/${id}/`)

// Variants
export const createVariant = (data: Partial<CatalogVariant>) =>
  adminClient.post<CatalogVariant>('/api/admin/catalog/variants/', data)

export const updateVariant = (id: number, data: Partial<CatalogVariant>) =>
  adminClient.patch<CatalogVariant>(`/api/admin/catalog/variants/${id}/`, data)

export const deleteVariant = (id: number) =>
  adminClient.delete(`/api/admin/catalog/variants/${id}/`)

export const updateStock = (variantId: number, quantity: number) =>
  adminClient.patch<CatalogVariant>(`/api/admin/catalog/variants/${variantId}/`, { stock_quantity: quantity })

export const updateMadeToOrder = (productId: number, madeToOrder: boolean) =>
  adminClient.patch<CatalogProduct>(`/api/admin/catalog/products/${productId}/`, { made_to_order: madeToOrder })
