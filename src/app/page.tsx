'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { ArrowRight, Code2, Network, Shuffle, FileText, CheckCircle2 } from 'lucide-react'

interface LiveEvent {
  timestamp: string
  type: 'RESERVED' | 'RELEASED' | 'COMMITTED'
  details: string
  location: string
  latency: string
}

const seedEvents: LiveEvent[] = [
  { timestamp: '14:02:11.492', type: 'RESERVED', details: 'SKU-492 lock acquired (qty: 1)', location: 'Mumbai WH', latency: '8ms' },
  { timestamp: '14:02:09.118', type: 'RELEASED', details: 'SKU-102 TTL expired (unpaid)', location: 'Delhi Hub', latency: '11ms' },
  { timestamp: '14:02:05.881', type: 'COMMITTED', details: 'SKU-881 payment success confirmed', location: 'Mumbai WH', latency: '14ms' },
  { timestamp: '14:02:01.204', type: 'RESERVED', details: 'SKU-204 lock acquired (qty: 3)', location: 'Bengaluru Hub', latency: '9ms' },
]

export default function Home() {
  const [events, setEvents] = useState<LiveEvent[]>(seedEvents)
  const [throughput, setThroughput] = useState(1246)
  const [latency, setLatency] = useState(12)

  useEffect(() => {
    const interval = setInterval(() => {
      const skus = ['SKU-492', 'SKU-102', 'SKU-881', 'SKU-204', 'SKU-715', 'SKU-339', 'SKU-628']
      const locations = ['Mumbai WH', 'Delhi Hub', 'Bengaluru Hub']
      const types: LiveEvent['type'][] = ['RESERVED', 'RELEASED', 'COMMITTED']
      const type = types[Math.floor(Math.random() * types.length)]
      const sku = skus[Math.floor(Math.random() * skus.length)]
      const qty = Math.floor(Math.random() * 5) + 1
      const details =
        type === 'RESERVED' ? `${sku} lock acquired (qty: ${qty})`
        : type === 'RELEASED' ? `${sku} TTL expired (unpaid)`
        : `${sku} payment success confirmed`

      const now = new Date()
      const newEvent: LiveEvent = {
        timestamp: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`,
        type,
        details,
        location: locations[Math.floor(Math.random() * locations.length)],
        latency: `${Math.floor(Math.random() * 15) + 6}ms`,
      }

      setEvents((prev) => [newEvent, ...prev].slice(0, 4))
      setThroughput((prev) => prev + Math.floor(Math.random() * 5) - 2)
      setLatency(() => Math.floor(Math.random() * 8) + 8)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const eventColors = {
    RESERVED: 'bg-blue-50 text-blue-700 border-blue-100',
    RELEASED: 'bg-amber-50 text-amber-700 border-amber-100',
    COMMITTED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  }

  return (
    <>
      {/* Top Status Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-8 py-2 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-6 text-[10px] sm:text-[11px] font-mono text-gray-500 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SYSTEM STATUS: <span className="text-emerald-600 font-semibold">OPERATIONAL</span></span>
          </div>
          <span className="text-gray-300">|</span>
          <span>GLOBAL RESERVATION THROUGHPUT: <span className="text-gray-900 font-semibold tabular-nums">{throughput.toLocaleString()} UNITS/HR</span></span>
          <span className="text-gray-300">|</span>
          <span>API LATENCY: <span className="text-gray-900 font-semibold tabular-nums">{latency}MS P99</span></span>
          <span className="text-gray-300">|</span>
          <span>DB LOCK CONTENTION: <span className="text-gray-900 font-semibold">&lt; 0.01%</span></span>
        </div>
      </div>

      <Navbar />

      <main className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-8 py-20 sm:py-28 overflow-hidden">
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          ></div>

          <div className="max-w-5xl mx-auto text-center relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 mb-8 shadow-sm hover:shadow-md transition-shadow">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              v2.4.0 Engine Deployed
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1]">
              Deterministic inventory.<br />
              Zero overselling.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              A distributed locking system for high-volume commerce. Hold units at checkout, auto-release on timeout, commit on success. Build reliable fulfillment pipelines.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
              <Link
                href="/products"
                className="group inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                Start Integration
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/how-it-works"
                className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <FileText size={16} />
                Read API Docs
              </Link>
            </div>

            {/* Code Block */}
            <div className="max-w-3xl mx-auto group">
              <div className="bg-[#1a1a1a] rounded-xl shadow-2xl overflow-hidden border border-gray-800 hover:shadow-blue-500/10 hover:shadow-2xl transition-shadow duration-500">
                {/* Window header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-[#222]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="ml-3 text-xs font-mono text-gray-500">POST /v1/reservations/lock</span>
                </div>

                {/* Code */}
                <pre className="p-5 text-left text-[13px] font-mono leading-relaxed overflow-x-auto">
                  <code>
                    <span className="text-pink-400">const</span> <span className="text-blue-300">reservation</span> = <span className="text-pink-400">await</span> <span className="text-yellow-300">allo</span>.<span className="text-green-300">lock</span>({'({'}<br />
                    {'  '}<span className="text-blue-300">sku</span>: <span className="text-orange-300">{'"SKU-492"'}</span>,<br />
                    {'  '}<span className="text-blue-300">quantity</span>: <span className="text-purple-300">1</span>,<br />
                    {'  '}<span className="text-blue-300">ttl_seconds</span>: <span className="text-purple-300">600</span>,<br />
                    {'  '}<span className="text-blue-300">idempotency_key</span>: <span className="text-orange-300">{'"req_93kd92k1"'}</span><br />
                    {'}'});<br />
                    <br />
                    <span className="text-gray-500">{'// Returns strict ACID-compliant hold guarantee'}</span><br />
                    <span className="text-pink-400">if</span> (<span className="text-blue-300">reservation</span>.<span className="text-green-300">status</span> === <span className="text-orange-300">{"'HELD'"}</span>) {'{'}<br />
                    {'  '}<span className="text-pink-400">await</span> <span className="text-green-300">processPayment</span>();<br />
                    {'}'}<br />
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-4 sm:px-8 py-12 bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Code2, label: 'Products Tracked', value: '12' },
              { icon: Network, label: 'Active Warehouses', value: '3' },
              { icon: CheckCircle2, label: 'Reservation Accuracy', value: '99.9', suffix: '%' },
            ].map((stat, i) => (
              <div
                key={i}
                className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <stat.icon size={14} className="text-gray-600 group-hover:text-blue-600 transition-colors" strokeWidth={2} />
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500">{stat.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900 tabular-nums">{stat.value}</span>
                  {stat.suffix && <span className="text-lg text-gray-400">{stat.suffix}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live Warehouse Sync */}
        <section className="px-4 sm:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h3 className="text-sm font-semibold text-gray-900">Live Warehouse Sync</h3>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Polling 100ms</span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                      <th className="text-left px-5 py-3 font-medium">Timestamp</th>
                      <th className="text-left px-5 py-3 font-medium">Event Type</th>
                      <th className="text-left px-5 py-3 font-medium">Details</th>
                      <th className="text-left px-5 py-3 font-medium">Location</th>
                      <th className="text-left px-5 py-3 font-medium">Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event, i) => (
                      <tr
                        key={`${event.timestamp}-${i}`}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors animate-in fade-in slide-in-from-top-1 duration-500"
                      >
                        <td className="px-5 py-3 font-mono text-xs text-gray-600 tabular-nums">{event.timestamp}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold ${eventColors[event.type]}`}>
                            <span className="w-1 h-1 rounded-full bg-current"></span>
                            {event.type}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-700">{event.details}</td>
                        <td className="px-5 py-3 text-xs text-gray-600">{event.location}</td>
                        <td className="px-5 py-3 font-mono text-xs text-emerald-600 tabular-nums">{event.latency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Reservation State Machine */}
        <section className="px-4 sm:px-8 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Reservation State Machine</h2>
              <p className="text-sm text-gray-600 max-w-2xl">
                A deterministic lifecycle preventing race conditions. Once an item is HELD, it is guaranteed available until TTL expiry or explicit commit.
              </p>
            </div>

            {/* State Diagram */}
            <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-2 justify-center">
              {/* STATE 0 */}
              <div className="flex-1 max-w-xs mx-auto lg:mx-0 group">
                <div className="bg-white border-2 border-gray-200 rounded-xl p-5 text-center transition-all duration-300 hover:border-gray-400 hover:shadow-md">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-2">STATE_0</div>
                  <div className="text-lg font-bold text-gray-900 mb-1">AVAILABLE</div>
                  <div className="text-xs text-gray-500">In inventory pool</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center justify-center px-1">
                <div className="relative">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-gray-400 whitespace-nowrap">API: /lock</div>
                  <ArrowRight size={20} className="text-gray-400 animate-pulse" />
                </div>
              </div>

              {/* STATE 1 - HELD (highlighted) */}
              <div className="flex-1 max-w-xs mx-auto lg:mx-0 group relative">
                <div className="bg-white border-2 border-blue-500 rounded-xl p-5 text-center transition-all duration-300 hover:shadow-lg relative">
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-blue-500 mb-2">STATE_1</div>
                  <div className="text-lg font-bold text-gray-900 mb-1">HELD</div>
                  <div className="text-xs text-gray-500">TTL counting down</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center justify-center px-1">
                <ArrowRight size={20} className="text-gray-400" />
              </div>

              {/* STATE 2 / STATE 3 - stacked */}
              <div className="flex-1 max-w-xs mx-auto lg:mx-0 space-y-2">
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 text-center transition-all duration-300 hover:border-emerald-400 hover:shadow-md">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-600">STATE_2</div>
                    <span className="text-[9px] font-mono text-emerald-500">webhook: success</span>
                  </div>
                  <div className="text-sm font-bold text-emerald-700">COMMITTED</div>
                </div>

                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-center transition-all duration-300 hover:border-amber-400 hover:shadow-md">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-amber-600">STATE_3</div>
                    <span className="text-[9px] font-mono text-amber-500">TTL expires</span>
                  </div>
                  <div className="text-sm font-bold text-amber-700">RELEASED</div>
                  <div className="text-[10px] text-amber-600 mt-1">Returned to pool</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture Built for Scale */}
        <section className="px-4 sm:px-8 py-16 bg-gray-100 border-t border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Architecture Built for Scale</h2>
              <p className="text-sm text-gray-600">Enterprise-grade reliability for mission-critical inventory operations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: Code2,
                  title: 'Transactional Integrity',
                  desc: 'Strict ACID compliance ensures zero-oversell guarantees. Database transactions are serializable, preventing dirty reads during high-concurrency checkout events.',
                },
                {
                  icon: Network,
                  title: 'Edge Synchronization',
                  desc: 'Real-time inventory state is replicated across global edge nodes. Localized reads achieve sub-10ms latency, while writes hit strongly consistent central clusters.',
                },
                {
                  icon: Shuffle,
                  title: 'Concurrency Controls',
                  desc: 'Distributed locking mechanism handles sudden traffic spikes seamlessly. Flash sales and high-velocity product drops process without lock contention errors.',
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors duration-300">
                    <card.icon size={16} className="text-gray-700 group-hover:text-blue-600 transition-colors duration-300" strokeWidth={2} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">{card.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-4 sm:px-8 py-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <span className="font-semibold text-sm text-gray-900">AlloStock</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-[10px] font-mono text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                99.99% Uptime
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-[10px] font-mono text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                SOC2 Type II
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-[10px] font-mono text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                ISO 27001
              </span>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-500">
            <span>© 2026 AlloStock Systems. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="#" className="hover:text-gray-900 transition-colors">Status Page</Link>
              <Link href="/how-it-works" className="hover:text-gray-900 transition-colors">API Reference</Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
