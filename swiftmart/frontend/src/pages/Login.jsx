import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Helmet } from 'react-helmet-async'
import { useMutation } from '@tanstack/react-query'
import { Zap, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { authService } from '../services/auth'
import { useAuthStore } from '../store/authStore'
import { loginSchema } from '../schemas'
import { getErrorMessage } from '../utils'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPwd, setShowPwd] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember_me: false },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: authService.login,
    onSuccess: (res) => {
      const { user, access_token, refresh_token } = res.data
      setAuth(user, access_token, refresh_token)
      toast.success(`Welcome back, ${user.name}!`)
      navigate('/')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <>
      <Helmet><title>Sign In — SwiftMart</title></Helmet>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 font-extrabold text-2xl text-orange-500 mb-4">
              <Zap className="w-7 h-7 fill-orange-400" /> SwiftMart
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-1">Sign in to your account</p>
          </div>

          <div className="card p-6">
            <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input {...register('email')} type="email" placeholder="you@example.com" className="input-field" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input {...register('password')} type={showPwd ? 'text' : 'password'} placeholder="••••••••" className="input-field pr-10" />
                  <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input {...register('remember_me')} type="checkbox" className="rounded accent-orange-500" />
                Remember me for 14 days
              </label>

              <button type="submit" disabled={isPending} className="btn-primary w-full py-2.5">
                {isPending ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 font-medium hover:text-orange-600">Sign up free</Link>
          </p>
        </div>
      </div>
    </>
  )
}
