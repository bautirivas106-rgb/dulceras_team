import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { customerLogin } from '../../api/customerApi'
import { useCustomerAuth } from '../../context/CustomerAuthContext'

export default function CustomerLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useCustomerAuth()
  const from = (location.state as { from?: string })?.from || '/cuenta/pedidos'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await customerLogin(form.email, form.password)
      login(result.tokens, result.customer)
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg || 'Email o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full border border-[#E8C8A0] rounded-xl px-4 py-3 text-sm text-[#3D1A0E] bg-white placeholder-[#C4A882] focus:outline-none focus:ring-2 focus:ring-[#E8889A]/30 focus:border-[#E8889A]'

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="text-[#3D1A0E] font-bold text-xl">🍫 Dulceras Team</Link>
          <h1 className="text-2xl font-bold text-[#3D1A0E] mt-4 mb-1">Ingresá a tu cuenta</h1>
          <p className="text-[#7C4A2D] text-sm">Revisá tus pedidos y datos</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#F5E8D0] p-6 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#7C4A2D] mb-1">Email</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7C4A2D] mb-1">Contraseña</label>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className={inputCls}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E8889A] hover:bg-[#d9768a] disabled:opacity-60 text-white font-bold py-3 rounded-full transition-colors mt-2"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-sm text-[#7C4A2D] mt-5">
            ¿No tenés cuenta?{' '}
            <Link to="/cuenta/registro" className="text-[#E8889A] font-semibold hover:underline">
              Registrate
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
