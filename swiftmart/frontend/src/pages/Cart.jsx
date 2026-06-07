import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { ShoppingCart, ArrowRight, Truck } from 'lucide-react'
import { cartService } from '../services/cart'
import { useAuthStore } from '../store/authStore'
import CartItem from '../components/cart/CartItem'
import { formatPrice, FREE_DELIVERY_THRESHOLD, DELIVERY_FEE } from '../utils'
import { FREE_DELIVERY_THRESHOLD as THRESHOLD } from '../constants'

export default function Cart() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  const { data, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    enabled: isAuthenticated,
  })

  const cart = data?.data
  const items = cart?.items || []
  const remaining = Math.max(0, THRESHOLD - (cart?.subtotal || 0))

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Sign in to access your cart</p>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </div>
    )
  }

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4 py-4 border-b border-gray-100">
          <div className="w-20 h-20 bg-gray-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started!</p>
        <Link to="/products" className="btn-primary">Shop Now</Link>
      </div>
    )
  }

  return (
    <>
      <Helmet><title>Cart — SwiftMart</title></Helmet>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({items.length} items)</h1>

        {remaining > 0 && (
          <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
            <Truck className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <p className="text-sm text-orange-700">
              Add <span className="font-bold">{formatPrice(remaining)}</span> more for free delivery!
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-4 divide-y divide-gray-100">
            {items.map((item) => <CartItem key={item.id} item={item} />)}
          </div>

          <div className="card p-5 h-fit sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.item_count} items)</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>{cart.delivery_fee === 0 ? <span className="text-green-600 font-medium">FREE</span> : formatPrice(cart.delivery_fee)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="text-lg">{formatPrice(cart.total)}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full mt-5 py-3 flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/products" className="block text-center mt-3 text-sm text-gray-500 hover:text-gray-700">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
