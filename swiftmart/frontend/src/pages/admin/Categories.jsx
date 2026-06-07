import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminProductService } from '../../services/products'

function CategoryModal({ category, onClose }) {
  const qc = useQueryClient()
  const isEdit = !!category

  const { register, handleSubmit } = useForm({
    defaultValues: category ? {
      name: category.name, slug: category.slug,
      image_url: category.image_url || '', display_order: category.display_order,
    } : { display_order: 0 },
  })

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? adminProductService.updateCategory(category.id, data)
      : adminProductService.createCategory(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success(isEdit ? 'Category updated' : 'Category created')
      onClose()
    },
    onError: (e) => toast.error(e?.response?.data?.detail || 'Failed'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-semibold">{isEdit ? 'Edit Category' : 'New Category'}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input {...register('name', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input {...register('slug', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
            <input {...register('image_url')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
            <input {...register('display_order')} type="number" className="input-field" />
          </div>
          <div className="flex gap-3">
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

export default function AdminCategories() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminProductService.getCategories,
  })

  const deleteMutation = useMutation({
    mutationFn: adminProductService.deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const categories = data?.data || []

  return (
    <>
      <Helmet><title>Categories — SwiftMart Admin</title></Helmet>
      {modal !== null && <CategoryModal category={modal.category} onClose={() => setModal(null)} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={() => setModal({})} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                {['Name', 'Slug', 'Order', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.slug}</td>
                  <td className="px-4 py-3 text-gray-500">{c.display_order}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setModal({ category: c })} className="text-gray-400 hover:text-blue-500"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => window.confirm('Delete this category?') && deleteMutation.mutate(c.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
