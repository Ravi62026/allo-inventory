import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">AlloStock</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition font-medium">
              Home
            </Link>
            <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900 transition font-medium">
              How It Works
            </Link>
            <Link href="/warehouses" className="text-gray-600 hover:text-gray-900 transition font-medium">
              Warehouses
            </Link>
            <Link href="/products" className="text-gray-600 hover:text-gray-900 transition font-medium">
              Products
            </Link>
          </div>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
