import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { SlidersHorizontal, X } from 'lucide-react'
import { productService } from '../services/products'
import ProductCard from '../components/product/ProductCard'
import ProductCardSkeleton from '../components/product/ProductCardSkeleton'
import { SORT_OPTIONS } from '../constants'

export default function Products() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const page = Number(params.get('page') || 1)
  const search = params.get('search') || ''
  const categoryId = params.get('category_id') || ''
  const minPrice = params.get('min_price') || ''
  const maxPrice = params.get('max_price') || ''
  const inStock = params.get('in_stock') === 'true'
  const sortParam = params.get('sort') || 'created_at:desc'
  const [sortBy, sortOrder] = sortParam.split(':')

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: productService.getCategories,
  })

  const queryParams = {
    page,
    limit: 20,
    ...(search && { search }),
    ...(categoryId && { category_id: categoryId }),
    ...(minPrice && { min_price: minPrice }),
    ...(maxPrice && { max_price: maxPrice }),
    ...(inStock && { in_stock_only: true }),
    sort_by: sortBy,
    sort_order: sortOrder,
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productService.getProducts(queryParams),
    keepPreviousData: true,
  })

  const products = data?.data || []
  const totalPages = data?.total_pages || 1
  const totalCount = data?.total_count || 0
  const categories = categoriesData?.data || []

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setParams(next)
  }

  return (
    <>
      <Helmet>
        <title>Products — SwiftMart</title>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {search ? `Results for "${search}"` : categoryId ? 'Products' : 'All Products'}
            </h1>
            {!isLoading && <p className="text-sm text-gray-500">{totalCount} products found</p>}
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sortParam}
              onChange={(e) => setParam('sort', e.target.value)}
              className="input-field w-auto text-sm bg-white"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className="flex items-center gap-2 btn-secondary text-sm"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters sidebar */}
          {filtersOpen && (
            <aside className="w-56 flex-shrink-0 animate-fade-in">
              <div className="card p-4 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  <button onClick={() => setFiltersOpen(false)} className="text-gray-400 hover:text-gray-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Category filter */}
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Category</p>
                  <button
                    onClick={() => setParam('category_id', '')}
                    className={`block w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${!categoryId ? 'text-orange-600 font-medium' : 'text-gray-700 hover:text-gray-900'}`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setParam('category_id', cat.id)}
                      className={`block w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${categoryId === cat.id ? 'text-orange-600 font-medium' : 'text-gray-700 hover:text-gray-900'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Price range */}
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Price Range</p>
                  <div className="flex gap-2">
                    <input
                      type="number" placeholder="Min" min="0"
                      value={minPrice}
                      onChange={(e) => setParam('min_price', e.target.value)}
                      className="input-field text-xs py-1.5"
                    />
                    <input
                      type="number" placeholder="Max" min="0"
                      value={maxPrice}
                      onChange={(e) => setParam('max_price', e.target.value)}
                      className="input-field text-xs py-1.5"
                    />
                  </div>
                </div>

                {/* In stock */}
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox" checked={inStock}
                    onChange={(e) => setParam('in_stock', e.target.checked ? 'true' : '')}
                    className="rounded accent-orange-500"
                  />
                  In Stock Only
                </label>

                <button
                  onClick={() => setParams({})}
                  className="mt-4 w-full btn-secondary text-xs"
                >
                  Clear All Filters
                </button>
              </div>
            </aside>
          )}

          {/* Product grid */}
          <div className="flex-1">
            {/* Active filters */}
            {(search || categoryId || inStock || minPrice || maxPrice) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {search && (
                  <span className="badge bg-orange-100 text-orange-700 gap-1">
                    Search: {search}
                    <button onClick={() => setParam('search', '')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {inStock && (
                  <span className="badge bg-green-100 text-green-700 gap-1">
                    In Stock
                    <button onClick={() => setParam('in_stock', '')}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}

            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 ${isFetching ? 'opacity-75' : ''}`}>
              {isLoading
                ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : products.length > 0
                ? products.map((p) => <ProductCard key={p.id} product={p} />)
                : (
                  <div className="col-span-full text-center py-20 text-gray-500">
                    <p className="text-4xl mb-3">🔍</p>
                    <p className="font-medium">No products found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  disabled={page <= 1}
                  onClick={() => setParam('page', String(page - 1))}
                  className="btn-secondary text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setParam('page', String(page + 1))}
                  className="btn-secondary text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
