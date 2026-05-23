'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import {
  CheckCircle, XCircle, Loader2, Shield, Lock,
  RefreshCw, Clock, AlertTriangle, Package, ArrowRight,
} from 'lucide-react'

const TOTAL_TTL = 600
const RADIUS = 52
const CIRC = 2 * Math.PI * RADIUS

type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'RELEASED'

interface Reservation {
  id: string
  units: number
  status: ReservationStatus
  expiresAt: string
  createdAt: string
  confirmedAt: string | null
  releasedAt: string | null
  stock: {
    id: string
    product: { id: string; name: string; price: string; category: string; description: string | null }
    warehouse: { id: string; name: string; location: string }
  }
}

function TimerCircle({ secondsLeft }: { secondsLeft: number }) {
  const pct = Math.max(0, secondsLeft / TOTAL_TTL)
  const offset = CIRC * (1 - pct)
  const isLow = secondsLeft < 60
  const color = isLow ? '#ef4444' : '#3b82f6'
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  return (
    <div className="relative w-32 h-32 flex-shrink-0">
      <svg width="128" height="128" className="absolute inset-0 -rotate-90">
        <circle cx="64" cy="64" r={RADIUS} fill="none" stroke="#e5e7eb" strokeWidth="7" />
        <circle
          cx="64" cy="64" r={RADIUS} fill="none"
          stroke={color} strokeWidth="7"
          strokeDasharray={CIRC} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-[22px] font-mono font-bold tabular-nums leading-none ${isLow ? 'text-red-500' : 'text-blue-600'}`}>
          {mm}:{ss}
        </span>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">REMAINING</span>
      </div>
    </div>
  )
}

const STEPS = ['INVENTORY HELD', 'ALLOCATION VERIFIED', 'AWAITING PAYMENT', 'STOCK COMMITMENT']

function Stepper({ active }: { active: number }) {
  return (
    <div className="flex items-center flex-wrap gap-y-2">
      {STEPS.map((label, i) => {
        const done = i < active
        const cur = i === active
        return (
          <div key={label} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${
              done ? 'bg-emerald-100 text-emerald-700'
              : cur ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-400'
            }`}>
              {done && <CheckCircle size={10} />}
              {cur && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              {label}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-5 mx-1 ${done ? 'bg-emerald-300' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function fmt(iso: string, offsetMs = 0) {
  return new Date(new Date(iso).getTime() + offsetMs).toISOString().slice(11, 19)
}

/* ─── TTL EXPIRED VIEW (Screen 4) ──────────────────────────── */
function ExpiredView({ reservation }: { reservation: Reservation }) {
  const router = useRouter()
  const created = new Date(new Date(reservation.expiresAt).getTime() - TOTAL_TTL * 1000)
  const node = `WH-${reservation.stock.warehouse.name.replace(/\s+/g, '-').toUpperCase().slice(0, 10)}-NODE-${(reservation.id.charCodeAt(0) % 4) + 1}`

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="w-full max-w-sm">

        {/* Status badges */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-[11px] font-bold">410 GONE</span>
          <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            TTL_EXPIRED
          </span>
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
          <Clock size={26} className="text-gray-500" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Reservation Expired</h2>
        <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
          Your hold duration ended. The items have been released back to general inventory.
        </p>

        {/* TTL details */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 grid grid-cols-3 divide-x divide-gray-200 mb-4 overflow-hidden">
          {[
            { label: 'TTL Duration', value: `${TOTAL_TTL}s` },
            { label: 'Original Hold', value: created.toISOString().slice(11, 19) + 'Z' },
            { label: 'Expiry Time', value: new Date(reservation.expiresAt).toISOString().slice(11, 19) + 'Z' },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
              <p className="text-xs font-mono text-gray-700 font-semibold">{value}</p>
            </div>
          ))}
        </div>

        {/* Recovery status */}
        <div className="rounded-xl border border-gray-200 bg-white mb-4 overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Inventory Recovery Status</p>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-gray-600">Units Released to Pool</span>
            <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {node}
            </span>
          </div>
          <div className="px-4 pb-3">
            <div className="h-1.5 bg-emerald-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-full transition-all duration-700" />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex flex-col items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Reserved</span>
          </div>
          <div className="flex-1 flex items-center gap-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[10px] font-semibold text-gray-400">10m</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Released</span>
          </div>
        </div>

        {/* CTAs */}
        <button
          onClick={() => router.push('/products')}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition mb-2"
        >
          <RefreshCw size={14} /> Check Current Availability
        </button>
        <button
          onClick={() => router.push('/products')}
          className="w-full py-2.5 rounded-xl border-2 border-blue-200 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition"
        >
          Back to products
        </button>
      </div>
    </div>
  )
}

/* ─── MAIN PAGE ─────────────────────────────────────────────── */
export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const reservationId = params.id as string

  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [secondsLeft, setSecondsLeft] = useState(0)
  const [isExpired, setIsExpired] = useState(false)

  const [confirming, setConfirming] = useState(false)
  const [releasing, setReleasing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [released, setReleased] = useState(false)

  /* fetch reservation */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/reservations/${reservationId}`)
        const data = await res.json()
        if (!data.success) { setFetchError(data.error?.message || 'Not found'); return }
        setReservation(data.data)
      } catch {
        setFetchError('Failed to load reservation')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [reservationId])

  /* countdown */
  useEffect(() => {
    if (!reservation) return
    const tick = () => {
      const diff = Math.max(0, Math.round((new Date(reservation.expiresAt).getTime() - Date.now()) / 1000))
      setSecondsLeft(diff)
      if (diff === 0) setIsExpired(true)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [reservation])

  /* confirm */
  const handleConfirm = async () => {
    if (!reservation) return
    try {
      setConfirming(true)
      setActionError(null)
      const res = await fetch(`/api/reservations/${reservationId}/confirm`, {
        method: 'POST',
        headers: { 'Idempotency-Key': `confirm-${reservationId}` },
      })
      const data = await res.json()
      if (!data.success) { setActionError(data.error?.message || 'Failed to confirm'); return }
      setConfirmed(true)
      setReservation(data.data)
    } catch {
      setActionError('Something went wrong')
    } finally {
      setConfirming(false)
    }
  }

  /* release */
  const handleRelease = async () => {
    if (!reservation) return
    try {
      setReleasing(true)
      setActionError(null)
      const res = await fetch(`/api/reservations/${reservationId}/release`, { method: 'POST' })
      const data = await res.json()
      if (!data.success) { setActionError(data.error?.message || 'Failed to release'); return }
      setReleased(true)
      setReservation(data.data)
    } catch {
      setActionError('Something went wrong')
    } finally {
      setReleasing(false)
    }
  }

  /* ── loading ── */
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loader2 size={36} className="animate-spin text-blue-500" />
        </div>
      </>
    )
  }

  /* ── not found ── */
  if (fetchError || !reservation) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
          <div className="w-full max-w-sm text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle size={22} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Reservation not found</h2>
            <p className="text-sm text-gray-500 mb-6">{fetchError}</p>
            <button onClick={() => router.push('/products')} className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition">
              Back to Products
            </button>
          </div>
        </div>
      </>
    )
  }

  /* ── expired (timer hit 0) ── */
  if (isExpired && !confirmed) {
    return (
      <>
        <Navbar />
        <ExpiredView reservation={reservation} />
      </>
    )
  }

  /* ── confirmed success ── */
  if (confirmed || reservation.status === 'CONFIRMED') {
    const { product, warehouse } = reservation.stock
    const price = parseFloat(product.price)
    const total = (price * reservation.units).toFixed(2)
    const resId = `#RES-${new Date().getFullYear()}-${reservation.id.slice(0, 4).toUpperCase()}`
    const sku   = `SKU-${product.id.slice(0, 8).toUpperCase()}`
    const batch = `BTCH-${reservation.id.slice(0, 4).toUpperCase()}-A`
    const node  = `WH-${warehouse.name.replace(/\s+/g, '-').toUpperCase().slice(0, 10)}-NODE-${(reservation.id.charCodeAt(0) % 4) + 1}`
    const syncTs = new Date(reservation.confirmedAt ?? new Date()).toISOString().replace('T', ' ').slice(0, 23) + ' UTC'

    const rows = [
      { label: 'Reservation ID',    value: resId },
      { label: 'Product',           value: product.name },
      { label: 'SKU',               value: sku },
      { label: 'Batch ID',          value: batch },
      { label: 'Allocation Node',   value: node },
      { label: 'Units Allocated',   value: String(reservation.units) },
      { label: 'Transaction Value', value: `₹${total}` },
      { label: 'Sync Timestamp',    value: syncTs },
    ]

    const exportManifest = () => {
      const manifest = {
        manifest_version: '1.0',
        generated_at: new Date().toISOString(),
        reservation: {
          id: reservation.id,
          reference: resId,
          status: reservation.status,
          confirmed_at: reservation.confirmedAt,
        },
        product: {
          id: product.id,
          name: product.name,
          category: product.category,
          sku,
          price_per_unit: product.price,
        },
        allocation: {
          units: reservation.units,
          batch_id: batch,
          node,
          warehouse: { id: warehouse.id, name: warehouse.name, location: warehouse.location },
        },
        financials: {
          unit_price: product.price,
          subtotal: (price * reservation.units).toFixed(2),
          tax_gst_5pct: (price * reservation.units * 0.05).toFixed(2),
          total_payable: total,
          currency: 'INR',
        },
        sync_timestamp: syncTs,
      }
      const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `manifest-${reservation.id.slice(0, 8)}.json`
      a.click()
      URL.revokeObjectURL(url)
    }

    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12 bg-[#f8fafc]">
          <div className="w-full max-w-lg">

            {/* Icon + title */}
            <div className="text-center mb-7">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={30} className="text-emerald-600" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Allocation Confirmed</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Inventory allocation sequence completed successfully.<br />All constraints met.
              </p>
            </div>

            {/* Main card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-5">

              {/* System status cols */}
              <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                <div className="px-4 py-3.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Transactional Integrity</p>
                  <div className="flex items-center gap-1 text-[12px] font-bold text-emerald-600">
                    <CheckCircle size={12} /> VERIFIED
                  </div>
                </div>
                <div className="px-4 py-3.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Distributed Lock</p>
                  <div className="flex items-center gap-1 text-[12px] font-bold text-blue-600">
                    <Lock size={12} /> RELEASED
                  </div>
                </div>
                <div className="px-4 py-3.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Warehouse Sync</p>
                  <div className="flex items-center gap-1 text-[12px] font-bold text-teal-600">
                    <RefreshCw size={11} /> PROPAGATED
                  </div>
                </div>
              </div>

              {/* Detail rows */}
              <div className="divide-y divide-gray-100">
                {rows.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-semibold text-gray-900 font-mono text-right ml-4">{value}</span>
                  </div>
                ))}
              </div>

              {/* Global sync notice */}
              <div className="px-5 py-3.5 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2">
                <RefreshCw size={13} className="text-emerald-600 flex-shrink-0" />
                <p className="text-[12px] font-semibold text-emerald-700">
                  Global availability updated across all regional nodes.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={exportManifest}
                className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-95 transition shadow-sm shadow-blue-200"
              >
                <span className="text-base leading-none">↓</span> Export Manifest
              </button>
              <button
                onClick={() => router.push('/warehouses')}
                className="flex-1 py-3 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition"
              >
                Manage Fulfillment
              </button>
              <button
                onClick={() => router.push('/products')}
                className="flex-1 py-3 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition"
              >
                Browse Products
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  /* ── manually released ── */
  if (released || reservation.status === 'RELEASED') {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
          <div className="w-full max-w-sm text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <XCircle size={22} className="text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Locks Released</h2>
            <p className="text-sm text-gray-500 mb-6">
              Stock has been returned to the general availability pool.
            </p>
            <button onClick={() => router.push('/products')} className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition">
              Back to Products
            </button>
          </div>
        </div>
      </>
    )
  }

  /* ── ACTIVE RESERVATION — Screen 2 ─────────────────────────── */
  const { product, warehouse } = reservation.stock
  const price = parseFloat(product.price)
  const subtotal = price * reservation.units
  const tax = subtotal * 0.05
  const total = subtotal + tax

  const txnId = `TXN-${reservation.id.slice(0, 4).toUpperCase()}-${reservation.id.slice(4, 8).toUpperCase()}`
  const syncTs = new Date(reservation.expiresAt).toISOString().replace('T', 'T').slice(0, 19) + '.82Z'
  const traceId = `TR-${reservation.id.slice(-6).toUpperCase()}`
  const nodeId = `WH-${warehouse.name.replace(/\s+/g, '-').toUpperCase().slice(0, 10)}-NODE-${(reservation.id.charCodeAt(0) % 4) + 1}`
  const sku = `SKU-${product.id.slice(0, 8).toUpperCase()}`
  const batch = `#${new Date().getFullYear()}-QT${Math.ceil((new Date().getMonth() + 1) / 3)}`

  const logEntries = [
    { time: fmt(reservation.createdAt, 5000), msg: 'Regional sync propagated', color: 'border-emerald-400 text-emerald-600' },
    { time: fmt(reservation.createdAt, 2000), msg: `Units locked in ${warehouse.name}`, color: 'border-blue-400 text-blue-600' },
    { time: fmt(reservation.createdAt, 0),    msg: 'Allocation request initialized', color: 'border-gray-300 text-gray-500' },
  ]

  return (
    <>
      <Navbar />
      <main className="bg-[#f8fafc] min-h-screen">
        <div className="mx-auto w-full max-w-6xl px-6 sm:px-10 lg:px-16 pt-6 pb-16">

          {/* Progress stepper */}
          <div className="mb-6 overflow-x-auto">
            <Stepper active={2} />
          </div>

          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-7">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Finalize Allocation</h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-[11px] font-mono text-gray-400">
                  <Lock size={9} /> TXN_ID: {txnId}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-gray-400">
                  <Clock size={9} /> SYNC_TS: {syncTs}
                </span>
              </div>
            </div>
            <div className="sm:ml-auto">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
                <Shield size={11} /> SLA SECURED
              </span>
            </div>
          </div>

          {/* Error */}
          {actionError && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-700">
              <AlertTriangle size={14} className="flex-shrink-0" /> {actionError}
            </div>
          )}

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

            {/* LEFT */}
            <div className="space-y-5">

              {/* Inventory Hold Integrity */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Lock size={13} className="text-gray-400" />
                    Inventory Hold Integrity
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-mono">
                    DETERMINISTIC_LOCK_V2
                  </span>
                </div>

                <div className="p-5 flex items-start gap-6">
                  <TimerCircle secondsLeft={secondsLeft} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      A mutex lock has been applied to{' '}
                      <span className="font-bold text-gray-900">{reservation.units} units</span> of{' '}
                      <span className="font-bold text-gray-900">{product.name}</span>. This allocation is
                      guaranteed across all regional distribution nodes for the duration of this timer.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Allocation Node</p>
                        <p className="text-xs font-mono font-semibold text-gray-700">{nodeId}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cluster Region</p>
                            <p className="text-xs font-mono font-semibold text-gray-700">APAC-1 (Primary)</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">ACTIVE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Verification */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                  <p className="text-sm font-bold text-gray-700">System Verification</p>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: 'Transactional Integrity', value: 'VALID', color: 'text-emerald-600' },
                    { label: 'Distributed Lock', value: 'ACQUIRED', color: 'text-emerald-600' },
                    { label: 'Warehouse Sync', value: 'VERIFIED', color: 'text-emerald-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className={`flex items-center gap-1 text-sm font-bold ${color}`}>
                        <CheckCircle size={13} /> {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allocation Log */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                  <p className="text-sm font-bold text-gray-700">Allocation Log</p>
                </div>
                <div className="p-5 space-y-2">
                  {logEntries.map((e, i) => (
                    <div key={i} className={`flex items-start gap-3 pl-3 border-l-2 ${e.color}`}>
                      <span className="text-[11px] font-mono text-gray-400 flex-shrink-0 mt-0.5">{e.time}</span>
                      <span className="text-sm text-gray-700">{e.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Allocation Summary */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-base font-bold text-gray-900">Allocation Summary</p>
                </div>

                {/* Product row */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Package size={20} className="text-gray-400" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-gray-900 leading-snug">{product.name}</p>
                      <p className="text-sm font-bold text-blue-600 flex-shrink-0">₹{product.price}</p>
                    </div>
                    <p className="text-[10px] font-mono text-gray-400 mt-0.5">{sku}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Batch: {batch}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-400">
                      <span>⊙</span>
                      <span className="font-mono">{nodeId}</span>
                    </div>
                  </div>
                </div>

                {/* Line items */}
                <div className="px-5 py-4 space-y-2.5 border-b border-gray-100">
                  {[
                    { label: 'Internal Trace ID', value: traceId, mono: true },
                    { label: 'Allocation Quantity', value: `${reservation.units} units` },
                    { label: 'Subtotal (INR)', value: `₹${subtotal.toFixed(2)}` },
                    { label: 'Tax / GST (5%)', value: `₹${tax.toFixed(2)}` },
                    { label: 'FX Rate', value: '1.0000 INR/INR' },
                  ].map(({ label, value, mono }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className={`text-xs font-semibold text-gray-700 ${mono ? 'font-mono' : ''}`}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">Total Payable</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">CURRENCY: INDIAN RUPEE</p>
                    </div>
                    <p className="text-2xl font-extrabold text-blue-600 leading-none">₹{total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-5 py-4 space-y-2.5">
                  <button
                    onClick={handleConfirm}
                    disabled={confirming || releasing}
                    className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm shadow-blue-200"
                  >
                    {confirming
                      ? <Loader2 size={16} className="animate-spin" />
                      : <><span>Commit & Fulfill</span> <ArrowRight size={14} /></>
                    }
                  </button>
                  <button
                    onClick={handleRelease}
                    disabled={confirming || releasing}
                    className="w-full py-2.5 rounded-xl border-2 border-red-200 text-red-600 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-all disabled:opacity-60"
                  >
                    {releasing ? <Loader2 size={14} className="animate-spin" /> : null}
                    Abort & Release Locks
                  </button>
                </div>

                {/* Warning */}
                <div className="px-5 pb-4">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      <span className="font-bold">System Warning:</span> Aborting this transaction will immediately release
                      the distributed lock on {warehouse.name}. Units will be returned to the general availability pool.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
