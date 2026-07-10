import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTenant, toggleTenant, updateTenantProfile, addTenantUser, type TenantDetail } from '../../api/superadminApi'

const ROLE_LABELS: Record<string, string> = {
  platform_owner: 'Platform Owner',
  tenant_admin: 'Admin',
  staff_ventas: 'Ventas',
  staff_produccion: 'Producción',
  staff_caja: 'Caja',
}

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [tenant, setTenant] = useState<TenantDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUserForm, setShowUserForm] = useState(false)

  async function reload() {
    if (!id) return
    setLoading(true)
    const r = await getTenant(Number(id))
    setTenant(r.data)
    setLoading(false)
  }

  useEffect(() => { reload() }, [id])

  async function handleToggle() {
    if (!tenant) return
    await toggleTenant(tenant.id)
    reload()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!tenant) return <p className="p-6 text-red-500">Negocio no encontrado.</p>

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/superadmin/tenants" className="hover:text-indigo-600">Negocios</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{tenant.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
          <p className="text-gray-400 font-mono text-sm mt-0.5">{tenant.slug}</p>
        </div>
        <button
          onClick={handleToggle}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tenant.is_active
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {tenant.is_active ? 'Desactivar' : 'Activar'}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{tenant.order_count ?? 0}</p>
          <p className="text-sm text-gray-500">Pedidos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            ${(tenant.revenue ?? 0).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-sm text-gray-500">Facturación</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{tenant.user_count ?? 0}</p>
          <p className="text-sm text-gray-500">Usuarios</p>
        </div>
      </div>

      {/* Profile */}
      <ProfileSection tenantId={tenant.id} profile={tenant.profile} onSaved={reload} />

      {/* Users */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Usuarios</h2>
          <button
            onClick={() => setShowUserForm(true)}
            className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
          >
            + Agregar usuario
          </button>
        </div>
        {tenant.users.length === 0 ? (
          <p className="text-gray-400 text-sm">Sin usuarios.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-gray-500 font-medium pb-2">Usuario</th>
                <th className="text-left text-gray-500 font-medium pb-2">Rol</th>
                <th className="text-left text-gray-500 font-medium pb-2">Email</th>
                <th className="text-right text-gray-500 font-medium pb-2">Alta</th>
              </tr>
            </thead>
            <tbody>
              {tenant.users.map(u => (
                <tr key={u.id} className="border-b border-gray-50">
                  <td className="py-2.5 font-medium text-gray-800">{u.username}</td>
                  <td className="py-2.5">
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="py-2.5 text-gray-500">{u.email || '—'}</td>
                  <td className="py-2.5 text-right text-gray-400 text-xs">
                    {new Date(u.date_joined).toLocaleDateString('es-AR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showUserForm && (
        <AddUserModal
          tenantId={tenant.id}
          onClose={() => setShowUserForm(false)}
          onAdded={() => { setShowUserForm(false); reload() }}
        />
      )}
    </div>
  )
}

function ProfileSection({
  tenantId, profile, onSaved,
}: {
  tenantId: number
  profile: TenantDetail['profile']
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    phone: profile?.phone ?? '',
    email: profile?.email ?? '',
    whatsapp: profile?.whatsapp ?? '',
    instagram: profile?.instagram ?? '',
    address: profile?.address ?? '',
    advance_hours_required: profile?.advance_hours_required ?? 48,
    deposit_percentage: profile?.deposit_percentage ?? '50',
    max_orders_per_day: profile?.max_orders_per_day ?? 0,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await updateTenantProfile(tenantId, form)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onSaved()
  }

  const inp = (label: string, key: keyof typeof form, type = 'text') => (
    <div>
      <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
    </div>
  )

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-800 mb-4">Configuración del negocio</h2>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {inp('Teléfono', 'phone')}
        {inp('Email', 'email', 'email')}
        {inp('WhatsApp', 'whatsapp')}
        {inp('Instagram', 'instagram')}
        {inp('Dirección', 'address')}
        {inp('Horas anticipación', 'advance_hours_required', 'number')}
        {inp('% Seña', 'deposit_percentage', 'number')}
        {inp('Máx. pedidos/día (0=sin límite)', 'max_orders_per_day', 'number')}
      </div>
      <button
        type="submit"
        disabled={saving}
        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
          saved
            ? 'bg-green-500 text-white'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'
        }`}
      >
        {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}

function AddUserModal({ tenantId, onClose, onAdded }: { tenantId: number; onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ username: '', password: '', email: '', role: 'staff_ventas' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  function set(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => { const n = { ...e }; delete n[k]; return n })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await addTenantUser(tenantId, form)
      onAdded()
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string[]> } })?.response?.data
      if (data) {
        const mapped: Record<string, string> = {}
        for (const [k, v] of Object.entries(data)) mapped[k] = Array.isArray(v) ? v[0] : String(v)
        setErrors(mapped)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-3"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-bold text-gray-900 mb-2">Agregar usuario</h2>
        {(['username', 'password', 'email'] as const).map(k => (
          <div key={k}>
            <input
              type={k === 'password' ? 'password' : k === 'email' ? 'email' : 'text'}
              placeholder={k === 'username' ? 'Username *' : k === 'password' ? 'Contraseña *' : 'Email'}
              value={form[k]}
              onChange={e => set(k, e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors[k] ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors[k] && <p className="text-red-500 text-xs mt-0.5">{errors[k]}</p>}
          </div>
        ))}
        <select
          value={form.role}
          onChange={e => set('role', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          {Object.entries(ROLE_LABELS).filter(([k]) => k !== 'platform_owner').map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {saving ? 'Guardando...' : 'Agregar'}
          </button>
        </div>
      </form>
    </div>
  )
}
