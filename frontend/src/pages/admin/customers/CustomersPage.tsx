import { useEffect, useState } from 'react'
import adminClient from '../../../api/adminClient'

interface Customer {
  id: number
  name: string
  phone: string
  email: string
  order_count: number
  created_at: string
}

interface Paginated {
  count: number
  results: Customer[]
}

export default function CustomersPage() {
  const [data, setData] = useState<Paginated | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    adminClient
      .get<Paginated>('/api/admin/customers/', {
        params: { search: search || undefined, page },
      })
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search, page])

  const totalPages = data ? Math.ceil(data.count / 20) : 1

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Clientes</h1>
        {data && <p className="text-sm text-gray-500 mt-0.5">{data.count} clientes</p>}
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre o teléfono..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        className="text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-[#E8889A] bg-white"
      />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-[#E8889A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data || data.results.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-16">Sin clientes</p>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Teléfono</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Pedidos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.results.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-800">{c.name}</td>
                    <td className="px-4 py-3.5">
                      <a href={`tel:${c.phone}`} className="text-[#E8889A] hover:underline">{c.phone}</a>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500">{c.email || '—'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                        {c.order_count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Página {page} de {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    ← Anterior
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
