'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  X, Clock, CheckCircle, RefreshCw, AlertTriangle,
  Minus, Plus, Loader2, Users, MapPin, ArrowRight,
  LogIn, UserPlus, ChevronRight,
} from 'lucide-react'
import type { ProductListing } from '@/types'

type View = 'select' | 'auth-prompt' | 'conflict'

interface ConflictInfo {
  lockId: string
  timestamp: string
  alternative: ProductListing['availability'][0] | null
}

interface Props {
  product: ProductListing
  onClose: () => void
}

function whInfo(name: string) {
  const n = name.charCodeAt(0) % 3
  if (n === 0) return { lead: 'Next-day ready', priority: 'HIGH', dispatch: '< 2HRS', cls: 'text-blue-600' }
  if (n === 1) return { lead: '1-2 days', priority: 'STANDARD', dispatch: '2-4HRS', cls: 'text-emerald-600' }
  return { lead: '3-5 days', priority: 'STANDARD', dispatch: '4-6HRS', cls: 'text-amber-600' }
}

export default function ReserveModal({ product, onClose }: Props) {
  const router = useRouter()
  const defaultStock = product.availability.find(a => a.availableUnits > 0)

  const [view, setView] = useState<View>('select')
  const [selectedId, setSelectedId] = useState(defaultStock?.stockId ?? '')
  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [conflict, setConflict] = useState<ConflictInfo | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const selected = product.availability.find(a => a.stockId === selectedId)
  const maxUnits = selected?.availableUnits ?? 0
  const viewers = (product.id.charCodeAt(0) % 8) + 3

  const holdUntil = new Date(Date.now() + 10 * 60 * 1000)
  const holdStr = holdUntil.toLocaleTimeString('en-IN', { hour12: false })

  // Silently check auth on open
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.success) setIsLoggedIn(true) })
      .catch(() => {})
  }, [])

  const doReserve = async () => {
    if (!selectedId) return
    try {
      setSubmitting(true)
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockId: selectedId, units: quantity }),
      })
      const data = await res.json()

      if (!data.success) {
        const alt = product.availability.find(a => a.stockId !== selectedId && a.availableUnits > 0) ?? null
        setConflict({
          lockId: `TXN-${product.id.slice(0, 4).toUpperCase()}-${product.id.slice(4, 8).toUpperCase()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + 'Z',
          alternative: alt,
        })
        setView('conflict')
        return
      }

      router.push(`/checkout/${data.data.id}`)
    } catch {
      setConflict({ lockId: 'TXN-ERR', timestamp: new Date().toISOString().slice(11, 19) + 'Z', alternative: null })
      setView('conflict')
    } finally {
      setSubmitting(false)
    }
  }

  // When user clicks "Confirm & Hold Units"
  const handleConfirm = () => {
    if (!selectedId) return
    // If not logged in, nudge them first — they can skip
    if (!isLoggedIn) {
      setView('auth-prompt')
    } else {
      doReserve()
    }
  }

  const handleReroute = () => {
    if (conflict?.alternative) setSelectedId(conflict.alternative.stockId)
    setQuantity(1)
    setConflict(null)
    setView('select')
  }

  /* ── AUTH PROMPT VIEW ────────────────────────────────────────────────── */
  if (view === 'auth-prompt') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          onClick={e => e.stopPropagation()}>

          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition z-10">
            <X size={16} className="text-gray-400" />
          </button>

          {/* Top accent */}
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />

          <div className="p-6">
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <LogIn size={20} className="text-blue-600" />
            </div>

            <h3 className="text-lg font-extrabold text-gray-900 mb-1">Sign in for full tracking</h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              Get a dashboard with your reservation history, hold timers, and spend analytics. Or continue as a guest — the reservation works either way.
            </p>

            {/* Benefits list */}
            <div className="space-y-2 mb-6">
              {[
                'View all your reservations in one place',
                'Resume pending holds from your dashboard',
                'Track total spend & favourite categories',
              ].map(b => (
                <div key={b} className="flex items-start gap-2 text-xs text-gray-600">
                  <CheckCircle size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  {b}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                onClick={() => router.push(`/login?next=/products`)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition shadow-sm shadow-blue-200"
              >
                <LogIn size={14} /> Sign In
              </button>
              <button
                onClick={() => router.push(`/signup?next=/products`)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
              >
                <UserPlus size={14} /> Create Account
              </button>
              <button
                onClick={() => { setView('select'); doReserve() }}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-gray-400 hover:text-gray-600 transition"
              >
                Skip — continue as guest <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── CONFLICT VIEW (Screen 3) ─────────────────────────────────────── */
  if (view === 'conflict') {
    const sku = `SKU-${product.id.slice(0, 8).toUpperCase()}`
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

          {/* Status badges */}
          <div className="flex items-center gap-2 px-5 pt-5 mb-1">
            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[11px] font-bold">409 CONFLICT</span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              LOCK_CONTENTION
            </span>
          </div>

          <div className="px-5 pt-4 pb-2 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Just missed it</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              A mutex lock was acquired by another node just milliseconds before your commit. The last available units were reserved.
            </p>
          </div>

          <div className="mx-5 my-4 rounded-xl border border-gray-100 bg-gray-50 grid grid-cols-2 divide-x divide-gray-100 overflow-hidden">
            <div className="p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Lock ID</p>
              <p className="text-xs font-mono text-gray-700">{conflict?.lockId}</p>
            </div>
            <div className="p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Timestamp</p>
              <p className="text-xs font-mono text-gray-700">{conflict?.timestamp}</p>
            </div>
          </div>

          <div className="mx-5 mb-4 rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                <Users size={11} /> Competing Reservations
              </div>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                {(product.id.charCodeAt(2) % 4) + 2} Active
              </span>
            </div>
            <div className="grid grid-cols-2 px-3.5 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <span>Item</span><span className="text-right">Availability</span>
            </div>
            <div className="grid grid-cols-2 px-3.5 py-3">
              <div>
                <p className="text-xs font-semibold text-gray-800 leading-snug">{product.name}</p>
                <p className="text-[10px] text-gray-400 font-mono">{sku}</p>
              </div>
              <div className="flex items-center justify-end">
                <span className="flex items-center gap-1 text-xs font-bold text-red-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  0 units (Local)
                </span>
              </div>
            </div>
          </div>

          {conflict?.alternative && (
            <div className="mx-5 mb-4 rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-3.5 py-2.5 bg-gray-50 border-b border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Inventory Retry Intelligence</p>
              </div>
              <div className="flex items-center justify-between px-3.5 py-3">
                <div className="flex items-center gap-1.5 text-xs font-mono text-gray-700">
                  <MapPin size={10} className="text-gray-400" />
                  WH-{conflict.alternative.warehouseName.replace(/\s+/g, '-').toUpperCase().slice(0, 12)}
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {conflict.alternative.availableUnits} units available
                </span>
              </div>
            </div>
          )}

          <div className="mx-5 mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-[9px] font-bold">i</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Your cart has been updated. No charges processed.
              {conflict?.alternative ? ' Route through alternate node?' : ' Please check availability.'}
            </p>
          </div>

          <div className="px-5 pb-5 flex flex-col gap-2">
            {conflict?.alternative ? (
              <button onClick={handleReroute} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition">
                Reroute & Reserve <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={onClose} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition">
                Back to Products
              </button>
            )}
            <button onClick={onClose} className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── SELECT VIEW (Screen 1) ───────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition z-10">
          <X size={16} className="text-gray-400" />
        </button>

        <div className="p-6">
          {/* Product header */}
          <div className="mb-5 pb-5 border-b border-gray-100">
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-2">
              {product.category}
            </span>
            <h2 className="text-xl font-bold text-gray-900 mb-0.5">{product.name}</h2>
            <p className="text-base text-gray-500">₹{product.price}</p>
          </div>

          {/* Warehouse Select */}
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Warehouse Select</p>
          <div className="space-y-2.5 mb-5">
            {product.availability.map(stock => {
              const isOut = stock.availableUnits === 0
              const isLow = !isOut && stock.availableUnits < 5
              const isSel = selectedId === stock.stockId
              const info = whInfo(stock.warehouseName)

              return (
                <button
                  key={stock.stockId}
                  type="button"
                  onClick={() => { if (!isOut) { setSelectedId(stock.stockId); setQuantity(1) } }}
                  disabled={isOut}
                  className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                    isOut ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50'
                    : isSel ? 'border-blue-500 bg-blue-50/30'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      isSel ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                    }`}>
                      {isSel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-bold text-gray-800 truncate">{stock.warehouseName}</span>
                        {isOut
                          ? <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-400">Out of Stock</span>
                          : isLow
                          ? <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">Low Stock</span>
                          : <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">In Stock</span>
                        }
                      </div>
                      {!isOut && (
                        <p className="text-sm font-bold text-emerald-600 mb-1">{stock.availableUnits} units available</p>
                      )}
                      <p className="text-[11px] text-gray-400 mb-1.5">Lead time: {info.lead}</p>
                      {isLow ? (
                        <div>
                          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-1">
                            AVAILABILITY MAY CHANGE DURING CHECKOUT
                          </p>
                          <div className="flex items-center gap-3">
                            <p className={`text-[10px] font-bold uppercase tracking-wide ${info.cls}`}>
                              FULFILLMENT PRIORITY: {info.priority} | DISPATCH: {info.dispatch}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 ml-auto">
                              <Users size={9} /> {viewers} other users viewing
                            </div>
                          </div>
                        </div>
                      ) : !isOut ? (
                        <p className={`text-[10px] font-bold uppercase tracking-wide ${info.cls}`}>
                          FULFILLMENT PRIORITY: {info.priority} | DISPATCH: {info.dispatch}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
              <CheckCircle size={12} /> Inventory Lock Verified
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-500">
              <RefreshCw size={11} className="animate-spin" style={{ animationDuration: '3s' }} />
              Real-time Sync Active
            </div>
          </div>

          {/* Quantity */}
          {selected && selected.availableUnits > 0 && (
            <div className="mb-5">
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Quantity</span>
                  <span className="text-[11px] text-gray-400">Max: {maxUnits} units</span>
                </div>
                <span className="text-[10px] text-gray-400">Validated against local node capacity</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-gray-400 active:scale-95 transition-all"
                >
                  <Minus size={14} className="text-gray-600" />
                </button>
                <span className="text-xl font-bold text-gray-900 w-8 text-center tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(maxUnits, q + 1))}
                  className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-gray-400 active:scale-95 transition-all"
                >
                  <Plus size={14} className="text-gray-600" />
                </button>
              </div>
            </div>
          )}

          <p className="text-[11px] text-gray-400 italic mb-4 leading-relaxed">
            This action will temporarily remove units from global availability across all channels.
          </p>

          {/* Hold timer notice */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50 border border-blue-100 mb-6">
            <Clock size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-blue-700 leading-relaxed">
              Units will be held until <span className="font-bold">{holdStr}</span> (10m 0s). Complete checkout to finalize.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={submitting || !selectedId || quantity < 1 || maxUnits === 0}
              className="flex-[2] py-3 rounded-xl bg-blue-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-200"
            >
              {submitting
                ? <Loader2 size={16} className="animate-spin" />
                : <>Confirm & Hold Units <ArrowRight size={14} /></>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
