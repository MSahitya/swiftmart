export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'yellow' },
  processing: { label: 'Processing', color: 'blue' },
  out_for_delivery: { label: 'Out for Delivery', color: 'orange' },
  delivered: { label: 'Delivered', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red' },
}

export const PAYMENT_METHODS = [
  { value: 'cash_on_delivery', label: 'Cash on Delivery' },
  { value: 'card', label: 'Credit / Debit Card' },
  { value: 'upi', label: 'UPI' },
]

export const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Newest First' },
  { value: 'created_at:asc', label: 'Oldest First' },
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
  { value: 'name:asc', label: 'Name: A to Z' },
]

export const FREE_DELIVERY_THRESHOLD = 499
export const DELIVERY_FEE = 49
