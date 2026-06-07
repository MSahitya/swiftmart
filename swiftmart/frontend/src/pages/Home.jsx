import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { Zap, Clock, Shield, Truck } from 'lucide-react'
import { productService } from '../services/products'
import ProductCard from '../components/product/ProductCard'
import ProductCardSkeleton from '../components/product/ProductCardSkeleton'

const FEATURES = [
  { icon: Zap, title: 'Instant Delivery', desc: 'Get groceries delivered in 10 minutes' },
  { icon: Shield, title: 'Quality Assured', desc: 'Fresh, premium quality products' },
  { icon: Clock, title: '24/7 Available', desc: 'Order anytime, any day' },
  { icon: Truck, title: 'Free Delivery', desc: 'Free above ₹499 orders' },
]

export default function Home() {
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: productService.getCategories,
  })

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', { page: 1, limit: 8 }],
    queryFn: () => productService.getProducts({ page: 1, limit: 8 }),
  })

  const categories = categoriesData?.data || []
  const products = productsData?.data || []

  return (
    <>
      <Helmet>
        <title>SwiftMart — Instant Grocery & Lifestyle Delivery</title>
        <meta name="description" content="Order groceries and lifestyle products for instant delivery in your city." />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" /> Delivering in 10 minutes
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 leading-tight">
            Groceries, Delivered <br />
            <span className="text-yellow-200">Instantly</span>
          </h1>
          <p className="text-lg sm:text-xl text-orange-100 mb-8 max-w-xl mx-auto">
            Fresh produce, daily essentials, snacks & more — at your doorstep before you know it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/products" className="bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors">
              Shop Now
            </Link>
            <Link to="/register" className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-4 text-center hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <Link to="/products" className="text-orange-500 hover:text-orange-600 text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category_id=${cat.id}`}
                className="flex flex-col items-center gap-2 p-3 card hover:border-orange-200 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-orange-50 rounded-full overflow-hidden flex items-center justify-center">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">🛒</span>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-700 text-center group-hover:text-orange-600 transition-colors leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Popular Products</h2>
          <Link to="/products" className="text-orange-500 hover:text-orange-600 text-sm font-medium">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Get ₹100 off your first order</h3>
            <p className="text-gray-400">Use code <span className="text-orange-400 font-mono font-bold">SWIFT100</span> at checkout</p>
          </div>
          <Link to="/register" className="btn-primary px-8 py-3 text-base whitespace-nowrap">
            Claim Offer
          </Link>
        </div>
      </section>
    </>
  )
}
