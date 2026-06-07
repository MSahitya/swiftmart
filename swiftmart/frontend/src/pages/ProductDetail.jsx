import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { ShoppingCart, ArrowLeft, Package, CheckCircle, XCircle, Minus, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { productService } from '../services/products'
import { cartService } from '../services/cart'
import { useAuthStore } from '../store/authStore'
import { formatPrice } from '../utils'

export default function ProductDetail() {
  const { slug } = useParams()
  const qc = useQueryClient()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(0)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getProductBySlug(slug),
  })

  const product = data?.data

  const addMutation = useMutation({
    mutationFn: () => cartService.addItem(product.id, qty),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] })
      toast.success(`${qty} × ${product.name} added to cart`)
    },
    onError: () => toast.error('Failed to add to cart'),
  })

  if (isLoading) return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-200 rounded-xl" />
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  )

  if (isError || !product) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
      <Link to="/products" className="btn-primary inline-flex">Browse Products</Link>
    </div>
  )

  const discountPct = product.discount_price
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : null

  return (
    <>
      <Helmet>
        <title>{product.name} — SwiftMart</title>
        <meta name="description" content={product.description || product.name} />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image gallery */}
          <div>
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3">
              {product.images?.[activeImage] ? (
                <img
                  src={product.images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-8xl">📦</div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${idx === activeImage ? 'border-orange-400' : 'border-gray-200'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link to={`/products?category_id=${product.category?.id}`} className="text-sm text-orange-500 hover:underline font-medium">
                {product.category?.name}
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-extrabold text-gray-900">{formatPrice(product.effective_price)}</span>
              {product.discount_price && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(Number(product.price))}</span>
                  <span className="badge bg-red-100 text-red-600 font-bold">{discountPct}% OFF</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 mb-6">
              {product.in_stock ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">In Stock ({product.stock_qty} left)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-500 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>
            )}

            {product.in_stock && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{qty}</span>
                    <button
                      onClick={() => setQty((q) => Math.min(product.stock_qty, q + 1))}
                      className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!isAuthenticated) { toast.error('Please sign in to add to cart'); return }
                    addMutation.mutate()
                  }}
                  disabled={addMutation.isPending}
                  className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addMutation.isPending ? 'Adding...' : 'Add to Cart'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
