import { useEffect, useState, useRef } from 'react'
import {
  getCategories, getProducts, deleteProduct, updateCategory, deleteCategory,
  updateStock, updateMadeToOrder, updateProduct,
  type CatalogCategory, type CatalogProduct, type CatalogVariant,
} from '../../../api/catalogApi'
import CategoryModal from './CategoryModal'
import ProductModal from './ProductModal'

type Tab = 'products' | 'categories' | 'stock'

function ImageUploadCell({ product, onUploaded }: { product: CatalogProduct; onUploaded: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('image', file)
    try {
      await updateProduct(product.id, fd)
      onUploaded()
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const imgSrc = product.image_url || product.image

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 group/img block flex-shrink-0 hover:border-[#E8889A] transition-colors"
      title="Cambiar imagen"
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {uploading ? (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-[#E8889A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : imgSrc ? (
        <>
          <img src={imgSrc} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 group-hover/img:bg-pink-50 group-hover/img:text-[#E8889A] transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      )}
    </button>
  )
}

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
        {(['products', 'categories', 'stock'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'products' ? `Productos (${products.length})` : t === 'categories' ? `Categorías (${categories.length})` : 'Stock'}
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
                            <ImageUploadCell product={prod} onUploaded={reload} />
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
          {/* ── Stock tab ── */}
          {tab === 'stock' && (
            <StockPanel products={products} onUpdated={reload} />
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

// ── Stock panel ────────────────────────────────────────────────────────────────

function StockPanel({ products, onUpdated }: { products: CatalogProduct[]; onUpdated: () => void }) {
  const [editing, setEditing] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState<Record<number, boolean>>({})
  const [toggling, setToggling] = useState<Record<number, boolean>>({})
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  function startEdit(v: CatalogVariant) {
    setEditing((e) => ({ ...e, [v.id]: String(v.stock_quantity) }))
    setTimeout(() => inputRefs.current[v.id]?.select(), 50)
  }

  async function saveStock(variantId: number) {
    const qty = parseInt(editing[variantId] ?? '', 10)
    if (isNaN(qty) || qty < 0) return
    setSaving((s) => ({ ...s, [variantId]: true }))
    try {
      await updateStock(variantId, qty)
      onUpdated()
    } catch {}
    setSaving((s) => ({ ...s, [variantId]: false }))
    setEditing((e) => { const n = { ...e }; delete n[variantId]; return n })
  }

  async function toggleMadeToOrder(prod: CatalogProduct) {
    setToggling((t) => ({ ...t, [prod.id]: true }))
    try {
      await updateMadeToOrder(prod.id, !prod.made_to_order)
      onUpdated()
    } catch {}
    setToggling((t) => ({ ...t, [prod.id]: false }))
  }

  const stockProducts = products.filter((p) => p.variants.length > 0)

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Productos con <strong>Bajo pedido desactivado</strong> requieren stock disponible para poder ordenarse.
        Hacé clic en la cantidad para editarla.
      </p>

      {stockProducts.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-12">Sin productos con variantes.</p>
      )}

      {stockProducts.map((prod) => (
        <div key={prod.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/60">
            <div>
              <span className="font-semibold text-gray-800 text-sm">{prod.name}</span>
              <span className="ml-2 text-xs text-gray-400">{prod.category_name}</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-gray-500">Bajo pedido</span>
              <button
                onClick={() => toggleMadeToOrder(prod)}
                disabled={toggling[prod.id]}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                  prod.made_to_order ? 'bg-[#E8889A]' : 'bg-gray-300'
                } ${toggling[prod.id] ? 'opacity-50' : ''}`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                    prod.made_to_order ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </label>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400">Variante</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-gray-400">Precio</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-gray-400 w-32">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {prod.variants.filter((v) => v.is_active).map((v) => {
                const isEditing = v.id in editing
                const isSaving = saving[v.id]
                const stockOk = prod.made_to_order || v.stock_quantity > 0
                return (
                  <tr key={v.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-gray-700">{v.name}</td>
                    <td className="px-4 py-2.5 text-right text-gray-500">
                      ${Number(v.price).toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {prod.made_to_order ? (
                        <span className="text-xs text-gray-400 italic">Ilimitado</span>
                      ) : isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <input
                            ref={(el) => { inputRefs.current[v.id] = el }}
                            type="number"
                            min={0}
                            value={editing[v.id]}
                            onChange={(e) => setEditing((ed) => ({ ...ed, [v.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveStock(v.id)
                              if (e.key === 'Escape') setEditing((ed) => { const n = { ...ed }; delete n[v.id]; return n })
                            }}
                            className="w-16 text-right border border-[#E8889A] rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#E8889A]"
                          />
                          <button
                            onClick={() => saveStock(v.id)}
                            disabled={isSaving}
                            className="text-[10px] bg-[#E8889A] text-white px-2 py-1 rounded font-medium hover:bg-[#d9768a] disabled:opacity-50"
                          >
                            {isSaving ? '...' : 'OK'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(v)}
                          className={`font-semibold tabular-nums px-2 py-0.5 rounded hover:bg-gray-100 transition-colors ${
                            stockOk ? 'text-gray-800' : 'text-red-500'
                          }`}
                          title="Clic para editar"
                        >
                          {v.stock_quantity === 0 ? (
                            <span className="flex items-center gap-1">
                              <span>0</span>
                              <span className="text-[10px] bg-red-100 text-red-500 px-1 rounded">Agotado</span>
                            </span>
                          ) : v.stock_quantity <= 3 ? (
                            <span className="flex items-center gap-1">
                              <span>{v.stock_quantity}</span>
                              <span className="text-[10px] bg-amber-100 text-amber-600 px-1 rounded">Bajo</span>
                            </span>
                          ) : (
                            v.stock_quantity
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
