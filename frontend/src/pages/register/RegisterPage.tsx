import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublicPlans, registerTenant, type PublicPlan, type RegisterPayload } from '../../api/registerApi'

const STEPS = ['Elegí un plan', 'Tu negocio', 'Tu cuenta'] as const

function limitLabel(n: number) {
  return n === 0 ? '∞' : String(n)
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
            i < current ? 'bg-[#E8889A] text-white' :
            i === current ? 'bg-[#3D1A0E] text-white' :
            'bg-gray-100 text-gray-400'
          }`}>
            {i < current ? '✓' : i + 1}
          </div>
          <span className={`text-xs font-medium hidden sm:block ${i === current ? 'text-gray-800' : 'text-gray-400'}`}>
            {label}
          </span>
          {i < STEPS.length - 1 && <div className="w-6 h-px bg-gray-200 mx-1" />}
        </div>
      ))}
    </div>
  )
}

function Step1Plans({
  plans, selected, onSelect, onNext,
}: {
  plans: PublicPlan[]
  selected: number | null
  onSelect: (id: number | null) => void
  onNext: () => void
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Elegí tu plan</h2>
      <p className="text-sm text-gray-500 mb-5">Podés cambiarlo después desde el superadmin.</p>

      <div className="space-y-3 mb-6">
        {plans.map(plan => (
          <button
            key={plan.id}
            type="button"
            onClick={() => onSelect(plan.id)}
            className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
              selected === plan.id
                ? 'border-[#E8889A] bg-[#FDF6EC]'
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900">{plan.name}</span>
                  {plan.has_mp_integration && (
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">Mercado Pago</span>
                  )}
                  {plan.has_whatsapp && (
                    <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">WhatsApp</span>
                  )}
                </div>
                {plan.description && (
                  <p className="text-xs text-gray-500 mb-2">{plan.description}</p>
                )}
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>{limitLabel(plan.max_products)} productos</span>
                  <span>{limitLabel(plan.max_users)} usuarios</span>
                  <span>{limitLabel(plan.max_orders_per_day)} pedidos/día</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-[#3D1A0E] text-lg">
                  {Number(plan.price_monthly) === 0
                    ? 'Gratis'
                    : `$${Number(plan.price_monthly).toLocaleString('es-AR')}`}
                </p>
                {Number(plan.price_monthly) > 0 && (
                  <p className="text-xs text-gray-400">/mes</p>
                )}
              </div>
            </div>
          </button>
        ))}

        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
            selected === null
              ? 'border-[#E8889A] bg-[#FDF6EC]'
              : 'border-gray-100 bg-white hover:border-gray-200'
          }`}
        >
          <span className="font-medium text-gray-600 text-sm">Sin plan por ahora</span>
          <p className="text-xs text-gray-400 mt-0.5">Podés asignarte un plan después.</p>
        </button>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-[#3D1A0E] text-white font-semibold py-3 rounded-xl text-sm hover:bg-[#5C2A18] transition-colors"
      >
        Continuar
      </button>
    </div>
  )
}

function Step2Business({
  data, onChange, onNext, onBack,
}: {
  data: { name: string; slug: string; phone: string; email: string }
  onChange: (k: keyof typeof data, v: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  function autoSlug(name: string) {
    return name.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 50)
  }

  function handleNameChange(v: string) {
    onChange('name', v)
    if (!data.slug || data.slug === autoSlug(data.name)) {
      onChange('slug', autoSlug(v))
    }
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!data.name.trim()) errs.name = 'El nombre es obligatorio.'
    if (!data.slug.trim()) errs.slug = 'El slug es obligatorio.'
    else if (!/^[a-z0-9-]+$/.test(data.slug)) errs.slug = 'Solo minúsculas, números y guiones.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleNext() {
    if (validate()) onNext()
  }

  const inp = (label: string, key: keyof typeof data, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={data[key]}
        onChange={e => {
          if (key === 'name') handleNameChange(e.target.value)
          else onChange(key, e.target.value)
          setErrors(er => { const n = { ...er }; delete n[key]; return n })
        }}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8889A]/40 ${
          errors[key] ? 'border-red-400' : 'border-gray-200'
        }`}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-0.5">{errors[key]}</p>}
    </div>
  )

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Tu negocio</h2>
      <p className="text-sm text-gray-500 mb-5">Estos datos los podés editar después desde la configuración.</p>

      <div className="space-y-4 mb-6">
        {inp('Nombre del negocio *', 'name', 'text', 'Ej: La Pastelería de Román')}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Slug (URL única) *</label>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#E8889A]/40">
            <span className="bg-gray-50 text-gray-400 text-xs px-3 py-2.5 border-r border-gray-200 whitespace-nowrap">
              dulceras.saas/
            </span>
            <input
              type="text"
              value={data.slug}
              onChange={e => {
                onChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                setErrors(er => { const n = { ...er }; delete n.slug; return n })
              }}
              placeholder="mi-negocio"
              className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
            />
          </div>
          {errors.slug && <p className="text-red-500 text-xs mt-0.5">{errors.slug}</p>}
        </div>
        {inp('Teléfono', 'phone', 'tel', '+54 11 1234-5678')}
        {inp('Email del negocio', 'email', 'email', 'contacto@minegocio.com')}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors"
        >
          Atrás
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 bg-[#3D1A0E] text-white font-semibold py-3 rounded-xl text-sm hover:bg-[#5C2A18] transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}

function Step3Account({
  data, onChange, onSubmit, onBack, loading, errors,
}: {
  data: { admin_username: string; admin_password: string; admin_password2: string; admin_email: string }
  onChange: (k: keyof typeof data, v: string) => void
  onSubmit: () => void
  onBack: () => void
  loading: boolean
  errors: Record<string, string>
}) {
  const inp = (label: string, key: keyof typeof data, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={data[key]}
        onChange={e => onChange(key, e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8889A]/40 ${
          errors[key] ? 'border-red-400' : 'border-gray-200'
        }`}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-0.5">{errors[key]}</p>}
    </div>
  )

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Tu cuenta de admin</h2>
      <p className="text-sm text-gray-500 mb-5">Con estos datos vas a ingresar al panel de tu negocio.</p>

      <div className="space-y-4 mb-6">
        {inp('Usuario *', 'admin_username', 'text', 'roman_admin')}
        {inp('Contraseña *', 'admin_password', 'password', 'Mínimo 8 caracteres')}
        {inp('Repetir contraseña *', 'admin_password2', 'password', '')}
        {inp('Email (opcional)', 'admin_email', 'email', 'roman@minegocio.com')}
      </div>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {errors.general}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors"
        >
          Atrás
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 bg-[#3D1A0E] text-white font-semibold py-3 rounded-xl text-sm hover:bg-[#5C2A18] transition-colors disabled:opacity-60"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </div>
    </div>
  )
}

function SuccessScreen({ result }: { result: { tenant_name: string; admin_username: string } }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">¡Cuenta creada!</h2>
      <p className="text-gray-500 text-sm mb-6">
        Tu negocio <strong className="text-gray-800">{result.tenant_name}</strong> ya está listo.
        Ingresá con el usuario <strong className="text-gray-800">{result.admin_username}</strong>.
      </p>
      <Link
        to="/admin/login"
        className="inline-block bg-[#3D1A0E] text-white font-semibold px-8 py-3 rounded-xl text-sm hover:bg-[#5C2A18] transition-colors"
      >
        Ir al login
      </Link>
    </div>
  )
}

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [plans, setPlans] = useState<PublicPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [business, setBusiness] = useState({ name: '', slug: '', phone: '', email: '' })
  const [account, setAccount] = useState({ admin_username: '', admin_password: '', admin_password2: '', admin_email: '' })
  const [loading, setLoading] = useState(false)
  const [accountErrors, setAccountErrors] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ tenant_name: string; admin_username: string } | null>(null)

  useEffect(() => {
    getPublicPlans().then(r => {
      setPlans(r.data)
      if (r.data.length > 0) setSelectedPlan(r.data[0].id)
    }).catch(() => {})
  }, [])

  async function handleSubmit() {
    const errs: Record<string, string> = {}
    if (!account.admin_username.trim()) errs.admin_username = 'El usuario es obligatorio.'
    if (!account.admin_password) errs.admin_password = 'La contraseña es obligatoria.'
    else if (account.admin_password.length < 8) errs.admin_password = 'Mínimo 8 caracteres.'
    if (account.admin_password !== account.admin_password2) errs.admin_password2 = 'Las contraseñas no coinciden.'
    if (Object.keys(errs).length > 0) { setAccountErrors(errs); return }

    setLoading(true)
    setAccountErrors({})
    try {
      const payload: RegisterPayload = {
        name: business.name,
        slug: business.slug,
        phone: business.phone,
        email: business.email,
        admin_username: account.admin_username,
        admin_password: account.admin_password,
        admin_email: account.admin_email,
        plan_id: selectedPlan,
      }
      const r = await registerTenant(payload)
      setResult({ tenant_name: r.data.tenant_name, admin_username: r.data.admin_username })
    } catch (e: unknown) {
      const data = (e as { response?: { data?: Record<string, string[]> } })?.response?.data
      if (data) {
        const mapped: Record<string, string> = {}
        for (const [k, v] of Object.entries(data)) {
          const key = k === 'admin_username' ? 'admin_username'
            : k === 'admin_password' ? 'admin_password'
            : k === 'slug' ? 'general'
            : 'general'
          mapped[key] = Array.isArray(v) ? v[0] : String(v)
        }
        setAccountErrors(mapped)
        if (mapped.slug) {
          setAccountErrors({ general: 'El slug del negocio ya está en uso. Volvé al paso anterior y cambialo.' })
        }
      } else {
        setAccountErrors({ general: 'Ocurrió un error. Intentá de nuevo.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🎂</div>
          <h1 className="text-2xl font-bold text-[#3D1A0E]">Crear negocio</h1>
          <p className="text-sm text-gray-500 mt-1">Empezá a vender en minutos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          {result ? (
            <SuccessScreen result={result} />
          ) : (
            <>
              <StepIndicator current={step} />
              {step === 0 && (
                <Step1Plans
                  plans={plans}
                  selected={selectedPlan}
                  onSelect={setSelectedPlan}
                  onNext={() => setStep(1)}
                />
              )}
              {step === 1 && (
                <Step2Business
                  data={business}
                  onChange={(k, v) => setBusiness(b => ({ ...b, [k]: v }))}
                  onNext={() => setStep(2)}
                  onBack={() => setStep(0)}
                />
              )}
              {step === 2 && (
                <Step3Account
                  data={account}
                  onChange={(k, v) => setAccount(a => ({ ...a, [k]: v }))}
                  onSubmit={handleSubmit}
                  onBack={() => setStep(1)}
                  loading={loading}
                  errors={accountErrors}
                />
              )}
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link to="/admin/login" className="text-[#E8889A] font-medium hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
