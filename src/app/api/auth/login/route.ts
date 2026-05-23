import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { ok, handleError } from '@/lib/api-response'
import { findUserByEmail } from '@/repositories/user.repository'
import { verifyPassword } from '@/lib/hash'
import { createSession, COOKIE_NAME } from '@/lib/session'
import { InvalidCredentialsError } from '@/lib/errors'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const SESSION_MAX_AGE = 60 * 60 * 24 * 7

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = LoginSchema.parse(body)

    const user = await findUserByEmail(email)
    if (!user) throw new InvalidCredentialsError()

    const valid = await verifyPassword(password, user.password)
    if (!valid) throw new InvalidCredentialsError()

    const sessionId = await createSession({ id: user.id, name: user.name, email: user.email })

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_MAX_AGE,
      path: '/',
      sameSite: 'lax',
    })

    return ok({ id: user.id, name: user.name, email: user.email })
  } catch (error) {
    return handleError(error)
  }
}
