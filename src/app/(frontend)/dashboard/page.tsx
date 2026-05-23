'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import {
  Package, Warehouse, CheckCircle, Clock, TrendingUp,
  ArrowRight, BarChart3, RefreshCw, Tag,
} from 'lucide-react'

interface DashboardData {
  user: { id: string; name: string; email: string }
  stats: {
    totalReservations: number
    pendingCount: number
    confirmedCount: number
    totalUnits: number
    totalSpend: number
    favoriteCategory: string | null
  }
  recentReservations: Array<{
    id: string
    productName: string
    category: string
    warehouseName: string
    units: number
    price: string
    status: 'PENDING' | 'CONFIRMED' | 'RELEASED'
    createdAt: string
    expiresAt: string
  }>
}

const STATUS_STYLES = {
  PENDING:   'bg-amber-100 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  RELEASED:  'bg-gray-100 text-gray-500 border-gray-200',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/dashboard')
      const json = await res.json()
      if (!json.success) { router.push('/login'); return }
      setData(json.data)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <RefreshCw size={28} className="animate-spin text-blue-500" />
        </div>
      </>
    )
  }

  if (!data) return null

  const { user, stats, recentReservations } = data

  const statCards = [
    { label: 'Total Reservations', value: stats.totalReservations, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Confirmed', value: stats.confirmedCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending', value: stats.pendingCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Units', value: stats.totalUnits, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <>
      <Navbar />
      <main className="bg-[#f8fafc] min-h-screen">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16 pt-6 pb-16">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-sm text-gray-500 mb-0.5">Welcome back,</p>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{user.name}</h1>
              <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition shadow-sm shadow-blue-200"
              >
                Browse Products <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            {statCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon size={18} className={color} />
                </div>
                <p className="text-2xl font-extrabold text-gray-900 leading-none mb-1">{value}</p>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* Second row: spend + category + quick links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-7">
            {/* Total spend */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Spend</p>
                <TrendingUp size={14} className="text-gray-300" />
              </div>
              <p className="text-3xl font-extrabold text-blue-600">
                ₹{stats.totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400 mt-1">on confirmed orders</p>
            </div>

            {/* Favorite category */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Top Category</p>
                <Tag size={14} className="text-gray-300" />
              </div>
              {stats.favoriteCategory ? (
                <>
                  <p className="text-xl font-extrabold text-gray-900">{stats.favoriteCategory}</p>
                  <p className="text-xs text-gray-400 mt-1">most reserved category</p>
                </>
              ) : (
                <p className="text-sm text-gray-400 mt-2">No reservations yet</p>
              )}
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Links</p>
              <div className="space-y-2">
                {[
                  { href: '/products', label: 'Browse Products', icon: Package },
                  { href: '/warehouses', label: 'View Warehouses', icon: Warehouse },
                ].map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition group"
                  >
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 group-hover:text-blue-600">
                      <Icon size={14} /> {label}
                    </div>
                    <ArrowRight size={12} className="text-gray-300 group-hover:text-blue-400" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent reservations */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Recent Reservations</h2>
              <span className="text-xs text-gray-400">{recentReservations.length} shown</span>
            </div>

            {recentReservations.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Package size={36} className="text-gray-200 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-sm font-semibold text-gray-500">No reservations yet</p>
                <p className="text-xs text-gray-400 mt-1">Browse products to make your first reservation</p>
                <Link href="/products" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                  Browse Products <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentReservations.map(r => {
                  const total = (parseFloat(r.price) * r.units).toFixed(2)
                  return (
                    <div key={r.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">
                      {/* Category dot */}
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Package size={15} className="text-blue-500" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{r.productName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-400">{r.warehouseName}</span>
                          <span className="text-gray-300">·</span>
                          <span className="text-[10px] text-gray-400">{r.units} unit{r.units !== 1 ? 's' : ''}</span>
                          <span className="text-gray-300">·</span>
                          <span className="text-[10px] text-gray-400">{timeAgo(r.createdAt)}</span>
                        </div>
                      </div>

                      {/* Status + amount */}
                      <div className="text-right flex-shrink-0">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${STATUS_STYLES[r.status]}`}>
                          {r.status}
                        </span>
                        <p className="text-sm font-bold text-gray-900 mt-1">₹{total}</p>
                      </div>

                      {r.status === 'PENDING' && (
                        <Link
                          href={`/checkout/${r.id}`}
                          className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                        >
                          Resume <ArrowRight size={11} />
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
