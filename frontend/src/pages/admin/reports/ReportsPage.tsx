import { useState, useEffect } from 'react'
import { getReports } from '../../../api/adminApi'
import type { ReportData, ReportDayOfWeek } from '../../../types/admin'
import { STATUS_LABELS, STATUS_COLORS } from '../../../types/admin'

type Period = 'today' | 'week' | 'month' | 'all'

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Hoy',
  week: 'Esta semana',
  month: 'Este mes',
  all: 'Todo',
}

function fmt(n: number) {
  return n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
function fmtMoney(n: number) { return `$${fmt(n)}` }
function pct(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0
}

// ── Gráfico de línea SVG ──────────────────────────────────────────────────────
function LineChart({ data }: { data: { date: string; revenue: number; count: number }[] }) {
  if (data.length === 0) return <p className="text-gray-400 text-sm text-center py-6">Sin datos</p>

  const W = 600; const H = 140; const PAD = { t: 12, r: 8, b: 28, l: 52 }
  const innerW = W - PAD.l - PAD.r
  const innerH = H - PAD.t - PAD.b

  const maxRev = Math.max(...data.map(d => d.revenue), 1)
  const step = innerW / Math.max(data.length - 1, 1)

  const pts = data.map((d, i) => ({
    x: PAD.l + i * step,
    y: PAD.t + innerH - (d.revenue / maxRev) * innerH,
    ...d,
  }))

  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')
  const area = [
    `M${pts[0].x},${PAD.t + innerH}`,
    ...pts.map(p => `L${p.x},${p.y}`),
    `L${pts[pts.length - 1].x},${PAD.t + innerH}`,
    'Z',
  ].join(' ')

  // Y axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    y: PAD.t + innerH - f * innerH,
    label: fmtMoney(f * maxRev),
  }))

  // X axis: show ~5 dates
  const xStep = Math.ceil(data.length / 5)
  const xTicks = pts.filter((_, i) => i % xStep === 0 || i === pts.length - 1)

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 280 }}>
        {/* Grid lines */}
        {yTicks.map(t => (
          <g key={t.y}>
            <line x1={PAD.l} y1={t.y} x2={W - PAD.r} y2={t.y} stroke="#f0f0f0" strokeWidth={1} />
            <text x={PAD.l - 6} y={t.y + 4} fontSize={9} fill="#aaa" textAnchor="end">{t.label}</text>
          </g>
        ))}
        {/* Area fill */}
        <path d={area} fill="#E8889A" fillOpacity={0.12} />
        {/* Line */}
        <polyline points={polyline} fill="none" stroke="#E8889A" strokeWidth={2} strokeLinejoin="round" />
        {/* Dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="#E8889A">
            <title>{p.date}: {fmtMoney(p.revenue)} ({p.count} pedidos)</title>
          </circle>
        ))}
        {/* X labels */}
        {xTicks.map((p, i) => (
          <text key={i} x={p.x} y={H - 8} fontSize={9} fill="#aaa" textAnchor="middle">
            {p.date.slice(5)}
          </text>
        ))}
      </svg>
    </div>
  )
}

// ── Barras horizontales ────────────────────────────────────────────────────────
function HBar({ label, count, revenue, max, color = '#E8889A' }: {
  label: string; count: number; revenue: number; max: number; color?: string
}) {
  const w = max > 0 ? (count / max) * 100 : 0
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-8 text-right text-xs text-gray-500 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 flex items-center pl-2"
          style={{ width: `${Math.max(w, 2)}%`, backgroundColor: color }}
        >
          {w > 15 && <span className="text-white text-[10px] font-bold">{count}</span>}
        </div>
      </div>
      <div className="shrink-0 text-right w-28 text-xs text-gray-500">
        <span className="font-semibold text-gray-700">{count}</span>
        {revenue > 0 && <span className="ml-1">· {fmtMoney(revenue)}</span>}
      </div>
    </div>
  )
}

// ── Donut simple ──────────────────────────────────────────────────────────────
function DonutChart({ value, total, color }: { value: number; total: number; color: string }) {
  const r = 18; const circ = 2 * Math.PI * r
  const dash = total > 0 ? (value / total) * circ : 0
  return (
    <svg width={44} height={44} viewBox="0 0 44 44">
      <circle cx={22} cy={22} r={r} fill="none" stroke="#f0f0f0" strokeWidth={5} />
      <circle
        cx={22} cy={22} r={r} fill="none"
        stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
      />
    </svg>
  )
}

// ── Tarjeta métrica ───────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, accent }: {
  label: string; value: string; sub?: string; accent: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className={`w-2 h-2 rounded-full ${accent} mb-3`} />
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-600 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getReports(period)
      .then(r => setData(r.data))
      .catch(() => setError('No se pudieron cargar los reportes.'))
      .finally(() => setLoading(false))
  }, [period])

  const maxStatus = data?.by_status.length ? Math.max(...data.by_status.map(s => s.count), 1) : 1
  const maxDay = data?.by_day_of_week.length ? Math.max(...data.by_day_of_week.map((d: ReportDayOfWeek) => d.count), 1) : 1

  const avgTicket = data && data.revenue.order_count > 0
    ? Math.round(data.revenue.total / data.revenue.order_count)
    : 0

  const ci = data?.customers_insight
  const cs = data?.coupon_stats

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analítica</h1>
          {data && (data.from_date || data.to_date) && (
            <p className="text-sm text-gray-500 mt-0.5">
              {data.from_date === data.to_date
                ? data.from_date
                : `${data.from_date ?? '—'} → ${data.to_date ?? '—'}`}
            </p>
          )}
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                period === p ? 'bg-white shadow text-[#3D1A0E]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-[#E8889A] border-t-transparent rounded-full" />
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {!loading && !error && data && (
        <div className="space-y-6">

          {/* ── Fila 1: Ingresos ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Facturación total" value={fmtMoney(data.revenue.total)}
              sub={`${data.revenue.order_count} pedidos`} accent="bg-[#E8889A]" />
            <MetricCard label="Señas cobradas" value={fmtMoney(data.revenue.deposits_collected)}
              sub="ingresó en caja" accent="bg-green-500" />
            <MetricCard label="Saldo pendiente" value={fmtMoney(data.revenue.balance_pending)}
              sub="por cobrar al entregar" accent="bg-amber-500" />
            <MetricCard label="Ticket promedio" value={avgTicket > 0 ? fmtMoney(avgTicket) : '$—'}
              sub="por pedido" accent="bg-purple-500" />
          </div>

          {/* ── Fila 2: Clientes ── */}
          {ci && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
                <DonutChart value={ci.new} total={ci.unique} color="#E8889A" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{ci.unique}</p>
                  <p className="text-sm font-medium text-gray-600">Clientes únicos</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
                <DonutChart value={ci.new} total={ci.unique} color="#E8889A" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{ci.new}</p>
                  <p className="text-sm font-medium text-gray-600">Clientes nuevos</p>
                  <p className="text-xs text-gray-400">{pct(ci.new, ci.unique)}% del total</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
                <DonutChart value={ci.returning} total={ci.unique} color="#7C4A2D" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{ci.returning}</p>
                  <p className="text-sm font-medium text-gray-600">Recurrentes</p>
                  <p className="text-xs text-gray-400">{pct(ci.returning, ci.unique)}% del total</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
                <DonutChart
                  value={cs?.orders_with_coupon ?? 0}
                  total={data.revenue.order_count}
                  color="#6366f1"
                />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{cs?.orders_with_coupon ?? 0}</p>
                  <p className="text-sm font-medium text-gray-600">Usaron cupón</p>
                  <p className="text-xs text-gray-400">
                    {pct(cs?.orders_with_coupon ?? 0, data.revenue.order_count)}% de pedidos
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Ventas diarias (línea SVG) ── */}
          {data.daily.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Ventas diarias</h2>
                <span className="text-xs text-gray-400">{data.daily.length} días con ventas</span>
              </div>
              <LineChart data={data.daily} />
            </div>
          )}

          {/* ── Fila 3: Estado + Zona ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Por estado</h2>
              {data.by_status.length === 0 ? (
                <p className="text-gray-400 text-sm">Sin datos</p>
              ) : (
                <div className="space-y-2.5">
                  {data.by_status.map(row => (
                    <div key={row.status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[row.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_LABELS[row.status] ?? row.label}
                        </span>
                        <span className="font-semibold text-gray-700">{row.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#E8889A] rounded-full transition-all duration-500"
                          style={{ width: `${(row.count / maxStatus) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Por zona de entrega</h2>
              {data.by_zone.length === 0 ? (
                <p className="text-gray-400 text-sm">Sin datos</p>
              ) : (
                <div className="space-y-3">
                  {data.by_zone.map(row => (
                    <div key={row.zone} className="flex items-center justify-between text-sm">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="font-medium text-gray-700 truncate">{row.zone}</p>
                        <p className="text-gray-400 text-xs">{row.count} pedido{row.count !== 1 ? 's' : ''}</p>
                      </div>
                      <span className="font-semibold text-gray-800 whitespace-nowrap">{fmtMoney(row.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Días pico ── */}
          {data.by_day_of_week.some(d => d.count > 0) && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Días pico</h2>
                <span className="text-xs text-gray-400">pedidos por día de la semana</span>
              </div>
              <div className="space-y-2">
                {data.by_day_of_week.map(d => (
                  <HBar
                    key={d.day}
                    label={d.label}
                    count={d.count}
                    revenue={d.revenue}
                    max={maxDay}
                    color={d.count === maxDay ? '#3D1A0E' : '#E8889A'}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Cupones ── */}
          {cs && cs.orders_with_coupon > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Cupones aplicados</h2>
                <span className="text-xs text-gray-400">
                  Total descontado: <strong className="text-indigo-600">{fmtMoney(cs.total_discount)}</strong>
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-gray-500 font-medium pb-2 pr-4">Código</th>
                      <th className="text-right text-gray-500 font-medium pb-2 pr-4">Usos</th>
                      <th className="text-right text-gray-500 font-medium pb-2">Total descontado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cs.top_coupons.map(c => (
                      <tr key={c.code} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2.5 pr-4 font-mono font-bold text-indigo-600">{c.code}</td>
                        <td className="py-2.5 pr-4 text-right text-gray-700">{c.uses}</td>
                        <td className="py-2.5 text-right font-semibold text-gray-800">{fmtMoney(c.total_discount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Top productos ── */}
          {data.top_products.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Productos más vendidos</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-gray-500 font-medium pb-2 pr-4">#</th>
                      <th className="text-left text-gray-500 font-medium pb-2 pr-4">Producto</th>
                      <th className="text-left text-gray-500 font-medium pb-2 pr-4">Variante</th>
                      <th className="text-right text-gray-500 font-medium pb-2 pr-4">Unidades</th>
                      <th className="text-right text-gray-500 font-medium pb-2">Facturado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_products.map((p, i) => (
                      <tr key={`${p.product_name}-${p.variant_name}`} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2.5 pr-4 text-gray-400 font-mono">{i + 1}</td>
                        <td className="py-2.5 pr-4 font-medium text-gray-800">{p.product_name}</td>
                        <td className="py-2.5 pr-4 text-gray-500">{p.variant_name || '—'}</td>
                        <td className="py-2.5 pr-4 text-right font-semibold text-gray-700">{p.qty}</td>
                        <td className="py-2.5 text-right font-semibold text-[#3D1A0E]">{fmtMoney(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.revenue.order_count === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📊</p>
              <p className="font-medium">Sin datos para este período</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
