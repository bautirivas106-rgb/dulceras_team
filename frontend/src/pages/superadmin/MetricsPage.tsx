import { useEffect, useState } from 'react'
import { getMetrics, type PlatformMetrics } from '../../api/superadminApi'
import { Link } from 'react-router-dom'

export default function MetricsPage() {
  const [data, setData] = useState<PlatformMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMetrics().then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!data) return <p className="p-6 text-red-500">Error cargando métricas.</p>

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Métricas de la plataforma</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Negocios activos" value={`${data.active_tenants} / ${data.total_tenants}`} color="bg-indigo-500" />
        <KpiCard label="Pedidos totales" value={String(data.total_orders)} color="bg-green-500" />
        <KpiCard label="Facturación total" value={`$${data.total_revenue.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`} color="bg-amber-500" />
        <KpiCard label="Usuarios" value={String(data.total_users)} color="bg-purple-500" />
      </div>

      {/* By tenant */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Negocios</h2>
          <Link
            to="/superadmin/tenants"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Ver todos →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-gray-500 font-medium pb-2">Negocio</th>
              <th className="text-left text-gray-500 font-medium pb-2">Slug</th>
              <th className="text-right text-gray-500 font-medium pb-2">Pedidos</th>
              <th className="text-right text-gray-500 font-medium pb-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.by_tenant.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-2.5 font-medium text-gray-800">
                  <Link to={`/superadmin/tenants/${t.id}`} className="hover:text-indigo-600">
                    {t.name}
                  </Link>
                </td>
                <td className="py-2.5 font-mono text-xs text-gray-500">{t.slug}</td>
                <td className="py-2.5 text-right font-semibold text-gray-700">{t.orders ?? 0}</td>
                <td className="py-2.5 text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    t.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'
                  }`}>
                    {t.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className={`w-2 h-2 rounded-full ${color} mb-3`} />
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
