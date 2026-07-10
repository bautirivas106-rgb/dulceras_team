import { useEffect, useState } from 'react'
import { getSettings, updateSettings, type TenantSettings } from '../../../api/settingsApi'

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
