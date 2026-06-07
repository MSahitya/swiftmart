import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Helmet } from 'react-helmet-async'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { authService } from '../services/auth'
import { useAuthStore } from '../store/authStore'
import { formatDate } from '../utils'

const profileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
})

const passwordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8),
})

export default function Profile() {
  const { user, updateUser } = useAuthStore()

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', phone: user?.phone || '', address: user?.address || '' },
  })

  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) })

  const profileMutation = useMutation({
    mutationFn: authService.updateMe,
    onSuccess: (res) => {
      updateUser(res.data)
      toast.success('Profile updated')
    },
    onError: () => toast.error('Failed to update profile'),
  })

  const passwordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully')
      passwordForm.reset()
    },
    onError: (err) => toast.error(err?.response?.data?.detail || 'Failed to change password'),
  })

  return (
    <>
      <Helmet><title>My Profile — SwiftMart</title></Helmet>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        <div className="space-y-6">
          {/* Profile info */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Personal Information</h2>
            <form onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate(d))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input {...profileForm.register('name')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input value={user?.email} disabled className="input-field bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input {...profileForm.register('phone')} className="input-field" placeholder="+91 9876543210" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Address</label>
                <textarea {...profileForm.register('address')} rows={2} className="input-field resize-none" placeholder="Your delivery address" />
              </div>
              <button type="submit" disabled={profileMutation.isPending} className="btn-primary">
                {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change password */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
            <form onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate(d))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input {...passwordForm.register('current_password')} type="password" className="input-field" />
                {passwordForm.formState.errors.current_password && <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.current_password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input {...passwordForm.register('new_password')} type="password" className="input-field" />
                {passwordForm.formState.errors.new_password && <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.new_password.message}</p>}
              </div>
              <button type="submit" disabled={passwordMutation.isPending} className="btn-primary">
                {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Account info */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Account Details</h2>
            <div className="text-sm space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Role</span>
                <span className="capitalize font-medium text-gray-900">{user?.role}</span>
              </div>
              <div className="flex justify-between">
                <span>Member since</span>
                <span className="font-medium text-gray-900">{user?.created_at ? formatDate(user.created_at) : '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
