import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { Package, ChevronRight } from 'lucide-react'
import { orderService } from '../services/orders'
import { formatPrice, formatDate, getStatusColor } from '../utils'

export default function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getOrders({ page: 1, limit: 20 }),
  })
  const orders = data?.data || []

  return (
    <>
      <Helmet><title>My Orders — SwiftMart</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-24" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No orders yet</p>
            <Link to="/products" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="card p-5 flex items-center justify-between hover:shadow-md transition-shadow group">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm font-semibold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</span>
                    <span className={`badge ${getStatusColor(order.status)}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(order.created_at)} · {order.items?.length || 0} items</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">{formatPrice(Number(order.total_amount))}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
