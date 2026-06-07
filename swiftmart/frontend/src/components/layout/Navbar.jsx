import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, User, Menu, X, Zap, LogOut, Package } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/auth'
import { cartService } from '../../services/cart'
import { debounce } from '../../utils'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, clearAuth, refreshToken } = useAuthStore()
  const authenticated = isAuthenticated()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    enabled: authenticated,
  })

  const cartCount = cartData?.data?.item_count || 0

  const handleSearch = debounce((value) => {
    if (value.trim()) navigate(`/products?search=${encodeURIComponent(value)}`)
  }, 500)

  const handleLogout = async () => {
    try {
      await authService.logout(refreshToken)
    } catch {}
    clearAuth()
    navigate('/')
    toast.success('Logged out successfully')
  }

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-orange-500">
            <Zap className="w-6 h-6 fill-orange-400" />
            SwiftMart
          </Link>

          {/* Search bar - desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search groceries, snacks, lifestyle..."
                className="input-field pl-9 pr-4 bg-gray-50"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  handleSearch(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && search.trim()) navigate(`/products?search=${encodeURIComponent(search)}`)
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {authenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-sm font-semibold">{user?.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[80px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 card py-1 animate-fade-in shadow-lg">
                    <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <Link to="/orders" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 font-medium" onClick={() => setUserMenuOpen(false)}>
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5 hidden sm:block">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-3">Sign Up</Link>
              </div>
            )}

            <button className="md:hidden p-2" onClick={() => setMobileOpen((o) => !o)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {mobileOpen && (
          <div className="md:hidden pb-3 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="input-field pl-9 bg-gray-50"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
