'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/navbar'
import {
  Clock, Lock, Package, Users, Warehouse,
  AlertTriangle, CheckCircle, XCircle, ArrowRight, MapPin, Activity
} from 'lucide-react'
import type { ProductListing } from '@/types'
import type { Warehouse as WarehouseType } from '@prisma/client'
import ReserveModal from '@/components/reserve-modal'

function getDemandLevel(totalUnits: number, reservedUnits: number, availableUnits: number) {
  if (availableUnits === 0)
    return { label: 'Stock Depleted', pill: 'bg-red-100 text-red-700 border-red-200', bar: 'bg-red-400', pct: 100 }
  const pct = totalUnits > 0 ? (reservedUnits / totalUnits) * 100 : 0
  if (pct >= 70)
    return { label: 'High Demand', pill: 'bg-orange-100 text-orange-700 border-orange-200', bar: 'bg-orange-400', pct }
  if (pct >= 35)
    return { label: 'Moderate Demand', pill: 'bg-amber-100 text-amber-700 border-amber-200', bar: 'bg-amber-400', pct }
  return { label: 'Available', pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-400', pct }
}

const CATEGORY_STYLES: Record<string, { pill: string; accent: string }> = {
  DIAGNOSTIC: { pill: 'bg-violet-100 text-violet-700 border-violet-200', accent: 'from-violet-500 to-purple-600' },
  PPE:        { pill: 'bg-blue-100 text-blue-700 border-blue-200',       accent: 'from-blue-500 to-blue-600' },
  CONSUMABLES:{ pill: 'bg-teal-100 text-teal-700 border-teal-200',       accent: 'from-teal-500 to-cyan-600' },
  EQUIPMENT:  { pill: 'bg-indigo-100 text-indigo-700 border-indigo-200', accent: 'from-indigo-500 to-blue-600' },
  REAGENTS:   { pill: 'bg-rose-100 text-rose-700 border-rose-200',       accent: 'from-rose-500 to-pink-600' },
}
function getCatStyle(cat: string) {
  return CATEGORY_STYLES[cat?.toUpperCase()] ?? { pill: 'bg-gray-100 text-gray-600 border-gray-200', accent: 'from-gray-400 to-gray-500' }
}

function stableCount(id: string, min: number, range: number) {
  const n = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return (n % range) + min
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductListing[]>([])
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [reservingProduct, setReservingProduct] = useState<ProductListing | null>(null)
  // Prefs: wait for user pref check before first fetch
  const [prefsReady, setPrefsReady] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // On mount: check auth, load saved filters from Redis via /api/auth/prefs
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const meRes = await fetch('/api/auth/me')
        const meData = await meRes.json()
        if (meData.success) {
          setUserId(meData.data.id)
          const prefsRes = await fetch('/api/auth/prefs')
          const prefsData = await prefsRes.json()
          if (prefsData.success && prefsData.data) {
            if (prefsData.data.category)    setSelectedCategory(prefsData.data.category)
            if (prefsData.data.warehouseId) setSelectedWarehouse(prefsData.data.warehouseId)
            if (prefsData.data.inStockOnly) setInStockOnly(prefsData.data.inStockOnly)
          }
        }
      } finally {
        setPrefsReady(true)
      }
    }
    loadPrefs()
  }, [])

  // Debounce-save prefs when filters change (only if logged in)
  useEffect(() => {
    if (!userId || !prefsReady) return
    const timer = setTimeout(() => {
      fetch('/api/auth/prefs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: selectedCategory, warehouseId: selectedWarehouse, inStockOnly }),
      }).catch(() => {})
    }, 800)
    return () => clearTimeout(timer)
  }, [selectedCategory, selectedWarehouse, inStockOnly, userId, prefsReady])

  useEffect(() => {
    if (!prefsReady) return // wait until prefs are loaded to avoid double-fetch
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const whRes = await fetch('/api/warehouses')
        if (!whRes.ok) throw new Error('Failed to fetch warehouses')
        const whData = await whRes.json()
        if (whData.success) setWarehouses(whData.data)

        const params = new URLSearchParams()
        if (selectedCategory) params.append('category', selectedCategory)
        if (selectedWarehouse) params.append('warehouseId', selectedWarehouse)
        if (inStockOnly) params.append('inStockOnly', 'true')

        const prodRes = await fetch(`/api/products?${params}`)
        if (!prodRes.ok) throw new Error('Failed to fetch products')
        const prodData = await prodRes.json()
        if (prodData.success) setProducts(prodData.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedCategory, selectedWarehouse, inStockOnly, prefsReady])

  const categories = [...new Set(products.map(p => p.category))]
  const totalAvailableUnits = products.reduce(
    (sum, p) => sum + p.availability.reduce((a, s) => a + s.availableUnits, 0), 0
  )

  return (
    <>
      <Navbar />

      <main className="bg-[#f8fafc] min-h-screen">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16 pt-6 pb-16">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-semibold text-emerald-700 tracking-wide">LIVE INVENTORY</span>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Products</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                <span className="font-semibold text-gray-700">{totalAvailableUnits.toLocaleString()}</span> units available ·{' '}
                <span className="font-semibold text-gray-700">{warehouses.length}</span> warehouses ·{' '}
                <span className="font-semibold text-gray-700">{products.length}</span> products
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider">In Stock</p>
                <p className="text-lg font-bold text-gray-800">{products.filter(p => p.availability.some(a => a.availableUnits > 0)).length}</p>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden sm:block" />
              <div className="text-right hidden sm:block">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider">Out of Stock</p>
                <p className="text-lg font-bold text-red-500">{products.filter(p => p.availability.every(a => a.availableUnits === 0)).length}</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-7">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Filter</span>
              <button
                onClick={() => { setSelectedCategory(''); setSelectedWarehouse(''); setInStockOnly(false) }}
                className="text-[11px] font-semibold text-gray-400 hover:text-red-500 transition-colors"
              >
                Reset all
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white hover:border-gray-300 transition text-gray-700"
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                value={selectedWarehouse}
                onChange={e => setSelectedWarehouse(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white hover:border-gray-300 transition text-gray-700"
              >
                <option value="">All Warehouses</option>
                {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
              </select>

              <label className="flex items-center gap-3 px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:border-gray-300 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700 font-medium">In Stock Only</span>
              </label>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="h-1.5 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="flex gap-2"><div className="h-5 w-20 bg-gray-100 rounded-md" /><div className="h-5 w-28 bg-gray-100 rounded-md" /></div>
                    <div className="h-5 w-3/4 bg-gray-100 rounded" />
                    <div className="h-3 w-full bg-gray-100 rounded" />
                    <div className="h-2 w-full bg-gray-100 rounded-full" />
                  </div>
                  <div className="px-5 pb-5 space-y-3">
                    {[...Array(2)].map((_, j) => (
                      <div key={j} className="space-y-1.5">
                        <div className="h-3 w-1/2 bg-gray-100 rounded" />
                        <div className="h-1.5 w-full bg-gray-100 rounded-full" />
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-3.5 border-t border-gray-100 flex justify-between">
                    <div className="h-4 w-32 bg-gray-100 rounded" />
                    <div className="h-8 w-24 bg-gray-100 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6">
              <p className="font-semibold text-sm">Error: {error}</p>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && (
            products.length === 0 ? (
              <div className="text-center py-20">
                <Package size={44} className="text-gray-200 mx-auto mb-4" strokeWidth={1.5} />
                <p className="text-lg font-semibold text-gray-500">No products found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {products.map(product => {
                  const totalAvail = product.availability.reduce((s, a) => s + a.availableUnits, 0)
                  const totalRes   = product.availability.reduce((s, a) => s + a.reservedUnits, 0)
                  const totalPending = product.availability.reduce((s, a) => s + a.pendingUnits, 0)
                  const totalUnits = product.availability.reduce((s, a) => s + a.totalUnits, 0)
                  const isInStock  = totalAvail > 0
                  const isLowStock = totalAvail > 0 && totalAvail < 10
                  const demand     = getDemandLevel(totalUnits, totalRes, totalAvail)
                  const catStyle   = getCatStyle(product.category)
                  const sku        = `SKU-${product.id.slice(0, 8).toUpperCase()}`
                  const viewers    = stableCount(product.id, 4, 20)

                  const topAccent = !isInStock
                    ? 'from-red-400 to-red-500'
                    : isLowStock
                    ? 'from-orange-400 to-amber-500'
                    : catStyle.accent

                  return (
                    <div
                      key={product.id}
                      className={`bg-white rounded-2xl border flex flex-col overflow-hidden transition-all duration-200 ${
                        isInStock
                          ? 'border-gray-200 hover:border-blue-200 hover:shadow-lg hover:-translate-y-0.5'
                          : 'border-gray-200 opacity-80'
                      } shadow-sm`}
                    >
                      {/* Colored accent bar */}
                      <div className={`h-1 bg-gradient-to-r ${topAccent} flex-shrink-0`} />

                      {/* Card Header */}
                      <div className="px-5 pt-4 pb-4 border-b border-gray-100">
                        {/* Top row: badges */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${catStyle.pill}`}>
                              {product.category}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                              {sku}
                            </span>
                          </div>
                          {isLowStock && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex-shrink-0">
                              <AlertTriangle size={9} />
                              LOW STOCK
                            </span>
                          )}
                          {!isInStock && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 flex-shrink-0">
                              <XCircle size={9} />
                              OUT OF STOCK
                            </span>
                          )}
                        </div>

                        {/* Name + Price */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-[15px] font-bold text-gray-900 leading-snug mb-0.5 truncate">
                              {product.name}
                            </h3>
                            <p className="text-[12px] text-gray-400 line-clamp-1 leading-relaxed">
                              {product.description || 'Premium quality product'}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="text-[22px] font-extrabold text-blue-600 leading-none tracking-tight">
                              ₹{product.price}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">per unit</p>
                          </div>
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1 text-[11px] text-gray-400">
                            <Clock size={10} />
                            <span>2–4 hr lead time</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-gray-400">
                            <Activity size={10} />
                            <span className={`font-semibold ${demand.pill.includes('red') ? 'text-red-600' : demand.pill.includes('orange') ? 'text-orange-600' : demand.pill.includes('amber') ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {demand.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-gray-400 ml-auto">
                            <Users size={10} />
                            <span>{viewers} viewing</span>
                          </div>
                        </div>

                        {/* Demand bar */}
                        <div className="mt-2.5">
                          <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                            <span>Reservation pressure</span>
                            <span className="font-semibold">{Math.round(demand.pct)}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${demand.bar}`}
                              style={{ width: `${Math.max(2, demand.pct)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Warehouse Stock Table */}
                      <div className="px-5 py-4 flex-1">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                            <Warehouse size={11} />
                            Stock by Location
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {product.availability.length} warehouse{product.availability.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {product.availability.map(stock => {
                            const fillPct = stock.totalUnits > 0
                              ? (stock.availableUnits / stock.totalUnits) * 100
                              : 0
                            const isStockLow = stock.availableUnits > 0 && stock.availableUnits < 5
                            const barColor = stock.availableUnits === 0
                              ? 'bg-red-300'
                              : isStockLow
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                            const dotColor = stock.availableUnits > 10
                              ? 'bg-emerald-500'
                              : stock.availableUnits > 0
                              ? 'bg-amber-400'
                              : 'bg-red-400'

                            return (
                              <div key={stock.stockId} className="rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2.5">
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                                    <span className="text-[12px] font-semibold text-gray-800 truncate">
                                      {stock.warehouseName}
                                    </span>
                                    <span className="flex items-center gap-0.5 text-[10px] text-gray-400 hidden sm:flex">
                                      <MapPin size={8} />
                                      {stock.warehouseLocation}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {isStockLow && <AlertTriangle size={9} className="text-amber-500" />}
                                    <span className={`text-[12px] font-bold ${
                                      stock.availableUnits === 0 ? 'text-red-500' :
                                      isStockLow ? 'text-amber-600' : 'text-emerald-600'
                                    }`}>
                                      {stock.availableUnits === 0 ? 'Out of stock' : `${stock.availableUnits} available`}
                                    </span>
                                  </div>
                                </div>

                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                    style={{ width: `${Math.max(2, fillPct)}%` }}
                                  />
                                </div>

                                <div className="flex justify-between text-[10px] text-gray-400">
                                  <span>
                                    <span className="text-emerald-600 font-medium">{stock.availableUnits}</span> avl ·{' '}
                                    <span className="text-orange-500 font-medium">{stock.pendingUnits}</span> held ·{' '}
                                    <span className="font-medium">{stock.totalUnits}</span> total
                                  </span>
                                  <span className="text-gray-300">synced now</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between gap-3 rounded-b-2xl">
                        <div className="flex items-center gap-1.5">
                          {totalPending > 0 ? (
                            <>
                              <Lock size={11} className="text-orange-400 flex-shrink-0" />
                              <span className="text-[11px] font-semibold text-orange-600">
                                {totalPending} unit{totalPending !== 1 ? 's' : ''} held
                              </span>
                            </>
                          ) : (
                            <>
                              <CheckCircle size={11} className="text-emerald-500 flex-shrink-0" />
                              <span className="text-[11px] text-gray-500">No active holds</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isInStock ? (
                            <button
                              onClick={() => setReservingProduct(product)}
                              className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200"
                            >
                              Reserve
                              <ArrowRight size={12} />
                            </button>
                          ) : (
                            <button
                              disabled
                              className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-gray-400 bg-gray-100 rounded-xl cursor-not-allowed border border-gray-200"
                            >
                              <XCircle size={12} />
                              Unavailable
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}
        </div>
      </main>

      {reservingProduct && (
        <ReserveModal product={reservingProduct} onClose={() => setReservingProduct(null)} />
      )}
    </>
  )
}
