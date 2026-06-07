import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { DollarSign, ShoppingBag, Users, AlertTriangle, Package } from 'lucide-react'
import { adminOrderService } from '../../services/orders'
import { formatPrice } from '../../utils'

function StatCard({ icon: Icon, title, value, sub, color }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminOrderService.getDashboard,
    refetchInterval: 30000,
  })

  const { data: lowStockData } = useQuery({
    queryKey: ['low-stock'],
    queryFn: adminOrderService.getLowStock,
  })

  const stats = data?.data
  const lowStock = lowStockData?.data || []

  if (isLoading) return (
    <div>
      <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-28" />)}
      </div>
    </div>
  )

  return (
    <>
      <Helmet><title>Dashboard — SwiftMart Admin</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={DollarSign} title="Total Revenue" value={formatPrice(stats?.total_revenue || 0)} sub="Delivered orders" color="bg-green-500" />
        <StatCard icon={ShoppingBag} title="Total Orders" value={stats?.total_orders || 0} sub={`${stats?.orders_today || 0} today`} color="bg-blue-500" />
        <StatCard icon={Users} title="Users" value={stats?.total_users || 0} sub="Registered accounts" color="bg-purple-500" />
        <StatCard icon={AlertTriangle} title="Low Stock" value={stats?.low_stock_products || 0} sub="Need restocking" color="bg-orange-500" />
      </div>

      {lowStock.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" /> Low Stock Alerts
          </h2>
          <div className="space-y-2">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-700">{p.name}</span>
                <span className={`badge ${p.stock_qty <= 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  {p.stock_qty} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
