import { cookies } from 'next/headers'
import { ok, handleError } from '@/lib/api-response'
import { getSession, COOKIE_NAME } from '@/lib/session'
import { getUserReservations } from '@/repositories/user.repository'
import { redis } from '@/lib/redis'
import { UnauthorizedError } from '@/lib/errors'

const CACHE_TTL = 60

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(COOKIE_NAME)?.value
    if (!sessionId) throw new UnauthorizedError()

    const user = await getSession(sessionId)
    if (!user) throw new UnauthorizedError()

    // Try cache first
    const cacheKey = `user:${user.id}:dashboard`
    const cached = await redis.get<string>(cacheKey)
    if (cached) {
      const data = typeof cached === 'object' ? cached : JSON.parse(cached as string)
      return ok(data)
    }

    const reservations = await getUserReservations(user.id)

    const totalReservations = reservations.length
    const pendingCount = reservations.filter(r => r.status === 'PENDING').length
    const confirmedCount = reservations.filter(r => r.status === 'CONFIRMED').length
    const totalUnits = reservations
      .filter(r => r.status !== 'RELEASED')
      .reduce((sum, r) => sum + r.units, 0)
    const totalSpend = reservations
      .filter(r => r.status === 'CONFIRMED')
      .reduce((sum, r) => sum + parseFloat(r.stock.product.price.toString()) * r.units, 0)

    // Category breakdown
    const categoryCounts: Record<string, number> = {}
    for (const r of reservations) {
      const cat = r.stock.product.category
      categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1
    }
    const favoriteCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

    const recentReservations = reservations.slice(0, 5).map(r => ({
      id: r.id,
      productName: r.stock.product.name,
      category: r.stock.product.category,
      warehouseName: r.stock.warehouse.name,
      units: r.units,
      price: r.stock.product.price,
      status: r.status,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt,
    }))

    const data = {
      user: { id: user.id, name: user.name, email: user.email },
      stats: { totalReservations, pendingCount, confirmedCount, totalUnits, totalSpend, favoriteCategory },
      recentReservations,
    }

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data))
    return ok(data)
  } catch (error) {
    return handleError(error)
  }
}
