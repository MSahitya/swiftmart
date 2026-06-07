import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Grid, ShoppingBag, Users, Zap, LogOut, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/auth'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Grid },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/users', label: 'Users', icon: Users },
]

export default function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, clearAuth, refreshToken } = useAuthStore()

  const handleLogout = async () => {
    try { await authService.logout(refreshToken) } catch {}
    clearAuth()
    navigate('/')
    toast.success('Logged out')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-lg">
            <Zap className="w-5 h-5 text-orange-400" />
            SwiftMart
          </Link>
          <p className="text-gray-500 text-xs mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm w-full transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Link to="/admin" className="hover:text-gray-900">Admin</Link>
            {pathname !== '/admin' && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-900 capitalize">{pathname.split('/').pop()}</span>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
