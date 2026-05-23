import { cookies } from 'next/headers'
import { ok } from '@/lib/api-response'
import { deleteSession, COOKIE_NAME } from '@/lib/session'

export async function POST() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(COOKIE_NAME)?.value

  if (sessionId) {
    await deleteSession(sessionId)
  }

  cookieStore.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
  return ok({ message: 'Logged out' })
}
