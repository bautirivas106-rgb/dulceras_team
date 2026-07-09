import { type FormEvent, useEffect, useRef, useState } from 'react'
import {
  createProduct, updateProduct,
  createVariant, updateVariant, deleteVariant,
  type CatalogProduct, type CatalogCategory,
} from '../../../api/catalogApi'

interface Props {
  product?: CatalogProduct | null
  categories: CatalogCategory[]
  onClose: () => void
  onSaved: () => void
}

interface VariantRow {
  id?: number
  name: string
  price: string
  stock_quantity: number
  is_active: boolean
  sort_order: number
  _deleted?: boolean
  _new?: boolean
}

function field(
  label: string,
  children: React.ReactNode,
  hint?: string,
) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

const INPUT = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8889A]'

export default function ProductModal({ product, categories, onClose, onSaved }: Props) {
  const isEditing = !!product
  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [categoryId, setCategoryId] = useState<string>(String(product?.category ?? ''))
  const [advanceHours, setAdvanceHours] = useState(product?.requires_advance_hours ?? 48)
  const [sortOrder, setSortOrder] = useState(product?.sort_order ?? 0)
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [variants, setVariants] = useState<VariantRow[]>(() =>
    product?.variants.map((v) => ({ ...v, price: v.price, _new: false, _deleted: false })) ?? [],
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile)
      setImagePreview(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [imageFile])

  function addVariantRow() {
    setVariants((vs) => [
      ...vs,
      { name: '', price: '', stock_quantity: 0, is_active: true, sort_order: vs.length, _new: true },
    ])
  }

  function updateVariantRow(idx: number, patch: Partial<VariantRow>) {
    setVariants((vs) => vs.map((v, i) => (i === idx ? { ...v, ...patch } : v)))
  }

  function removeVariantRow(idx: number) {
    setVariants((vs) =>
      vs.map((v, i) => {
        if (i !== idx) return v
        // existing variant → mark deleted; new row → remove
        return v._new ? null! : { ...v, _deleted: true }
      }).filter(Boolean),
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!categoryId) { setError('Seleccioná una categoría.'); return }
    setSaving(true)
    setError('')
    try {
      let savedProduct: CatalogProduct

      if (isEditing) {
        // If image changed, use FormData; otherwise plain JSON
        if (imageFile) {
          const fd = new FormData()
          fd.append('name', name)
          fd.append('description', description)
          fd.append('category', categoryId)
          fd.append('requires_advance_hours', String(advanceHours))
          fd.append('sort_order', String(sortOrder))
          fd.append('is_active', String(isActive))
          fd.append('image', imageFile)
          const { data } = await updateProduct(product.id, fd)
          savedProduct = data
        } else {
          const { data } = await updateProduct(product.id, {
            name, description, category: Number(categoryId),
            requires_advance_hours: advanceHours, sort_order: sortOrder, is_active: isActive,
          })
          savedProduct = data
        }
      } else {
        const fd = new FormData()
        fd.append('name', name)
        fd.append('description', description)
        fd.append('category', categoryId)
        fd.append('requires_advance_hours', String(advanceHours))
        fd.append('sort_order', String(sortOrder))
        fd.append('is_active', String(isActive))
        if (imageFile) fd.append('image', imageFile)
        const { data } = await createProduct(fd)
        savedProduct = data
      }

      // Sync variants
      const ops: Promise<unknown>[] = []
      for (const v of variants) {
        if (v._deleted && v.id) {
          ops.push(deleteVariant(v.id))
        } else if (v._new && !v._deleted && v.name && v.price) {
          ops.push(createVariant({
            product: savedProduct.id,
            name: v.name,
            price: v.price,
            stock_quantity: v.stock_quantity,
            is_active: v.is_active,
            sort_order: v.sort_order,
          }))
        } else if (!v._new && !v._deleted && v.id) {
          ops.push(updateVariant(v.id, {
            name: v.name,
            price: v.price,
            stock_quantity: v.stock_quantity,
            is_active: v.is_active,
            sort_order: v.sort_order,
          }))
        }
      }
      await Promise.all(ops)
      onSaved()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: unknown } })?.response?.data
      setError(msg && typeof msg === 'object' ? JSON.stringify(msg) : 'Error al guardar el producto.')
    } finally {
      setSaving(false)
    }
  }

  const activeVariants = variants.filter((v) => !v._deleted)

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">
            {isEditing ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 break-all">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {field('Nombre *', (
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                required autoFocus className={INPUT} />
            ))}
            {field('Categoría *', (
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                required className={INPUT}>
                <option value="">Seleccioná...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            ))}
          </div>

          {field('Descripción', (
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3} className={`${INPUT} resize-none`} />
          ))}

          <div className="grid grid-cols-2 gap-4">
            {field('Anticipación mínima (horas)', (
              <input type="number" min={0} value={advanceHours}
                onChange={(e) => setAdvanceHours(Number(e.target.value))}
                className={INPUT} />
            ), 'Cuántas horas antes se puede pedir')}
            {field('Orden de muestra', (
              <input type="number" min={0} value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className={INPUT} />
            ))}
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Imagen</label>
            <div className="flex items-start gap-3">
              {(imagePreview ?? product?.image) && (
                <img
                  src={imagePreview ?? (product?.image as string)}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                />
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="border border-dashed border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:border-[#E8889A] hover:text-[#E8889A] transition-colors"
              >
                {product?.image || imageFile ? 'Cambiar imagen' : 'Subir imagen'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded accent-[#E8889A]" />
            <span className="text-sm text-gray-700">Activo (visible en la tienda)</span>
          </label>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Variantes / precios</span>
              <button
                type="button"
                onClick={addVariantRow}
                className="text-xs text-[#E8889A] hover:underline font-medium"
              >
                + Agregar variante
              </button>
            </div>

            {activeVariants.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center border border-dashed border-gray-200 rounded-lg">
                Sin variantes — hacé clic en "Agregar variante"
              </p>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Nombre</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 w-28">Precio $</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 w-24">Stock</th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-500 w-16 text-center">Activa</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {variants.map((v, idx) => {
                      if (v._deleted) return null
                      return (
                        <tr key={idx}>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={v.name}
                              onChange={(e) => updateVariantRow(idx, { name: e.target.value })}
                              placeholder="Ej: Docena"
                              required
                              className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#E8889A]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={v.price}
                              onChange={(e) => updateVariantRow(idx, { price: e.target.value })}
                              min={0}
                              step="0.01"
                              required
                              className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#E8889A]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={v.stock_quantity}
                              onChange={(e) => updateVariantRow(idx, { stock_quantity: Number(e.target.value) })}
                              min={0}
                              className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#E8889A]"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={v.is_active}
                              onChange={(e) => updateVariantRow(idx, { is_active: e.target.checked })}
                              className="accent-[#E8889A]"
                            />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeVariantRow(idx)}
                              className="text-gray-300 hover:text-red-400 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={saving}
            className="flex-1 bg-[#3D1A0E] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#5C2A18] transition-colors disabled:opacity-60"
          >
            {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </div>
    </div>
  )
}
