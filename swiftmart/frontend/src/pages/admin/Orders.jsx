import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { adminOrderService } from '../../services/orders'
import { formatPrice, formatDate, getStatusColor } from '../../utils'
import { ORDER_STATUSES } from '../../constants'
import toast from 'react-hot-toast'

export default function AdminOrders() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', { page, statusFilter }],
    queryFn: () => adminOrderService.getOrders({ page, limit: 20, ...(statusFilter && { status: statusFilter }) }),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminOrderService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
      toast.success('Status updated')
    },
    onError: () => toast.error('Failed to update status'),
  })

  const orders = data?.data || []
  const totalPages = data?.total_pages || 1

  return (
    <>
      <Helmet><title>Orders — SwiftMart Admin</title></Helmet>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto bg-white text-sm">
          <option value="">All Statuses</option>
          {Object.entries(ORDER_STATUSES).map(([v, { label }]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="p-8 text-center animate-pulse text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                {['Order ID', 'Date', 'Customer', 'Total', 'Status', 'Update Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">#{o.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(o.created_at)}</td>
                  <td className="px-4 py-3 text-gray-700">{o.delivery_address?.full_name || '—'}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(Number(o.total_amount))}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${getStatusColor(o.status)}`}>{o.status.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => statusMutation.mutate({ id: o.id, status: e.target.value })}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      disabled={statusMutation.isPending}
                    >
                      {Object.entries(ORDER_STATUSES).map(([v, { label }]) => (
                        <option key={v} value={v}>{label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 p-4 border-t border-gray-100">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary text-sm disabled:opacity-40">Prev</button>
            <span className="text-sm text-gray-500">Page {page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary text-sm disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </>
  )
}
