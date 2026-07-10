import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTenants, createTenant, toggleTenant, type SuperadminTenant, type TenantCreatePayload } from '../../api/superadminApi'

export default function TenantsPage() {
  const [tenants, setTenants] = useState<SuperadminTenant[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  async function reload() {
    setLoading(true)
    const r = await getTenants()
    setTenants(r.data)
    setLoading(false)
  }

  useEffect(() => { reload() }, [])

  async function handleToggle(t: SuperadminTenant) {
    await toggleTenant(t.id)
    reload()
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Negocios</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo negocio
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {tenants.length === 0 ? (
            <p className="text-gray-400 text-center py-16">Sin negocios registrados.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Negocio</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Slug</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Pedidos</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Usuarios</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Alta</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/superadmin/tenants/${t.id}`}
                        className="font-semibold text-gray-800 hover:text-indigo-600 transition-colors"
                      >
                        {t.name}
                      </Link>
                      {t.profile?.phone && (
                        <p className="text-xs text-gray-400 mt-0.5">{t.profile.phone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-500">{t.slug}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-gray-700">{t.order_count ?? 0}</td>
                    <td className="px-4 py-3.5 text-right text-gray-500">{t.user_count ?? 0}</td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs">
                      {new Date(t.created_at).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleToggle(t)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                          t.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600'
                            : 'bg-red-100 text-red-600 hover:bg-green-100 hover:text-green-700'
                        }`}
                      >
                        {t.is_active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showForm && (
        <NewTenantModal
          onClose={() => setShowForm(false)}
          onCreated={() => { setShowForm(false); reload() }}
        />
      )}
    </div>
  )
}

function NewTenantModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<TenantCreatePayload>({
    name: '', slug: '', phone: '', email: '', whatsapp: '', instagram: '',
    admin_username: '', admin_password: '', admin_email: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  function set(k: keyof TenantCreatePayload, v: string) {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => { const n = { ...e }; delete n[k]; return n })
  }

  function autoSlug(name: string) {
    return name.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      const r = await createTenant(form)
      setSuccess(`Negocio creado. Usuario admin: ${r.data.admin_username}`)
      setTimeout(onCreated, 1500)
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string[]> } })?.response?.data
      if (data) {
        const mapped: Record<string, string> = {}
        for (const [k, v] of Object.entries(data)) {
          mapped[k] = Array.isArray(v) ? v[0] : String(v)
        }
        setErrors(mapped)
      }
    } finally {
      setSaving(false)
    }
  }

  const inp = (k: keyof TenantCreatePayload, placeholder: string, type = 'text') => (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        value={form[k] ?? ''}
        onChange={e => {
          set(k, e.target.value)
          if (k === 'name' && !form.slug) set('slug', autoSlug(e.target.value))
        }}
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
          errors[k] ? 'border-red-400' : 'border-gray-200'
        }`}
      />
      {errors[k] && <p className="text-red-500 text-xs mt-0.5">{errors[k]}</p>}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Nuevo negocio</h2>
          <p className="text-sm text-gray-500 mt-0.5">Crea un nuevo tenant en la plataforma</p>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="font-semibold text-gray-800">{success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Datos del negocio</p>
              <div className="space-y-2">
                {inp('name', 'Nombre del negocio *')}
                {inp('slug', 'Slug (URL) *')}
                {inp('phone', 'Teléfono')}
                {inp('email', 'Email', 'email')}
                {inp('whatsapp', 'WhatsApp')}
                {inp('instagram', 'Instagram (@usuario)')}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Usuario administrador</p>
              <div className="space-y-2">
                {inp('admin_username', 'Username *')}
                {inp('admin_password', 'Contraseña (mín. 8 caracteres) *', 'password')}
                {inp('admin_email', 'Email del admin', 'email')}
              </div>
            </div>

            {errors.non_field_errors && (
              <p className="text-red-500 text-sm">{errors.non_field_errors}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Creando...' : 'Crear negocio'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
