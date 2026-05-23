import { redis } from '@/lib/redis'

const SESSION_TTL = 60 * 60 * 24 * 7 // 7 days
const COOKIE_NAME = 'allostock_session'

export interface SessionUser {
  id: string
  name: string
  email: string
}

export { COOKIE_NAME }

export async function createSession(user: SessionUser): Promise<string> {
  const sessionId = crypto.randomUUID()
  await redis.setex(`session:${sessionId}`, SESSION_TTL, JSON.stringify(user))
  return sessionId
}

export async function getSession(sessionId: string): Promise<SessionUser | null> {
  try {
    const raw = await redis.get<string>(`session:${sessionId}`)
    if (!raw) return null
    if (typeof raw === 'object') return raw as SessionUser
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  await redis.del(`session:${sessionId}`)
}

export async function refreshSession(sessionId: string): Promise<void> {
  await redis.expire(`session:${sessionId}`, SESSION_TTL)
}
