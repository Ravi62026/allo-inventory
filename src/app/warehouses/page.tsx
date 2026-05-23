'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/navbar'
import { Warehouse, MapPin, Package, Loader2, AlertCircle, ArrowRight, Activity } from 'lucide-react'
import Link from 'next/link'

interface WarehouseData {
  id: string
  name: string
  location: string
  isActive: boolean
  stocks?: Array<{
    totalUnits: number
    reservedUnits: number
  }>
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await fetch('/api/warehouses')
        if (!response.ok) throw new Error('Failed to fetch warehouses')
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          setWarehouses(result.data)
        } else {
          throw new Error('Invalid response format')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading warehouses')
      } finally {
        setLoading(false)
      }
    }

    fetchWarehouses()
  }, [])

  const totalWarehouses = warehouses.length
  const activeWarehouses = warehouses.filter((w) => w.isActive).length

  return (
    <>
      <Navbar />

      <main className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-12 lg:px-20 py-12">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-1">Warehouses</h1>
            <p className="text-base sm:text-lg text-gray-600 font-medium">
              {totalWarehouses} {totalWarehouses === 1 ? 'location' : 'locations'} • {activeWarehouses} active across India
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-10">
              <div className="flex items-center gap-4">
                <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
                <div>
                  <p className="font-bold text-red-900">Error loading warehouses</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Warehouses Grid */}
          {!loading && !error && warehouses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
              {warehouses.map((wh) => {
                const totalUnits = wh.stocks?.reduce((sum, s) => sum + s.totalUnits, 0) || 0
                const reservedUnits = wh.stocks?.reduce((sum, s) => sum + s.reservedUnits, 0) || 0
                const availableUnits = totalUnits - reservedUnits
                const productCount = wh.stocks?.length || 0

                return (
                  <Link
                    key={wh.id}
                    href={wh.isActive ? `/products?warehouseId=${wh.id}` : '#'}
                    onClick={(e) => {
                      if (!wh.isActive) e.preventDefault()
                    }}
                    className="group block"
                  >
                    <div className={`relative bg-white rounded-xl border border-gray-200 overflow-hidden h-full flex flex-col transition-all duration-300 ${
                      wh.isActive
                        ? 'hover:border-blue-200 hover:shadow-lg hover:-translate-y-0.5'
                        : 'opacity-70'
                    }`}>
                      {/* Header */}
                      <div className="relative h-32 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-5 flex flex-col justify-between overflow-hidden">
                        {/* Decoration */}
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>

                        {/* Status Badge */}
                        <div className="flex justify-between items-start relative z-10">
                          <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <Warehouse className="text-white" size={20} />
                          </div>
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md ${
                            wh.isActive
                              ? 'bg-emerald-500/90 text-white'
                              : 'bg-gray-700/90 text-white'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full bg-white ${wh.isActive ? 'animate-pulse' : ''}`}></span>
                            {wh.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </div>
                        </div>

                        {/* Name */}
                        <h2 className="text-lg font-bold text-white leading-tight relative z-10 line-clamp-1">
                          {wh.name}
                        </h2>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">
                        {/* Location */}
                        <div className="flex items-start gap-2 mb-4">
                          <MapPin className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                            {wh.location}
                          </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Package size={12} className="text-gray-400" />
                              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Products</p>
                            </div>
                            <p className="text-lg font-bold text-gray-900 leading-none">{productCount}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Activity size={12} className="text-gray-400" />
                              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Available</p>
                            </div>
                            <p className="text-lg font-bold text-emerald-600 leading-none">{availableUnits}</p>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                          <p className="text-xs text-gray-500">
                            {totalUnits} total units
                          </p>
                          {wh.isActive ? (
                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold group-hover:bg-blue-700 transition-colors">
                              <span>View Stock</span>
                              <ArrowRight
                                size={12}
                                className="group-hover:translate-x-0.5 transition-transform"
                              />
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-gray-400 px-3 py-1.5">Closed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && warehouses.length === 0 && (
            <div className="text-center py-20">
              <Warehouse className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-xl text-gray-600">No warehouses available</p>
            </div>
          )}

          {/* Info Section */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                  <Package className="text-blue-600" size={20} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Real-Time Inventory</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Live stock updates across all locations for accurate availability.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                  <MapPin className="text-blue-600" size={20} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Strategic Locations</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Distributed across India for fastest delivery and lower costs.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                  <Warehouse className="text-blue-600" size={20} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Unified Management</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Single dashboard controls reservations and fulfillment everywhere.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
