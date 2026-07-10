import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCalendar, getProductionDay } from '../../../api/adminApi'
import type { CalendarData, CalendarOrderItem, ProductionDay } from '../../../types/admin'
import { STATUS_COLORS, STATUS_LABELS } from '../../../types/admin'

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function toMonthStr(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`
}

function cellColor(count: number, max: number) {
  if (count === 0) return 'hover:bg-gray-50'
  if (max === 0) return 'bg-blue-50 hover:bg-blue-100'
  const ratio = count / max
  if (ratio >= 1) return 'bg-red-100 hover:bg-red-200'
  if (ratio >= 0.7) return 'bg-amber-50 hover:bg-amber-100'
  return 'bg-green-50 hover:bg-green-100'
}

function badgeColor(count: number, max: number) {
  if (count === 0 || max === 0) return 'bg-blue-100 text-blue-700'
  const ratio = count / max
  if (ratio >= 1) return 'bg-red-500 text-white'
  if (ratio >= 0.7) return 'bg-amber-400 text-white'
  return 'bg-green-500 text-white'
}

export default function CalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [data, setData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [production, setProduction] = useState<ProductionDay | null>(null)
  const [prodLoading, setProdLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    setSelectedDate(null)
    setProduction(null)
    getCalendar(toMonthStr(year, month))
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [year, month])

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  async function selectDay(dateStr: string) {
    if (selectedDate === dateStr) { setSelectedDate(null); setProduction(null); return }
    setSelectedDate(dateStr)
    setProduction(null)
    setProdLoading(true)
    try {
      const { data } = await getProductionDay(dateStr)
      setProduction(data)
    } catch {}
    setProdLoading(false)
  }

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const maxPerDay = data?.max_per_day ?? 0

  return (
    <div className="p-6 flex gap-6 h-full">
      {/* Calendar panel */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Calendario de producción</h1>
          <div className="flex items-center gap-3">
            {maxPerDay > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500" /> OK
                <span className="inline-block w-3 h-3 rounded-full bg-amber-400" /> &gt;70%
                <span className="inline-block w-3 h-3 rounded-full bg-red-500" /> Lleno
              </div>
            )}
          </div>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-semibold text-gray-800">
            {MONTHS[month - 1]} {year}
          </span>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[#E8889A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {DAYS_OF_WEEK.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2.5">{d}</div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7">
              {cells.map((day, i) => {
                if (!day) return <div key={i} className="h-20 border-b border-r border-gray-100 bg-gray-50/50" />

                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const dayData = data?.days[dateStr]
                const count = dayData?.count ?? 0
                const isToday = dateStr === today.toISOString().split('T')[0]
                const isSelected = selectedDate === dateStr

                return (
                  <button
                    key={i}
                    onClick={() => selectDay(dateStr)}
                    className={`h-20 border-b border-r border-gray-100 p-2 text-left transition-colors relative
                      ${cellColor(count, maxPerDay)}
                      ${isSelected ? 'ring-2 ring-inset ring-[#E8889A]' : ''}
                    `}
                  >
                    <span className={`text-sm font-semibold ${isToday ? 'text-[#E8889A]' : 'text-gray-700'}`}>
                      {day}
                      {isToday && <span className="ml-1 text-[10px]">hoy</span>}
                    </span>
                    {count > 0 && (
                      <span className={`absolute top-2 right-2 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ${badgeColor(count, maxPerDay)}`}>
                        {count}
                      </span>
                    )}
                    {dayData?.orders.slice(0, 2).map(o => (
                      <p key={o.id} className="text-[10px] text-gray-500 truncate leading-tight mt-0.5">
                        #{o.id} {o.customer}
                      </p>
                    ))}
                    {count > 2 && (
                      <p className="text-[10px] text-gray-400 mt-0.5">+{count - 2} más</p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Summary footer */}
        {data && (
          <div className="mt-4 flex gap-4 text-sm text-gray-500">
            <span>
              Total mes: <strong className="text-gray-800">
                {Object.values(data.days).reduce((s, d) => s + d.count, 0)} pedidos
              </strong>
            </span>
            {maxPerDay > 0 && (
              <span>Límite diario: <strong className="text-gray-800">{maxPerDay}</strong></span>
            )}
          </div>
        )}
      </div>

      {/* Production panel */}
      {selectedDate && (
        <div className="w-96 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Producción</p>
                <p className="text-sm font-bold text-gray-800">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', {
                    weekday: 'long', day: 'numeric', month: 'long',
                  })}
                </p>
              </div>
              <button onClick={() => { setSelectedDate(null); setProduction(null) }}
                className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {prodLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-3 border-[#E8889A] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !production ? null : (
                <>
                  {/* Resumen de producción */}
                  {production.production_summary.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Qué preparar
                      </p>
                      <div className="space-y-2">
                        {production.production_summary.map(item => (
                          <div key={item.product} className="bg-amber-50 rounded-lg px-3 py-2">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-gray-800">{item.product}</p>
                              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                ×{item.total_units}
                              </span>
                            </div>
                            <div className="mt-1 space-y-0.5">
                              {item.variants.map(v => (
                                <p key={v.name} className="text-xs text-gray-600">
                                  {v.name}: <span className="font-semibold">{v.quantity}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lista de pedidos */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Pedidos ({production.orders.length})
                    </p>
                    <div className="space-y-2">
                      {production.orders.map(order => (
                        <button
                          key={order.id}
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2.5 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                #{order.id} — {order.customer_name}
                              </p>
                              <p className="text-xs text-gray-500">{order.customer_phone}</p>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                              {STATUS_LABELS[order.status] ?? order.status}
                            </span>
                          </div>
                          <div className="mt-1 flex gap-3 text-xs text-gray-500">
                            <span>Total: <strong>${Number(order.total).toLocaleString('es-AR')}</strong></span>
                            <span>Seña: <strong>${Number(order.deposit_amount).toLocaleString('es-AR')}</strong></span>
                          </div>
                          {order.notes && (
                            <p className="text-xs text-gray-400 mt-1 italic truncate">{order.notes}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
