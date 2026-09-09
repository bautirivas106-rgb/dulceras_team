import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { customerRegister } from '../../api/customerApi'
import { useCustomerAuth } from '../../context/CustomerAuthContext'

export default function CustomerRegisterPage() {
  const navigate = useNavigate()
  const { login } = useCustomerAuth()

  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirmPassword: '' })
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
    if (form.password.length < 8) newErrors.password = 'Mínimo 8 caracteres.'
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden.'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setLoading(true)
    try {
      const result = await customerRegister({
        name: form.name, phone: form.phone, email: form.email, password: form.password,
      })
      login(result.tokens, result.customer)
      navigate('/cuenta/pedidos', { replace: true })
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string[]> } })?.response?.data
      if (data) {
        const mapped: Record<string, string> = {}
        for (const [k, v] of Object.entries(data)) mapped[k] = Array.isArray(v) ? v[0] : String(v)
        setErrors(mapped)
      } else {
        setErrors({ _global: 'Ocurrió un error. Intentá de nuevo.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const baseInputStyle = {
    border: '1.5px solid rgba(58,36,23,0.15)',
    color: '#3A2417',
    background: '#fff',
    transition: 'border-color 0.2s',
  }
  const errorInputStyle = {
    ...baseInputStyle,
    border: '1.5px solid #F87171',
  }

  function Input({ field, type = 'text', placeholder, autoComplete }: {
    field: string; type?: string; placeholder: string; autoComplete?: string
  }) {
    return (
      <input
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={form[field as keyof typeof form]}
        onChange={e => set(field, e.target.value)}
        className="w-full text-sm outline-none rounded-xl px-4 py-2.5"
        style={errors[field] ? errorInputStyle : baseInputStyle}
        onFocus={e => { e.currentTarget.style.borderColor = errors[field] ? '#F87171' : '#E285AF' }}
        onBlur={e => { e.currentTarget.style.borderColor = errors[field] ? '#F87171' : 'rgba(58,36,23,0.15)' }}
      />
    )
  }

  return (
    <div
      className="min-h-screen font-poppins flex items-center justify-center p-4 py-10 relative overflow-hidden"
      style={{ background: '#FDF6EC' }}
    >
      {/* Aurora */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `
            repeating-linear-gradient(100deg, #FDF6EC 0%, #FDF6EC 7%, transparent 10%, transparent 12%, #FDF6EC 16%),
            repeating-linear-gradient(100deg, #F0A0C4 10%, #E285AF 15%, #EFE2CB 20%, #F7C4DD 25%, #F0A0C4 30%)
          `,
          backgroundSize: '300% 200%, 200% 100%',
          backgroundPosition: '50% 50%, 50% 50%',
          filter: 'blur(40px)',
          opacity: 0.2,
          animation: 'aurora-move 60s linear infinite',
          maskImage: 'radial-gradient(ellipse at 50% 0%, black 10%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, black 10%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-sm relative" style={{ zIndex: 1 }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/brand/logo-icon.png" alt="Dulceras Team" style={{ height: 64, width: 'auto', marginBottom: 12 }} />
          <img src="/brand/logo-wordmark.png" alt="Dulceras Team" style={{ height: 48, width: 'auto', marginBottom: 8 }} />
          <p className="text-brown-soft text-sm font-medium">Creá tu cuenta de cliente</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl space-y-4"
          style={{ padding: '32px 28px', boxShadow: '0 10px 40px rgba(58,36,23,0.10)' }}
        >
          {errors._global && (
            <div
              className="flex items-center gap-2.5 text-sm rounded-xl px-4 py-3"
              style={{ background: '#FFF0F0', border: '1px solid rgba(226,133,175,0.3)', color: '#9B2335' }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {errors._global}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-brown-soft mb-1.5">Nombre y apellido *</label>
            <Input field="name" placeholder="Tu nombre completo" autoComplete="name" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-soft mb-1.5">Teléfono / WhatsApp *</label>
            <Input field="phone" type="tel" placeholder="11 1234-5678" autoComplete="tel" />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-soft mb-1.5">Email *</label>
            <Input field="email" type="email" placeholder="tu@email.com" autoComplete="email" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-soft mb-1.5">Contraseña *</label>
            <Input field="password" type="password" placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-soft mb-1.5">Confirmá la contraseña *</label>
            <Input field="confirmPassword" type="password" placeholder="Repetí la contraseña" autoComplete="new-password" />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-sm font-semibold text-white rounded-xl py-3 mt-1"
            style={{
              background: loading ? 'rgba(226,133,175,0.6)' : 'linear-gradient(135deg, #F0A0C4, #E285AF)',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 6px 18px rgba(226,133,175,0.45)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 10px 22px rgba(226,133,175,0.55)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = loading ? 'none' : '0 6px 18px rgba(226,133,175,0.45)'
            }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-brown-soft mt-5">
          ¿Ya tenés cuenta?{' '}
          <Link to="/cuenta/login" className="font-semibold no-underline" style={{ color: '#E285AF' }}>
            Ingresá
          </Link>
        </p>
        <p className="text-center mt-3">
          <Link to="/" className="text-sm text-brown-soft no-underline hover:underline">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  )
}
