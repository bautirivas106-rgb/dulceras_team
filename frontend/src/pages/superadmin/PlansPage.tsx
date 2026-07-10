import { useEffect, useState } from 'react'
import { getPlans, createPlan, updatePlan, deletePlan, type Plan } from '../../api/superadminApi'

const EMPTY: Omit<Plan, 'id' | 'tenant_count' | 'created_at'> = {
  name: '', slug: '', price_monthly: '0', description: '',
  max_products: 0, max_users: 0, max_orders_per_day: 0,
  has_mp_integration: true, has_whatsapp: false, is_active: true,
}

function limitLabel(n: number) {
  return n === 0 ? '∞' : String(n)
}

function PlanModal({
  plan, onClose, onSaved,
}: {
  plan: Plan | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<Omit<Plan, 'id' | 'tenant_count' | 'created_at'>>(
    plan
      ? { name: plan.name, slug: plan.slug, price_monthly: plan.price_monthly, description: plan.description,
          max_products: plan.max_products, max_users: plan.max_users, max_orders_per_day: plan.max_orders_per_day,
          has_mp_integration: plan.has_mp_integration, has_whatsapp: plan.has_whatsapp, is_active: plan.is_active }
      : { ...EMPTY }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSave() {
    if (!form.name.trim() || !form.slug.trim()) {
      setError('Nombre y slug son obligatorios.')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (plan) {
        await updatePlan(plan.id, form)
      } else {
        await createPlan(form)
      }
      onSaved()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: Record<string, string[]> } })?.response?.data
      setError(msg ? Object.values(msg).flat().join(' ') : 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8889A]/40'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 mb-5">{plan ? 'Editar plan' : 'Nuevo plan'}</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Nombre *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} placeholder="Pro" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Slug *</label>
              <input value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} className={inputCls} placeholder="pro" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Precio mensual (ARS)</label>
            <input type="number" min={0} value={form.price_monthly} onChange={e => set('price_monthly', e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Descripción</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className={inputCls + ' resize-none'} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Máx. productos</label>
              <input type="number" min={0} value={form.max_products} onChange={e => set('max_products', Number(e.target.value))} className={inputCls} />
              <p className="text-[10px] text-gray-400 mt-0.5">0 = ilimitado</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Máx. usuarios</label>
              <input type="number" min={0} value={form.max_users} onChange={e => set('max_users', Number(e.target.value))} className={inputCls} />
              <p className="text-[10px] text-gray-400 mt-0.5">0 = ilimitado</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Máx. pedidos/día</label>
              <input type="number" min={0} value={form.max_orders_per_day} onChange={e => set('max_orders_per_day', Number(e.target.value))} className={inputCls} />
              <p className="text-[10px] text-gray-400 mt-0.5">0 = ilimitado</p>
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.has_mp_integration} onChange={e => set('has_mp_integration', e.target.checked)} className="accent-[#E8889A]" />
              <span className="text-sm text-gray-700">Mercado Pago</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.has_whatsapp} onChange={e => set('has_whatsapp', e.target.checked)} className="accent-[#E8889A]" />
              <span className="text-sm text-gray-700">WhatsApp</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="accent-[#E8889A]" />
              <span className="text-sm text-gray-700">Activo</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm bg-[#3D1A0E] text-white rounded-lg hover:bg-[#5C2A18] disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<Plan | null | 'new'>(null)

  async function reload() {
    setLoading(true)
    try {
      const r = await getPlans()
      setPlans(r.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { reload() }, [])

  async function handleDelete(plan: Plan) {
    if (plan.tenant_count > 0) {
      alert(`El plan "${plan.name}" tiene ${plan.tenant_count} negocio(s) asignado(s). Reasignálos antes de eliminar.`)
      return
    }
    if (!confirm(`¿Eliminar el plan "${plan.name}"?`)) return
    await deletePlan(plan.id)
    reload()
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Planes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Definí los planes de suscripción disponibles para los negocios.</p>
        </div>
        <button
          onClick={() => setModal('new')}
          className="flex items-center gap-2 bg-[#3D1A0E] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#5C2A18] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo plan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-[#E8889A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div key={plan.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-4 ${plan.is_active ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                    {!plan.is_active && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactivo</span>}
                  </div>
                  <p className="text-2xl font-bold text-[#3D1A0E]">
                    {Number(plan.price_monthly) === 0
                      ? 'Gratis'
                      : `$${Number(plan.price_monthly).toLocaleString('es-AR')}`}
                    {Number(plan.price_monthly) > 0 && <span className="text-sm font-normal text-gray-400">/mes</span>}
                  </p>
                </div>
                <span className="text-xs bg-[#F7D0D8] text-[#7C4A2D] px-2 py-1 rounded-full font-medium">
                  {plan.tenant_count} negocio{plan.tenant_count !== 1 ? 's' : ''}
                </span>
              </div>

              {plan.description && (
                <p className="text-sm text-gray-500 leading-relaxed">{plan.description}</p>
              )}

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Productos</span>
                  <span className="font-semibold text-gray-800">{limitLabel(plan.max_products)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Usuarios</span>
                  <span className="font-semibold text-gray-800">{limitLabel(plan.max_users)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Pedidos/día</span>
                  <span className="font-semibold text-gray-800">{limitLabel(plan.max_orders_per_day)}</span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {plan.has_mp_integration && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Mercado Pago</span>
                )}
                {plan.has_whatsapp && (
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">WhatsApp</span>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-50 mt-auto">
                <button
                  onClick={() => setModal(plan)}
                  className="flex-1 text-sm text-gray-600 border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(plan)}
                  className="flex-1 text-sm text-red-500 border border-red-100 rounded-lg py-1.5 hover:bg-red-50 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}

          {plans.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p>Sin planes configurados.</p>
            </div>
          )}
        </div>
      )}

      {modal && (
        <PlanModal
          plan={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); reload() }}
        />
      )}
    </div>
  )
}
