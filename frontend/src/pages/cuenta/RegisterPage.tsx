import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { customerRegister } from '../../api/customerApi'
import { useCustomerAuth } from '../../context/CustomerAuthContext'

export default function CustomerRegisterPage() {
  const navigate = useNavigate()
  const { login } = useCustomerAuth()

  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '', confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => { const n = { ...e }; delete n[field]; return n })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'Ingresá tu nombre.'
    if (!form.phone.trim()) newErrors.phone = 'Ingresá tu teléfono.'
    if (!form.email.trim()) newErrors.email = 'Ingresá tu email.'
    if (form.password.length < 8) newErrors.password = 'La contraseña debe tener al menos 8 caracteres.'
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden.'

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setLoading(true)
    try {
      const result = await customerRegister({
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
      })
      login(result.tokens, result.customer)
      navigate('/cuenta/pedidos', { replace: true })
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string[]> } })?.response?.data
      if (data) {
        const mapped: Record<string, string> = {}
        for (const [k, v] of Object.entries(data)) {
          mapped[k] = Array.isArray(v) ? v[0] : String(v)
        }
        setErrors(mapped)
      } else {
        setErrors({ _global: 'Ocurrió un error. Intentá de nuevo.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const inputCls = (field: string) =>
    `w-full border rounded-xl px-4 py-3 text-sm text-[#3D1A0E] bg-white placeholder-[#C4A882] focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? 'border-red-400 focus:ring-red-200'
        : 'border-[#E8C8A0] focus:ring-[#E8889A]/30 focus:border-[#E8889A]'
    }`

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="text-[#3D1A0E] font-bold text-xl">🍫 Dulceras Team</Link>
          <h1 className="text-2xl font-bold text-[#3D1A0E] mt-4 mb-1">Creá tu cuenta</h1>
          <p className="text-[#7C4A2D] text-sm">Guardá tus datos y revisá tus pedidos</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#F5E8D0] p-6 shadow-sm">
          {errors._global && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
              {errors._global}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#7C4A2D] mb-1">Nombre y apellido *</label>
              <input
                type="text"
                placeholder="Tu nombre completo"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                className={inputCls('name')}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7C4A2D] mb-1">Teléfono / WhatsApp *</label>
              <input
                type="tel"
                placeholder="11 1234-5678"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className={inputCls('phone')}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7C4A2D] mb-1">Email *</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className={inputCls('email')}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7C4A2D] mb-1">Contraseña *</label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                className={inputCls('password')}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7C4A2D] mb-1">Confirmá la contraseña *</label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Repetí la contraseña"
                value={form.confirmPassword}
                onChange={e => set('confirmPassword', e.target.value)}
                className={inputCls('confirmPassword')}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E8889A] hover:bg-[#d9768a] disabled:opacity-60 text-white font-bold py-3 rounded-full transition-colors mt-2"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta 🎉'}
            </button>
          </form>

          <p className="text-center text-sm text-[#7C4A2D] mt-5">
            ¿Ya tenés cuenta?{' '}
            <Link to="/cuenta/login" className="text-[#E8889A] font-semibold hover:underline">
              Ingresá
            </Link>
          </p>
        </div>

        <p className="text-center mt-4">
          <Link to="/" className="text-[#A0673A] text-sm hover:underline">← Volver al catálogo</Link>
        </p>
      </div>
    </div>
  )
}
