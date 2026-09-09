import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, CalendarDays, LogOut, Pencil, ChevronRight, Star } from 'lucide-react'
import { getCustomerOrders, updateCustomerProfile, submitReview, getReviews, type Review } from '../../api/customerApi'
import { useCustomerAuth } from '../../context/CustomerAuthContext'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  pending_deposit: 'Esperando seña',
  deposit_paid: 'Seña pagada',
  confirmed: 'Confirmado',
  in_production: 'En producción',
  ready: 'Listo',
  out_for_delivery: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  refunded: 'Reintegrado',
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending_deposit:  { bg: 'rgba(251,191,36,0.15)',  color: '#92660A' },
  deposit_paid:     { bg: 'rgba(96,165,250,0.15)',  color: '#1D56A0' },
  confirmed:        { bg: 'rgba(52,211,153,0.15)',  color: '#0D7A54' },
  in_production:    { bg: 'rgba(167,139,250,0.15)', color: '#6030B0' },
  ready:            { bg: 'rgba(240,160,196,0.25)', color: '#A04070' },
  out_for_delivery: { bg: 'rgba(45,212,191,0.15)',  color: '#0E7C72' },
  delivered:        { bg: 'rgba(58,36,23,0.07)',    color: '#7A5C4A' },
  cancelled:        { bg: 'rgba(248,113,113,0.12)', color: '#9B2335' },
  refunded:         { bg: 'rgba(58,36,23,0.07)',    color: '#7A5C4A' },
}

interface Order {
  id: number
  status: string
  status_display: string
  required_date: string
  total: string
  deposit_amount: string
  balance_amount: string
  discount_amount: string
  created_at: string
}

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1.5px solid rgba(58,36,23,0.15)', borderRadius: 12,
  padding: '10px 14px', fontSize: '0.875rem', color: '#3A2417', background: '#fff',
  outline: 'none', transition: 'border-color 0.2s', fontFamily: 'Poppins, sans-serif',
}

function EditProfileModal({
  initial, onSave, onClose,
}: {
  initial: { name: string; phone: string }
  onSave: (data: { name: string; phone: string }) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try { await onSave(form); onClose() } finally { setSaving(false) }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 380, padding: '28px 24px', boxShadow: '0 20px 60px rgba(58,36,23,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, color: '#3A2417', marginTop: 0, marginBottom: 20, fontSize: '1.2rem' }}>
          Editar datos
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#5A3B29', marginBottom: 6, fontFamily: 'Poppins, sans-serif' }}>Nombre</label>
            <input
              style={inputStyle}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onFocus={e => (e.currentTarget.style.borderColor = '#E285AF')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(58,36,23,0.15)')}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#5A3B29', marginBottom: 6, fontFamily: 'Poppins, sans-serif' }}>Teléfono</label>
            <input
              style={inputStyle}
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              onFocus={e => (e.currentTarget.style.borderColor = '#E285AF')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(58,36,23,0.15)')}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, border: '1.5px solid rgba(58,36,23,0.15)', background: 'transparent',
                color: '#5A3B29', borderRadius: 100, padding: '10px 0',
                fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                color: '#fff', borderRadius: 100, padding: '10px 0',
                fontSize: '0.875rem', fontWeight: 600,
                background: saving ? 'rgba(226,133,175,0.6)' : 'linear-gradient(135deg, #F0A0C4, #E285AF)',
                boxShadow: saving ? 'none' : '0 4px 14px rgba(226,133,175,0.4)',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CustomerOrdersPage() {
  const { customer, isLoggedIn, logout, setCustomer } = useCustomerAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState(false)
  const [myReviews, setMyReviews] = useState<Review[]>([])
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewHover, setReviewHover] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewSaving, setReviewSaving] = useState(false)
  const [reviewDone, setReviewDone] = useState(false)
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    if (!isLoggedIn) { navigate('/cuenta/login', { state: { from: '/cuenta/pedidos' } }); return }
    getCustomerOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
    getReviews().then(all => setMyReviews(all)).catch(() => {})
  }, [isLoggedIn, navigate])

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reviewText.trim()) { setReviewError('Escribí algo en la reseña.'); return }
    setReviewSaving(true)
    setReviewError('')
    try {
      const r = await submitReview({ rating: reviewRating, text: reviewText.trim() })
      setMyReviews(prev => [r, ...prev])
      setReviewDone(true)
      setReviewText('')
    } catch {
      setReviewError('No se pudo enviar. Intentá de nuevo.')
    } finally {
      setReviewSaving(false)
    }
  }

  async function handleProfileUpdate(data: { name: string; phone: string }) {
    const updated = await updateCustomerProfile(data)
    setCustomer(updated)
  }

  if (!isLoggedIn) return null

  return (
    <div style={{ minHeight: '100vh', background: '#FDF6EC', fontFamily: 'Poppins, sans-serif' }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(253,246,236,0.9)', backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(58,36,23,0.08)',
        boxShadow: '0 2px 12px rgba(58,36,23,0.05)',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/brand/logo-icon.png" alt="Dulceras Team" style={{ height: 36, width: 'auto' }} />
            <img src="/brand/logo-wordmark.png" alt="Dulceras Team" style={{ height: 44, width: 'auto' }} className="hidden sm:block" />
          </Link>
          <button
            onClick={() => { logout(); navigate('/') }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 500, color: '#5A3B29',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 24px 60px' }}>

        {/* Perfil */}
        <div style={{
          background: '#fff', borderRadius: 20, marginBottom: 28,
          border: '1px solid rgba(58,36,23,0.07)',
          boxShadow: '0 4px 16px rgba(58,36,23,0.06)',
          overflow: 'hidden',
        }}>
          {/* Pink gradient top strip */}
          <div style={{ height: 5, background: 'linear-gradient(90deg, #F0A0C4, #E285AF)' }} />
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #F0A0C4, #E285AF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '1.2rem',
                fontFamily: 'Fraunces, Georgia, serif',
              }}>
                {customer?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, color: '#3A2417', fontSize: '1.05rem', margin: 0 }}>
                  {customer?.name}
                </p>
                <p style={{ fontSize: '0.82rem', color: '#5A3B29', margin: '2px 0 0', opacity: 0.8 }}>{customer?.email}</p>
                <p style={{ fontSize: '0.82rem', color: '#5A3B29', margin: '1px 0 0', opacity: 0.7 }}>{customer?.phone}</p>
              </div>
            </div>
            <button
              onClick={() => setEditModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: '1.5px solid rgba(226,133,175,0.4)',
                borderRadius: 100, padding: '7px 14px', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 600, color: '#E285AF',
                fontFamily: 'Poppins, sans-serif', transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(226,133,175,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <Pencil size={13} />
              Editar
            </button>
          </div>
        </div>

        {/* Pedidos */}
        <h2 style={{
          fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700,
          color: '#3A2417', fontSize: '1.4rem', marginTop: 0, marginBottom: 16,
        }}>
          Mis pedidos
        </h2>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2].map(i => (
              <div key={i} style={{
                background: '#fff', borderRadius: 16, height: 100,
                border: '1px solid rgba(58,36,23,0.07)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            background: '#fff', borderRadius: 20,
            border: '1px solid rgba(58,36,23,0.07)',
            boxShadow: '0 4px 16px rgba(58,36,23,0.06)',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
              background: 'rgba(240,160,196,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShoppingBag size={28} color="#E285AF" />
            </div>
            <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, color: '#3A2417', fontSize: '1.1rem', marginBottom: 6 }}>
              Todavía no tenés pedidos
            </p>
            <p style={{ fontSize: '0.875rem', color: '#5A3B29', marginBottom: 24, opacity: 0.8 }}>
              ¿Qué te antoja hoy?
            </p>
            <Link
              to="/catalogo"
              style={{
                display: 'inline-block', textDecoration: 'none',
                background: 'linear-gradient(135deg, #F0A0C4, #E285AF)',
                color: '#fff', fontWeight: 600, fontSize: '0.875rem',
                padding: '11px 28px', borderRadius: 100,
                boxShadow: '0 6px 18px rgba(226,133,175,0.4)',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {orders.map(order => {
              const st = STATUS_STYLES[order.status] ?? { bg: 'rgba(58,36,23,0.07)', color: '#7A5C4A' }
              const deliveryDate = new Date(order.required_date + 'T00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
              return (
                <Link
                  key={order.id}
                  to={`/pedido/${order.id}`}
                  style={{
                    display: 'block', textDecoration: 'none',
                    background: '#fff', borderRadius: 16,
                    border: '1px solid rgba(58,36,23,0.07)',
                    boxShadow: '0 4px 14px rgba(58,36,23,0.05)',
                    padding: '18px 20px',
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(58,36,23,0.1)'
                    e.currentTarget.style.borderColor = 'rgba(226,133,175,0.3)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(58,36,23,0.05)'
                    e.currentTarget.style.borderColor = 'rgba(58,36,23,0.07)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#5A3B29', opacity: 0.6, marginBottom: 4 }}>
                        Pedido #{order.id}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#5A3B29', fontSize: '0.85rem' }}>
                        <CalendarDays size={13} style={{ opacity: 0.7 }} />
                        {deliveryDate}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600,
                        background: st.bg, color: st.color,
                      }}>
                        {STATUS_LABELS[order.status] ?? order.status_display}
                      </span>
                      <ChevronRight size={16} color="#5A3B29" style={{ opacity: 0.4 }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div>
                        <p style={{ fontSize: '0.72rem', color: '#5A3B29', opacity: 0.6, marginBottom: 1 }}>Total</p>
                        <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#3A2417', fontFamily: 'Fraunces, Georgia, serif' }}>
                          ${Number(order.total).toLocaleString('es-AR')}
                        </p>
                      </div>
                      {Number(order.deposit_amount) > 0 && (
                        <div>
                          <p style={{ fontSize: '0.72rem', color: '#5A3B29', opacity: 0.6, marginBottom: 1 }}>Seña</p>
                          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#5A3B29' }}>
                            ${Number(order.deposit_amount).toLocaleString('es-AR')}
                          </p>
                        </div>
                      )}
                    </div>
                    {Number(order.discount_amount) > 0 && (
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 600,
                        color: '#0D7A54', background: 'rgba(52,211,153,0.12)',
                        padding: '3px 8px', borderRadius: 100,
                      }}>
                        −${Number(order.discount_amount).toLocaleString('es-AR')} desc.
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* CTA */}
        {orders.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link
              to="/catalogo"
              style={{
                display: 'inline-block', textDecoration: 'none',
                background: 'linear-gradient(135deg, #F0A0C4, #E285AF)',
                color: '#fff', fontWeight: 600, fontSize: '0.875rem',
                padding: '11px 28px', borderRadius: 100,
                boxShadow: '0 6px 18px rgba(226,133,175,0.4)',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Hacer otro pedido →
            </Link>
          </div>
        )}

        {/* Reseñas */}
        <div style={{ marginTop: 48 }}>
          <h2 style={{
            fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700,
            color: '#3A2417', fontSize: '1.4rem', marginTop: 0, marginBottom: 6,
          }}>
            Dejá tu reseña
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#5A3B29', opacity: 0.75, marginBottom: 20, fontFamily: 'Poppins, sans-serif' }}>
            Tu opinión aparece en el inicio del sitio para ayudar a otros clientes.
          </p>

          {reviewDone ? (
            <div style={{
              background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
              borderRadius: 16, padding: '20px 24px', textAlign: 'center',
            }}>
              <p style={{ fontSize: '1.5rem', marginBottom: 8 }}>🎉</p>
              <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, color: '#3A2417', marginBottom: 4 }}>
                ¡Gracias por tu reseña!
              </p>
              <p style={{ fontSize: '0.85rem', color: '#5A3B29', fontFamily: 'Poppins, sans-serif' }}>
                Ya está visible en el inicio.{' '}
                <button
                  onClick={() => setReviewDone(false)}
                  style={{ background: 'none', border: 'none', color: '#E285AF', cursor: 'pointer', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}
                >
                  Escribir otra
                </button>
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleReviewSubmit}
              style={{
                background: '#fff', borderRadius: 20, padding: '24px',
                border: '1px solid rgba(58,36,23,0.07)',
                boxShadow: '0 4px 16px rgba(58,36,23,0.06)',
              }}
            >
              {/* Stars */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#5A3B29', marginBottom: 10, fontFamily: 'Poppins, sans-serif' }}>
                  Calificación
                </p>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewRating(n)}
                      onMouseEnter={() => setReviewHover(n)}
                      onMouseLeave={() => setReviewHover(0)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                      aria-label={`${n} estrellas`}
                    >
                      <Star
                        size={28}
                        fill={(reviewHover || reviewRating) >= n ? '#E285AF' : 'none'}
                        color={(reviewHover || reviewRating) >= n ? '#E285AF' : '#D4C0B0'}
                        style={{ transition: 'fill 0.15s, color 0.15s' }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Text */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#5A3B29', marginBottom: 8, fontFamily: 'Poppins, sans-serif' }}>
                  Tu comentario
                </p>
                <textarea
                  value={reviewText}
                  onChange={e => { setReviewText(e.target.value); setReviewError('') }}
                  placeholder="Contanos tu experiencia con nuestros productos..."
                  rows={4}
                  style={{
                    width: '100%', border: '1.5px solid rgba(58,36,23,0.15)', borderRadius: 12,
                    padding: '10px 14px', fontSize: '0.875rem', color: '#3A2417',
                    background: '#fff', outline: 'none', resize: 'vertical',
                    fontFamily: 'Poppins, sans-serif', lineHeight: 1.6,
                    transition: 'border-color 0.2s', boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#E285AF')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(58,36,23,0.15)')}
                />
                {reviewError && (
                  <p style={{ color: '#9B2335', fontSize: '0.8rem', marginTop: 4, fontFamily: 'Poppins, sans-serif' }}>
                    {reviewError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={reviewSaving}
                style={{
                  border: 'none', cursor: reviewSaving ? 'not-allowed' : 'pointer',
                  color: '#fff', borderRadius: 100, padding: '11px 28px',
                  fontSize: '0.875rem', fontWeight: 600, fontFamily: 'Poppins, sans-serif',
                  background: reviewSaving ? 'rgba(226,133,175,0.6)' : 'linear-gradient(135deg, #F0A0C4, #E285AF)',
                  boxShadow: reviewSaving ? 'none' : '0 4px 14px rgba(226,133,175,0.4)',
                }}
              >
                {reviewSaving ? 'Enviando...' : 'Publicar reseña'}
              </button>
            </form>
          )}

          {/* Mis reseñas previas */}
          {myReviews.filter(r => r.author_name === customer?.name).length > 0 && !reviewDone && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#5A3B29', marginBottom: 10, fontFamily: 'Poppins, sans-serif', opacity: 0.7 }}>
                Tus reseñas anteriores
              </p>
              {myReviews.filter(r => r.author_name === customer?.name).slice(0, 3).map(r => (
                <div key={r.id} style={{
                  background: 'rgba(240,160,196,0.07)', borderRadius: 12,
                  padding: '12px 16px', marginBottom: 8,
                  border: '1px solid rgba(226,133,175,0.15)',
                }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {Array.from({ length: r.rating }, (_, i) => (
                      <span key={i} style={{ color: '#E285AF', fontSize: '0.85rem' }}>★</span>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#5A3B29', margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                    "{r.text}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editModal && customer && (
        <EditProfileModal
          initial={{ name: customer.name, phone: customer.phone }}
          onSave={handleProfileUpdate}
          onClose={() => setEditModal(false)}
        />
      )}
    </div>
  )
}
