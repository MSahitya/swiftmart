import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Helmet } from 'react-helmet-async'
import { Truck, CreditCard, Smartphone, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import { cartService } from '../services/cart'
import { orderService } from '../services/orders'
import { checkoutSchema } from '../schemas'
import { formatPrice } from '../utils'
import { PAYMENT_METHODS } from '../constants'

const PAYMENT_ICONS = {
  cash_on_delivery: DollarSign,
  card: CreditCard,
  upi: Smartphone,
}

export default function Checkout() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
  })
  const cart = cartData?.data

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { payment_method: 'cash_on_delivery', country: 'India' },
  })

  const paymentMethod = watch('payment_method')

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => orderService.createOrder({
      delivery_address: {
        full_name: data.full_name,
        phone: data.phone,
        address_line1: data.address_line1,
        address_line2: data.address_line2,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
      },
      payment_method: data.payment_method,
      notes: data.notes,
    }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['cart'] })
      qc.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order placed successfully!')
      navigate(`/order-confirmation/${res.data.id}`)
    },
    onError: (err) => toast.error(err?.response?.data?.detail || 'Order failed'),
  })

  const Field = ({ name, label, placeholder, type = 'text', half }) => (
    <div className={half ? 'col-span-1' : 'col-span-2'}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        className="input-field"
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
    </div>
  )

  return (
    <>
      <Helmet><title>Checkout — SwiftMart</title></Helmet>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        <form onSubmit={handleSubmit((d) => mutate(d))}>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery address */}
              <div className="card p-5">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-orange-500" /> Delivery Address
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <Field name="full_name" label="Full Name" placeholder="John Doe" />
                  <Field name="phone" label="Phone Number" placeholder="+91 9876543210" />
                  <Field name="address_line1" label="Address Line 1" placeholder="House/Flat/Block No." />
                  <Field name="address_line2" label="Address Line 2 (optional)" placeholder="Street, Landmark" />
                  <Field name="city" label="City" placeholder="Mumbai" half />
                  <Field name="state" label="State" placeholder="Maharashtra" half />
                  <Field name="pincode" label="PIN Code" placeholder="400001" half />
                  <Field name="country" label="Country" placeholder="India" half />
                </div>
              </div>

              {/* Payment */}
              <div className="card p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Payment Method</h2>
                <div className="grid grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map(({ value, label }) => {
                    const Icon = PAYMENT_ICONS[value] || DollarSign
                    return (
                      <label key={value} className={`border-2 rounded-xl p-3 cursor-pointer text-center transition-colors ${paymentMethod === value ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input {...register('payment_method')} type="radio" value={value} className="sr-only" />
                        <Icon className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === value ? 'text-orange-500' : 'text-gray-400'}`} />
                        <p className={`text-xs font-medium ${paymentMethod === value ? 'text-orange-600' : 'text-gray-600'}`}>{label}</p>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="card p-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes (optional)</label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Any special delivery instructions..."
                />
              </div>
            </div>

            {/* Order summary */}
            <div className="card p-5 h-fit sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {cart?.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600">
                    <span className="truncate mr-2">{item.product_name} × {item.quantity}</span>
                    <span className="flex-shrink-0">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatPrice(cart?.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>{cart?.delivery_fee === 0 ? <span className="text-green-600 font-medium">FREE</span> : formatPrice(cart?.delivery_fee || 0)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                  <span>Total</span><span className="text-lg">{formatPrice(cart?.total || 0)}</span>
                </div>
              </div>
              <button type="submit" disabled={isPending} className="btn-primary w-full py-3 mt-5">
                {isPending ? 'Placing Order...' : `Place Order · ${formatPrice(cart?.total || 0)}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
