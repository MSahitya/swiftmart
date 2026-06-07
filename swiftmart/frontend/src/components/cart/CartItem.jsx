import { Trash2, Minus, Plus } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { cartService } from '../../services/cart'
import { formatPrice } from '../../utils'

export default function CartItem({ item }) {
  const qc = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: ({ quantity }) => cartService.updateItem(item.id, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
    onError: () => toast.error('Failed to update cart'),
  })

  const removeMutation = useMutation({
    mutationFn: () => cartService.removeItem(item.id),
    onMutate: async () => {
      // Optimistic update
      await qc.cancelQueries({ queryKey: ['cart'] })
      const prev = qc.getQueryData(['cart'])
      qc.setQueryData(['cart'], (old) => ({
        ...old,
        data: {
          ...old?.data,
          items: old?.data?.items?.filter((i) => i.id !== item.id) ?? [],
        },
      }))
      return { prev }
    },
    onError: (_, __, ctx) => {
      qc.setQueryData(['cart'], ctx.prev)
      toast.error('Failed to remove item')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  })

  return (
    <div className="flex gap-4 py-4">
      <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
        {item.product_image ? (
          <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 line-clamp-2">{item.product_name}</p>
        <p className="text-sm text-gray-500 mt-0.5">{formatPrice(Number(item.unit_price))} each</p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateMutation.mutate({ quantity: item.quantity - 1 })}
              disabled={updateMutation.isPending}
              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-orange-400 hover:text-orange-500 transition-colors disabled:opacity-50"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
            <button
              onClick={() => updateMutation.mutate({ quantity: item.quantity + 1 })}
              disabled={updateMutation.isPending}
              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-orange-400 hover:text-orange-500 transition-colors disabled:opacity-50"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900">{formatPrice(item.subtotal)}</span>
            <button
              onClick={() => removeMutation.mutate()}
              disabled={removeMutation.isPending}
              className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
