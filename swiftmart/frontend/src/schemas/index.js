import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
  remember_me: z.boolean().optional(),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  phone: z.string().optional(),
})

export const checkoutSchema = z.object({
  full_name: z.string().min(2, 'Name required'),
  phone: z.string().min(10, 'Valid phone required'),
  address_line1: z.string().min(5, 'Address required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  pincode: z.string().min(4, 'Valid pincode required'),
  country: z.string().default('India'),
  payment_method: z.string().default('cash_on_delivery'),
  notes: z.string().optional(),
})

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  discount_price: z.coerce.number().positive().optional().nullable(),
  stock_qty: z.coerce.number().int().min(0),
  category_id: z.string().uuid(),
})
