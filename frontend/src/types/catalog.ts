export interface Category {
  id: number
  name: string
  slug: string
  description: string
}

export interface ProductVariant {
  id: number
  name: string
  price: string
  stock_quantity?: number
  is_active?: boolean
}

export interface Product {
  id: number
  name: string
  description: string
  image: string | null
  image_url: string | null
  requires_advance_hours: number
  sort_order?: number
  category: Category | number
  category_name?: string
  variants: ProductVariant[]
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
