import { useState, useEffect } from 'react'
import { getCategories, getProducts } from '../api/catalog'
import type { Category, Product } from '../types/catalog'

export function useCategories(tenantSlug: string) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getCategories(tenantSlug)
      .then(setCategories)
      .catch(() => setError('No se pudieron cargar las categorías.'))
      .finally(() => setLoading(false))
  }, [tenantSlug])

  return { categories, loading, error }
}

export function useProducts(tenantSlug: string, categorySlug?: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getProducts(tenantSlug, categorySlug)
      .then(setProducts)
      .catch(() => setError('No se pudieron cargar los productos.'))
      .finally(() => setLoading(false))
  }, [tenantSlug, categorySlug])

  return { products, loading, error }
}
