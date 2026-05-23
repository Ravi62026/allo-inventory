import { cookies } from 'next/headers'
import { ok, handleError } from '@/lib/api-response'
import { getSession, refreshSession, COOKIE_NAME } from '@/lib/session'
import { UnauthorizedError } from '@/lib/errors'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(COOKIE_NAME)?.value
    if (!sessionId) throw new UnauthorizedError()

    const user = await getSession(sessionId)
    if (!user) throw new UnauthorizedError()

    // Refresh TTL on activity
    await refreshSession(sessionId)

    return ok(user)
  } catch (error) {
    return handleError(error)
  }
}
