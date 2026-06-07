import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Plus, Check } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { cartService } from '../../services/cart'
import { useAuthStore } from '../../store/authStore'
import { formatPrice } from '../../utils'

export default function ProductCard({ product }) {
  const qc = useQueryClient()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const [added, setAdded] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: () => cartService.addItem(product.id, 1),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] })
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
      toast.success(`${product.name} added to cart`)
    },
    onError: () => toast.error('Failed to add to cart'),
  })

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart')
      return
    }
    if (!product.in_stock) return
    mutate()
  }

  const discountPct = product.discount_price
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : null

  return (
    <Link to={`/products/${product.slug}`} className="card group overflow-hidden hover:shadow-md transition-shadow duration-200 block">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📦</div>
        )}
        {discountPct && (
          <span className="absolute top-2 left-2 badge bg-red-500 text-white">{discountPct}% OFF</span>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="badge bg-gray-200 text-gray-600 text-xs font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-orange-500 font-medium mb-1 truncate">{product.category_id}</p>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 leading-snug">{product.name}</h3>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-base font-bold text-gray-900">{formatPrice(product.effective_price)}</p>
            {product.discount_price && (
              <p className="text-xs text-gray-400 line-through">{formatPrice(Number(product.price))}</p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock || isPending}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              added
                ? 'bg-green-500 text-white scale-110'
                : product.in_stock
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
            aria-label="Add to cart"
          >
            {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </Link>
  )
}
