import { type FormEvent, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/admin/dashboard')
    } catch {
      setError('Usuario o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen font-poppins flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#FDF6EC' }}
    >
      {/* Aurora sutil de fondo */}
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
          <img
            src="/brand/logo-icon.png"
            alt="Dulceras Team"
            style={{ height: 64, width: 'auto', marginBottom: 12 }}
          />
          <img
            src="/brand/logo-wordmark.png"
            alt="Dulceras Team"
            style={{ height: 48, width: 'auto', marginBottom: 8 }}
          />
          <p className="text-brown-soft text-sm font-medium">Panel de administración</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl space-y-5"
          style={{ padding: '32px 28px', boxShadow: '0 10px 40px rgba(58,36,23,0.10)' }}
        >
          {error && (
            <div
              className="flex items-center gap-2.5 text-sm rounded-xl px-4 py-3"
              style={{ background: '#FFF0F0', border: '1px solid rgba(226,133,175,0.3)', color: '#9B2335' }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <div>
            <label
              className="block text-sm font-medium text-brown-soft mb-1.5"
            >
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              placeholder="tu_usuario"
              className="w-full text-sm outline-none rounded-xl px-4 py-2.5"
              style={{
                border: '1.5px solid rgba(58,36,23,0.15)',
                color: '#3A2417',
                background: '#fff',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#E285AF')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(58,36,23,0.15)')}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-brown-soft mb-1.5"
            >
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full text-sm outline-none rounded-xl px-4 py-2.5"
              style={{
                border: '1.5px solid rgba(58,36,23,0.15)',
                color: '#3A2417',
                background: '#fff',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#E285AF')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(58,36,23,0.15)')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-sm font-semibold text-white rounded-xl py-3"
            style={{
              background: loading
                ? 'rgba(226,133,175,0.6)'
                : 'linear-gradient(135deg, #F0A0C4, #E285AF)',
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
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-sm text-brown-soft mt-5">
          ¿Todavía no tenés cuenta?{' '}
          <Link to="/register" className="font-semibold no-underline" style={{ color: '#E285AF' }}>
            Registrá tu negocio
          </Link>
        </p>
      </div>
    </div>
  )
}
