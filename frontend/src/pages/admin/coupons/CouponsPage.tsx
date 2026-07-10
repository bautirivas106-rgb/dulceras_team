import { useState, useEffect } from 'react'
import {
  getCoupons, createCoupon, updateCoupon, deleteCoupon, toggleCoupon,
} from '../../../api/couponsApi'
import type { Coupon, CouponPayload } from '../../../api/couponsApi'

const EMPTY: CouponPayload = {
  code: '',
  discount_type: 'percentage',
  discount_value: '10',
  min_order_amount: '0',
  max_uses: 0,
  valid_from: null,
  valid_until: null,
  is_active: true,
}

function statusBadge(coupon: Coupon) {
  if (!coupon.is_active) return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">Inactivo</span>
  const today = new Date().toISOString().split('T')[0]
  if (coupon.valid_until && coupon.valid_until < today) return <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-600">Vencido</span>
  if (coupon.max_uses > 0 && coupon.uses_count >= coupon.max_uses) return <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-600">Agotado</span>
  return <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Activo</span>
}

function CouponModal({
  initial, onSave, onClose,
}: {
  initial: CouponPayload & { id?: number }
  onSave: (data: CouponPayload, id?: number) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<CouponPayload>({ ...EMPTY, ...initial })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field: keyof CouponPayload, value: unknown) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.code.trim()) { setError('El código es requerido.'); return }
    setSaving(true)
    setError('')
    try {
      await onSave({ ...form, code: form.code.toUpperCase() }, initial.id)
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: Record<string, string[]> } })?.response?.data
      setError(msg ? Object.values(msg).flat().join(' ') : 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full border border-[#E8C8A0] rounded-xl px-3 py-2.5 text-sm text-[#3D1A0E] focus:outline-none focus:ring-2 focus:ring-[#E8889A]/30 focus:border-[#E8889A]'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-[#3D1A0E]">{initial.id ? 'Editar cupón' : 'Nuevo cupón'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-3 py-2">{error}</p>}

          <div>
            <label className="block text-xs font-semibold text-[#7C4A2D] mb-1">Código *</label>
            <input
              className={`${inputCls} uppercase`}
              placeholder="VERANO10"
              value={form.code}
              onChange={e => set('code', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#7C4A2D] mb-1">Tipo</label>
              <select className={inputCls} value={form.discount_type} onChange={e => set('discount_type', e.target.value)}>
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto fijo ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7C4A2D] mb-1">
                {form.discount_type === 'percentage' ? 'Descuento (%)' : 'Descuento ($)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputCls}
                value={form.discount_value}
                onChange={e => set('discount_value', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7C4A2D] mb-1">
              Monto mínimo ($) <span className="font-normal text-gray-400">— 0 = sin mínimo</span>
            </label>
            <input
              type="number"
              min="0"
              className={inputCls}
              value={form.min_order_amount}
              onChange={e => set('min_order_amount', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7C4A2D] mb-1">
              Usos máximos <span className="font-normal text-gray-400">— 0 = ilimitado</span>
            </label>
            <input
              type="number"
              min="0"
              className={inputCls}
              value={form.max_uses}
              onChange={e => set('max_uses', Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#7C4A2D] mb-1">Válido desde</label>
              <input
                type="date"
                className={inputCls}
                value={form.valid_from ?? ''}
                onChange={e => set('valid_from', e.target.value || null)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7C4A2D] mb-1">Válido hasta</label>
              <input
                type="date"
                className={inputCls}
                value={form.valid_until ?? ''}
                onChange={e => set('valid_until', e.target.value || null)}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => set('is_active', e.target.checked)}
              className="w-4 h-4 accent-[#E8889A]"
            />
            <span className="text-sm text-[#3D1A0E]">Activo</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#E8C8A0] text-[#7C4A2D] py-2.5 rounded-full text-sm font-semibold hover:bg-[#FDF6EC] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#E8889A] text-white py-2.5 rounded-full text-sm font-semibold hover:bg-[#d9768a] disabled:opacity-60 transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<(CouponPayload & { id?: number }) | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  async function load() {
    try {
      setCoupons(await getCoupons())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleSave(data: CouponPayload, id?: number) {
    if (id) {
      await updateCoupon(id, data)
    } else {
      await createCoupon(data)
    }
    await load()
  }

  async function handleToggle(id: number) {
    const updated = await toggleCoupon(id)
    setCoupons(cs => cs.map(c => c.id === id ? updated : c))
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este cupón? Esta acción no se puede deshacer.')) return
    setDeleting(id)
    try {
      await deleteCoupon(id)
      setCoupons(cs => cs.filter(c => c.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <div className="p-8 text-[#7C4A2D]">Cargando...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D1A0E]">Cupones de descuento</h1>
          <p className="text-sm text-[#7C4A2D] mt-0.5">{coupons.length} cupón{coupons.length !== 1 ? 'es' : ''}</p>
        </div>
        <button
          onClick={() => setModal({ ...EMPTY })}
          className="bg-[#E8889A] text-white font-bold px-5 py-2.5 rounded-full text-sm hover:bg-[#d9768a] transition-colors"
        >
          + Nuevo cupón
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-16 text-[#A0673A]">
          <div className="text-4xl mb-3">🎟️</div>
          <p className="font-semibold">Sin cupones todavía</p>
          <p className="text-sm mt-1">Creá tu primer cupón de descuento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map(c => (
            <div
              key={c.id}
              className="bg-white border border-[#F5E8D0] rounded-2xl px-5 py-4 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#3D1A0E] font-mono tracking-wider">{c.code}</span>
                  {statusBadge(c)}
                </div>
                <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-[#7C4A2D]">
                  <span>
                    {c.discount_type === 'percentage'
                      ? `${c.discount_value}% de descuento`
                      : `$${Number(c.discount_value).toLocaleString('es-AR')} de descuento`}
                  </span>
                  {Number(c.min_order_amount) > 0 && (
                    <span className="text-[#A0673A]">
                      Mín. ${Number(c.min_order_amount).toLocaleString('es-AR')}
                    </span>
                  )}
                  {c.max_uses > 0 && (
                    <span className="text-[#A0673A]">
                      {c.uses_count}/{c.max_uses} usos
                    </span>
                  )}
                  {c.max_uses === 0 && (
                    <span className="text-[#A0673A]">{c.uses_count} usos</span>
                  )}
                  {c.valid_until && (
                    <span className="text-[#A0673A]">
                      Hasta {new Date(c.valid_until + 'T00:00').toLocaleDateString('es-AR')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggle(c.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    c.is_active
                      ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                      : 'border-green-200 text-green-600 hover:bg-green-50'
                  }`}
                >
                  {c.is_active ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => setModal({ ...c })}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#E8C8A0] text-[#7C4A2D] hover:bg-[#FDF6EC] transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={deleting === c.id}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  {deleting === c.id ? '...' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <CouponModal
          initial={modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
