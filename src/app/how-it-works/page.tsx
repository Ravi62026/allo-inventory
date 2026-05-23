'use client'

import Navbar from '@/components/navbar'
import { Lock, Zap, Warehouse, ArrowRight, CheckCircle2, Clock, Database } from 'lucide-react'
import Link from 'next/link'

export default function HowItWorks() {
  return (
    <>
      <Navbar />

      <main className="bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 px-6 sm:px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
          <div className="w-full max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-block mb-6 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              Smart Inventory Management
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              How AlloStock Works
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              An intelligent reservation system that prevents overselling and creates seamless shopping experiences with real-time stock locking.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 sm:px-8">
          <div className="w-full max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">Why Choose AlloStock?</h2>
            <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
              Built on proven database patterns and real-time technology
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Lock className="text-blue-600" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Race-Condition Free</h3>
                <p className="text-gray-600 leading-relaxed">
                  Pessimistic locking with PostgreSQL&apos;s SELECT FOR UPDATE ensures exactly one customer gets the last unit. Zero overselling.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="text-blue-600" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Reservations</h3>
                <p className="text-gray-600 leading-relaxed">
                  10-minute hold window with live countdown. Auto-expire on timeout, release on payment failure. Always accurate.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Warehouse className="text-blue-600" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Warehouse Support</h3>
                <p className="text-gray-600 leading-relaxed">
                  Manage stock across multiple locations. Real-time availability at each warehouse, optimized fulfillment routes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 px-6 sm:px-8 bg-gradient-to-b from-white to-blue-50">
          <div className="w-full max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">The 3-Step Process</h2>
            <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
              From browsing to checkout, experience frictionless purchasing
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 border-2 border-blue-200 h-full">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                      1
                    </div>
                    <div className="hidden sm:block absolute top-1/2 -right-4 w-8 h-8 bg-white border-2 border-blue-200 rounded-full transform -translate-y-1/2" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Browse & Select</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Customers explore your catalog and add items to their cart.
                  </p>
                  <div className="bg-slate-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 mb-2">API ENDPOINT</p>
                    <p className="text-sm font-mono text-blue-600">
                      GET /api/products
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 border-2 border-blue-200 h-full">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                      2
                    </div>
                    <div className="hidden sm:block absolute top-1/2 -right-4 w-8 h-8 bg-white border-2 border-blue-200 rounded-full transform -translate-y-1/2" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Reserve Stock</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    System locks stock for 10 minutes with a live countdown timer visible to the customer.
                  </p>
                  <div className="bg-slate-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 mb-2">API ENDPOINT</p>
                    <p className="text-sm font-mono text-green-600">
                      POST /api/reservations
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 border-2 border-blue-200 h-full">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                      3
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Confirm Purchase</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Customer confirms before timer expires. Stock is permanently locked and order is complete.
                  </p>
                  <div className="bg-slate-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 mb-2">API ENDPOINT</p>
                    <p className="text-sm font-mono text-green-600">
                      POST /api/reservations/confirm
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Deep Dive */}
        <section className="py-20 px-6 sm:px-8 bg-gray-50">
          <div className="w-full max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">Technical Architecture</h2>
            <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
              Enterprise-grade reliability through proven database patterns
            </p>

            <div className="space-y-6">
              {/* Tech 1 */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Lock className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Pessimistic Locking</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      PostgreSQL&apos;s SELECT FOR UPDATE holds row-level locks during transactions. Only one request can acquire the lock, preventing race conditions on the last unit. This is the battle-tested solution used by major inventory systems.
                    </p>
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <code>SELECT ... FROM stock WHERE id = ? <span className="text-blue-400">FOR UPDATE</span>;</code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tech 2 */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Auto-Expiry with Vercel Cron</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Vercel Cron executes every minute to find and expire stale reservations. Lazy cleanup also runs during confirmReservation() to catch expired reservations. This dual approach ensures no ghost holds.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-blue-600 mb-1">ENDPOINT</p>
                        <p className="text-sm font-mono text-gray-700">POST /api/cron/expire</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-blue-600 mb-1">SCHEDULE</p>
                        <p className="text-sm font-mono text-gray-700">Every 1 minute</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-blue-600 mb-1">TTL</p>
                        <p className="text-sm font-mono text-gray-700">10 minutes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tech 3 */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Database className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Idempotency with Redis</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Redis-backed response caching prevents duplicate charges on retries. Send Idempotency-Key header with POST requests. Server caches responses for 24 hours, returning the same result if the same key is sent again.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-blue-600 mb-1">HEADER</p>
                        <p className="text-sm font-mono text-gray-700 break-all">Idempotency-Key: uuid-v4</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-blue-600 mb-1">COVERAGE</p>
                        <p className="text-sm font-mono text-gray-700">POST /api/reservations*</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-6 sm:px-8 bg-white">
          <div className="w-full max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-16 text-center">Why Your Business Wins</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: CheckCircle2, title: 'Zero Overselling', desc: 'Prevent double-selling of limited inventory' },
                { icon: Zap, title: 'Instant Updates', desc: 'Real-time stock accuracy across all channels' },
                { icon: Lock, title: 'Secure Transactions', desc: 'Database-level consistency guarantees' },
                { icon: Clock, title: 'Fast Checkout', desc: '10-minute hold window reduces abandonment' },
                { icon: Warehouse, title: 'Multi-Location', desc: 'Manage unlimited warehouses seamlessly' },
                { icon: Database, title: 'Production Ready', desc: 'Proven patterns, zero data loss' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <item.icon className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 sm:px-8 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="w-full max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Ready to Experience AlloStock?</h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              See intelligent inventory management in action. Browse products, create reservations, and checkout with confidence.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors font-semibold text-lg shadow-xl hover:shadow-2xl"
            >
              Explore Products <ArrowRight size={20} />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-400 py-12 px-6 sm:px-8">
          <div className="w-full max-w-6xl mx-auto">
            <div className="grid sm:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-bold text-white mb-4">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/products" className="hover:text-white transition">Products</Link></li>
                  <li><Link href="/how-it-works" className="hover:text-white transition">How It Works</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">Features</h4>
                <ul className="space-y-2 text-sm">
                  <li><span className="hover:text-white transition cursor-pointer">Real-time Inventory</span></li>
                  <li><span className="hover:text-white transition cursor-pointer">Smart Reservations</span></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li><span className="hover:text-white transition cursor-pointer">About</span></li>
                  <li><span className="hover:text-white transition cursor-pointer">Blog</span></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li><span className="hover:text-white transition cursor-pointer">Privacy</span></li>
                  <li><span className="hover:text-white transition cursor-pointer">Terms</span></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-sm">
              <p>© 2026 AlloStock. Smart inventory, zero overselling.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
