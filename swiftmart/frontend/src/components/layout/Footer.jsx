import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-lg mb-3">
              <Zap className="w-5 h-5 text-orange-400" />
              SwiftMart
            </Link>
            <p className="text-sm leading-relaxed">
              Instant grocery & lifestyle delivery. Fresh produce, daily essentials, and more — in minutes.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?category=groceries" className="hover:text-white transition-colors">Groceries</Link></li>
              <li><Link to="/products?category=snacks" className="hover:text-white transition-colors">Snacks</Link></li>
              <li><Link to="/products?category=beverages" className="hover:text-white transition-colors">Beverages</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">My Orders</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Profile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Help</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-white cursor-pointer">Contact Us</span></li>
              <li><span className="hover:text-white cursor-pointer">Return Policy</span></li>
              <li><span className="hover:text-white cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-white cursor-pointer">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm">© {new Date().getFullYear()} SwiftMart. All rights reserved.</p>
          <p className="text-sm">Made with ❤️ for instant delivery</p>
        </div>
      </div>
    </footer>
  )
}
