import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { ok, handleError } from '@/lib/api-response'
import { getSession, COOKIE_NAME } from '@/lib/session'
import { redis } from '@/lib/redis'

const PREFS_TTL = 60 * 60 * 24 * 30 // 30 days

const PrefsSchema = z.object({
  category: z.string().optional(),
  warehouseId: z.string().optional(),
  inStockOnly: z.boolean().optional(),
})

async function getUser() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(COOKIE_NAME)?.value
  if (!sessionId) return null
  return getSession(sessionId)
}

export async function GET() {
  try {
    const user = await getUser()
    if (!user) return ok(null)

    const raw = await redis.get<string>(`user:${user.id}:prefs`)
    if (!raw) return ok(null)
    const prefs = typeof raw === 'object' ? raw : JSON.parse(raw)
    return ok(prefs)
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return ok(null)

    const body = await request.json()
    const prefs = PrefsSchema.parse(body)

    await redis.setex(`user:${user.id}:prefs`, PREFS_TTL, JSON.stringify(prefs))
    return ok(prefs)
  } catch (error) {
    return handleError(error)
  }
}
