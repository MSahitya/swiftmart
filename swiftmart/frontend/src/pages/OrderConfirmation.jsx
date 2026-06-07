import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { CheckCircle, Package } from 'lucide-react'
import { orderService } from '../services/orders'
import { formatPrice, formatDate, getStatusColor } from '../utils'

export default function OrderConfirmation() {
  const { id } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrder(id),
  })
  const order = data?.data

  if (isLoading) return <div className="max-w-lg mx-auto px-4 py-20 text-center animate-pulse"><div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4" /></div>

  return (
    <>
      <Helmet><title>Order Confirmed — SwiftMart</title></Helmet>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-500">Your order has been placed and is being processed</p>
        </div>

        {order && (
          <div className="card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Order ID</p>
                <p className="font-mono font-semibold text-sm">{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <span className={`badge ${getStatusColor(order.status)}`}>
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Items</p>
              <div className="space-y-2">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.product_name} × {item.quantity}</span>
                    <span className="font-medium">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between font-bold">
              <span>Total Paid</span>
              <span className="text-lg text-orange-600">{formatPrice(Number(order.total_amount))}</span>
            </div>

            <div className="flex gap-3 pt-2">
              <Link to={`/orders/${order.id}`} className="flex-1 btn-primary text-center py-2.5">
                Track Order
              </Link>
              <Link to="/products" className="flex-1 btn-secondary text-center py-2.5">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
