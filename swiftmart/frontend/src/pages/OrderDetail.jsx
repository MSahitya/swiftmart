import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, MapPin, CreditCard } from 'lucide-react'
import { orderService } from '../services/orders'
import { formatPrice, formatDate, getStatusColor } from '../utils'

const STATUS_STEPS = ['pending', 'processing', 'out_for_delivery', 'delivered']

export default function OrderDetail() {
  const { id } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrder(id),
  })
  const order = data?.data

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mb-4" /></div>
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found</div>

  const stepIndex = STATUS_STEPS.indexOf(order.status)

  return (
    <>
      <Helmet><title>Order #{order.id.slice(0, 8).toUpperCase()} — SwiftMart</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <span className={`badge ${getStatusColor(order.status)}`}>
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Progress tracker */}
        {order.status !== 'cancelled' && (
          <div className="card p-5 mb-5">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, idx) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${idx <= stepIndex ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {idx + 1}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{step.replace(/_/g, ' ')}</p>
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${idx < stepIndex ? 'bg-orange-400' : 'bg-gray-100'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          {/* Items */}
          <div className="card p-5 md:col-span-2">
            <h3 className="font-semibold mb-3">Items</h3>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.product_name} × {item.quantity}</span>
                  <span className="font-medium">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Delivery Fee</span><span>{order.delivery_fee === 0 ? 'FREE' : formatPrice(Number(order.delivery_fee))}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span><span>{formatPrice(Number(order.total_amount))}</span>
              </div>
            </div>
          </div>

          {/* Delivery address */}
          <div className="card p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" /> Delivery Address</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.delivery_address?.full_name}</p>
              <p>{order.delivery_address?.address_line1}</p>
              {order.delivery_address?.address_line2 && <p>{order.delivery_address.address_line2}</p>}
              <p>{order.delivery_address?.city}, {order.delivery_address?.state} - {order.delivery_address?.pincode}</p>
              <p>{order.delivery_address?.phone}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4 text-orange-500" /> Payment</h3>
            <p className="text-sm text-gray-700 capitalize">{order.payment_method?.replace(/_/g, ' ')}</p>
            <p className="text-xs text-gray-400 mt-1">Placed on {formatDate(order.created_at)}</p>
          </div>
        </div>
      </div>
    </>
  )
}
