import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminProductService } from '../../services/products'
import { productSchema } from '../../schemas'
import { formatPrice } from '../../utils'

function ProductModal({ product, categories, onClose }) {
  const qc = useQueryClient()
  const isEdit = !!product

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price,
      discount_price: product.discount_price || null,
      stock_qty: product.stock_qty,
      category_id: product.category?.id,
    } : {},
  })

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? adminProductService.updateProduct(product.id, data)
      : adminProductService.createProduct(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success(isEdit ? 'Product updated' : 'Product created')
      onClose()
    },
    onError: (e) => toast.error(e?.response?.data?.detail || 'Failed'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-semibold text-gray-900">{isEdit ? 'Edit Product' : 'New Product'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input {...register('name')} className="input-field" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input {...register('slug')} className="input-field" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea {...register('description')} rows={2} className="input-field resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input {...register('price')} type="number" step="0.01" className="input-field" />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (₹)</label>
              <input {...register('discount_price')} type="number" step="0.01" className="input-field" placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Qty</label>
              <input {...register('stock_qty')} type="number" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select {...register('category_id')} className="input-field">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">
              {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminProducts() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null) // null | { product? }
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', { page, search }],
    queryFn: () => adminProductService.getProducts({ page, limit: 20, ...(search && { search }) }),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminProductService.getCategories,
  })

  const deleteMutation = useMutation({
    mutationFn: adminProductService.deleteProduct,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deleted') },
    onError: () => toast.error('Failed to delete'),
  })

  const products = productsData?.data || []
  const categories = categoriesData?.data || []
  const totalPages = productsData?.total_pages || 1

  return (
    <>
      <Helmet><title>Products — SwiftMart Admin</title></Helmet>
      {modal !== null && <ProductModal product={modal.product} categories={categories} onClose={() => setModal(null)} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button onClick={() => setModal({})} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 bg-gray-50" />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                {['Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category?.name}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(p.effective_price)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.stock_qty <= 0 ? 'bg-red-100 text-red-700' : p.stock_qty <= 10 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                      {p.stock_qty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setModal({ product: p })} className="text-gray-400 hover:text-blue-500 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.confirm('Delete this product?') && deleteMutation.mutate(p.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
