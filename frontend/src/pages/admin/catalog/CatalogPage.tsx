import { useEffect, useState } from 'react'
import {
  getCategories, getProducts, deleteProduct, updateCategory, deleteCategory,
  type CatalogCategory, type CatalogProduct,
} from '../../../api/catalogApi'
import CategoryModal from './CategoryModal'
import ProductModal from './ProductModal'

type Tab = 'products' | 'categories'

function Badge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
      active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
    }`}>
      {active ? 'Activo' : 'Inactivo'}
    </span>
  )
}

function IconPencil() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

export default function CatalogPage() {
  const [tab, setTab] = useState<Tab>('products')
  const [categories, setCategories] = useState<CatalogCategory[]>([])
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)

  const [catModal, setCatModal] = useState<CatalogCategory | null | 'new'>(null)
  const [prodModal, setProdModal] = useState<CatalogProduct | null | 'new'>(null)

  const [filterCat, setFilterCat] = useState('')

  async function reload() {
    setLoading(true)
    try {
      const [catsRes, prodsRes] = await Promise.all([
        getCategories(),
        getProducts(),
      ])
      setCategories(catsRes.data.results)
      setProducts(prodsRes.data.results)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { reload() }, [])

  async function handleToggleCategory(cat: CatalogCategory) {
    await updateCategory(cat.id, { is_active: !cat.is_active })
    reload()
  }

  async function handleDeleteCategory(cat: CatalogCategory) {
    if (!confirm(`¿Eliminar categoría "${cat.name}"? Los productos asociados quedarán sin categoría.`)) return
    try {
      await deleteCategory(cat.id)
      reload()
    } catch {
      alert('No se pudo eliminar. Puede tener productos asociados.')
    }
  }

  async function handleDeleteProduct(prod: CatalogProduct) {
    if (!confirm(`¿Eliminar "${prod.name}"?`)) return
    await deleteProduct(prod.id)
    reload()
  }

  const filteredProducts = filterCat
    ? products.filter((p) => String(p.category) === filterCat)
    : products

  const categoryName = (id: number) =>
    categories.find((c) => c.id === id)?.name ?? '—'

  const priceRange = (prod: CatalogProduct) => {
    const prices = prod.variants.map((v) => parseFloat(v.price))
    if (!prices.length) return '—'
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    return min === max
      ? `$${min.toLocaleString('es-AR')}`
      : `$${min.toLocaleString('es-AR')} – $${max.toLocaleString('es-AR')}`
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Catálogo</h1>
        <button
          onClick={() => tab === 'products' ? setProdModal('new') : setCatModal('new')}
          className="flex items-center gap-2 bg-[#3D1A0E] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#5C2A18] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {tab === 'products' ? 'Nuevo producto' : 'Nueva categoría'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(['products', 'categories'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'products' ? `Productos (${products.length})` : `Categorías (${categories.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-[#E8889A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Products tab ── */}
          {tab === 'products' && (
            <div className="space-y-3">
              {/* Category filter */}
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E8889A] bg-white"
              >
                <option value="">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {filteredProducts.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-16">Sin productos</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-14" />
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Producto</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Categoría</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-20">Vars</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Precio</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                        <th className="px-4 py-3 w-20" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-4 py-3">
                            {prod.image ? (
                              <img
                                src={prod.image}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">{prod.name}</p>
                            {prod.description && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{prod.description}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{categoryName(prod.category)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                              {prod.variants.filter((v) => v.is_active).length}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700 font-medium text-xs">{priceRange(prod)}</td>
                          <td className="px-4 py-3">
                            <Badge active={prod.is_active} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setProdModal(prod)}
                                className="text-gray-400 hover:text-[#3D1A0E] transition-colors"
                                title="Editar"
                              >
                                <IconPencil />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                title="Eliminar"
                              >
                                <IconTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── Categories tab ── */}
          {tab === 'categories' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {categories.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-16">Sin categorías</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Slug</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Descripción</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-24">Prods.</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                      <th className="px-4 py-3 w-24" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {categories.map((cat) => {
                      const prodCount = products.filter((p) => p.category === cat.id).length
                      return (
                        <tr key={cat.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-5 py-3.5 font-medium text-gray-800">{cat.name}</td>
                          <td className="px-4 py-3.5 font-mono text-xs text-gray-500">{cat.slug}</td>
                          <td className="px-4 py-3.5 text-gray-400 text-xs hidden md:table-cell truncate max-w-xs">
                            {cat.description || '—'}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                              {prodCount}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <button onClick={() => handleToggleCategory(cat)} className="cursor-pointer">
                              <Badge active={cat.is_active} />
                            </button>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setCatModal(cat)}
                                className="text-gray-400 hover:text-[#3D1A0E] transition-colors"
                              >
                                <IconPencil />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <IconTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {catModal && (
        <CategoryModal
          category={catModal === 'new' ? null : catModal}
          onClose={() => setCatModal(null)}
          onSaved={() => { setCatModal(null); reload() }}
        />
      )}

      {prodModal && (
        <ProductModal
          product={prodModal === 'new' ? null : prodModal}
          categories={categories}
          onClose={() => setProdModal(null)}
          onSaved={() => { setProdModal(null); reload() }}
        />
      )}
    </div>
  )
}
