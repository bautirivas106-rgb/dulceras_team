import { useEffect, useState } from 'react'
import { getSettings, updateSettings, getDeliveryZones, createDeliveryZone, updateDeliveryZone, deleteDeliveryZone, type TenantSettings, type DeliveryZone } from '../../../api/settingsApi'

type FormState = Omit<TenantSettings, 'slug'>

export default function SettingsPage() {
  const [form, setForm] = useState<FormState | null>(null)
  const [slug, setSlug] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getSettings().then(r => {
      const { slug, ...rest } = r.data
      setSlug(slug)
      setForm(rest)
    }).catch(() => setError('No se pudo cargar la configuración.'))
  }, [])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => f ? { ...f, [key]: value } : f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    setError('')
    try {
      await updateSettings(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('No se pudo guardar. Revisá los datos.')
    } finally {
      setSaving(false)
    }
  }

  if (!form) return (
    <div className="flex items-center justify-center h-64">
      {error
        ? <p className="text-red-500">{error}</p>
        : <div className="w-8 h-8 border-4 border-[#E8889A] border-t-transparent rounded-full animate-spin" />
      }
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Configuración</h1>
          <p className="text-sm text-gray-400 mt-0.5 font-mono">{slug}</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-[#3D1A0E] text-white hover:bg-[#5C2A18] disabled:opacity-50'
          }`}
        >
          {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {/* Sección: Negocio */}
      <Section title="Negocio">
        <Field label="Nombre del negocio" required>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            required
            className={inputCls}
            placeholder="Dulceras Team"
          />
        </Field>
        <Field label="Dirección">
          <input
            type="text"
            value={form.address}
            onChange={e => set('address', e.target.value)}
            className={inputCls}
            placeholder="Almagro, CABA"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Teléfono">
            <input
              type="text"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              className={inputCls}
              placeholder="+54 11 1234-5678"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              className={inputCls}
              placeholder="hola@negocio.com"
            />
          </Field>
        </div>
      </Section>

      {/* Sección: Contacto y redes */}
      <Section title="Contacto y redes">
        <div className="grid grid-cols-2 gap-4">
          <Field label="WhatsApp" hint="Número con código de país, sin +">
            <input
              type="text"
              value={form.whatsapp}
              onChange={e => set('whatsapp', e.target.value)}
              className={inputCls}
              placeholder="5491112345678"
            />
          </Field>
          <Field label="Instagram" hint="Solo el @usuario">
            <input
              type="text"
              value={form.instagram}
              onChange={e => set('instagram', e.target.value)}
              className={inputCls}
              placeholder="@dulceras.team"
            />
          </Field>
        </div>
      </Section>

      {/* Sección: Operación */}
      <Section title="Operación">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Horas de anticipación mínima" hint="Aplica a todos los productos por defecto">
            <input
              type="number"
              min={0}
              value={form.advance_hours_required}
              onChange={e => set('advance_hours_required', Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="% de seña" hint="Porcentaje del total que paga el cliente al confirmar">
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={form.deposit_percentage}
                onChange={e => set('deposit_percentage', e.target.value)}
                className={inputCls + ' pr-8'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
          </Field>
          <Field label="Máx. pedidos por día" hint="0 = sin límite">
            <input
              type="number"
              min={0}
              value={form.max_orders_per_day}
              onChange={e => set('max_orders_per_day', Number(e.target.value))}
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      {/* Sección: Zonas de entrega */}
      <ZonesSection />
    </form>
  )
}

const inputCls = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8889A] focus:border-transparent bg-white'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, hint, required, children }: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-[#E8889A] ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

const EMPTY_ZONE = { name: '', description: '', price: '0', is_active: true }

function ZonesSection() {
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [adding, setAdding] = useState(false)
  const [newZone, setNewZone] = useState({ ...EMPTY_ZONE })
  const [editId, setEditId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<DeliveryZone>>({})
  const [saving, setSaving] = useState(false)

  async function reload() {
    const r = await getDeliveryZones()
    setZones(r.data)
  }

  useEffect(() => { reload() }, [])

  async function handleAdd() {
    setSaving(true)
    await createDeliveryZone({ ...newZone, price: newZone.price })
    setNewZone({ ...EMPTY_ZONE })
    setAdding(false)
    setSaving(false)
    reload()
  }

  async function handleSaveEdit(id: number) {
    setSaving(true)
    await updateDeliveryZone(id, editData)
    setEditId(null)
    setSaving(false)
    reload()
  }

  async function handleToggle(zone: DeliveryZone) {
    await updateDeliveryZone(zone.id, { is_active: !zone.is_active })
    reload()
  }

  async function handleDelete(zone: DeliveryZone) {
    if (!confirm(`¿Eliminar zona "${zone.name}"?`)) return
    await deleteDeliveryZone(zone.id)
    reload()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Zonas de entrega</h2>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-sm bg-[#F7D0D8] text-[#3D1A0E] px-3 py-1.5 rounded-lg font-medium hover:bg-[#E8889A] hover:text-white transition-colors"
        >
          + Nueva zona
        </button>
      </div>

      {zones.length === 0 && !adding && (
        <p className="text-sm text-gray-400 text-center py-6">Sin zonas configuradas. El checkout solo ofrecerá retiro en local.</p>
      )}

      <div className="space-y-2">
        {zones.map(zone => (
          <div key={zone.id} className={`border rounded-xl p-3.5 transition-colors ${zone.is_active ? 'border-gray-100' : 'border-gray-100 bg-gray-50'}`}>
            {editId === zone.id ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={editData.name ?? zone.name}
                    onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                    className={inputCls}
                    placeholder="Nombre"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      min={0}
                      value={editData.price ?? zone.price}
                      onChange={e => setEditData(d => ({ ...d, price: e.target.value }))}
                      className={inputCls + ' pl-6'}
                    />
                  </div>
                </div>
                <input
                  value={editData.description ?? zone.description}
                  onChange={e => setEditData(d => ({ ...d, description: e.target.value }))}
                  className={inputCls}
                  placeholder="Descripción (opcional)"
                />
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setEditId(null)} className="text-sm text-gray-500 px-3 py-1.5 hover:bg-gray-100 rounded-lg">Cancelar</button>
                  <button type="button" onClick={() => handleSaveEdit(zone.id)} disabled={saving} className="text-sm bg-[#3D1A0E] text-white px-4 py-1.5 rounded-lg hover:bg-[#5C2A18] disabled:opacity-50">
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium text-sm ${zone.is_active ? 'text-gray-800' : 'text-gray-400 line-through'}`}>{zone.name}</span>
                    {!zone.is_active && <span className="text-xs text-gray-400">(inactiva)</span>}
                  </div>
                  {zone.description && <p className="text-xs text-gray-400 truncate mt-0.5">{zone.description}</p>}
                </div>
                <span className="font-semibold text-sm text-gray-700 whitespace-nowrap">
                  {Number(zone.price) === 0 ? 'Gratis' : `$${Number(zone.price).toLocaleString('es-AR')}`}
                </span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => { setEditId(zone.id); setEditData({}) }} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Editar">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button type="button" onClick={() => handleToggle(zone)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title={zone.is_active ? 'Desactivar' : 'Activar'}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={zone.is_active ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} /></svg>
                  </button>
                  <button type="button" onClick={() => handleDelete(zone)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {adding && (
          <div className="border border-[#E8889A]/40 rounded-xl p-3.5 bg-pink-50/30 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                autoFocus
                value={newZone.name}
                onChange={e => setNewZone(z => ({ ...z, name: e.target.value }))}
                className={inputCls}
                placeholder="Nombre (ej: Almagro) *"
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  min={0}
                  value={newZone.price}
                  onChange={e => setNewZone(z => ({ ...z, price: e.target.value }))}
                  className={inputCls + ' pl-6'}
                  placeholder="Precio"
                />
              </div>
            </div>
            <input
              value={newZone.description}
              onChange={e => setNewZone(z => ({ ...z, description: e.target.value }))}
              className={inputCls}
              placeholder="Descripción (opcional, ej: CABA zona norte)"
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setAdding(false); setNewZone({ ...EMPTY_ZONE }) }} className="text-sm text-gray-500 px-3 py-1.5 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button type="button" onClick={handleAdd} disabled={saving || !newZone.name} className="text-sm bg-[#3D1A0E] text-white px-4 py-1.5 rounded-lg hover:bg-[#5C2A18] disabled:opacity-50">
                {saving ? 'Guardando...' : 'Agregar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
