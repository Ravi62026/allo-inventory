import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { ok, handleError } from '@/lib/api-response'
import { findUserByEmail, createUser } from '@/repositories/user.repository'
import { hashPassword } from '@/lib/hash'
import { createSession, COOKIE_NAME } from '@/lib/session'
import { DuplicateEmailError } from '@/lib/errors'

const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const SESSION_MAX_AGE = 60 * 60 * 24 * 7

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = SignupSchema.parse(body)

    const existing = await findUserByEmail(email)
    if (existing) throw new DuplicateEmailError()

    const hashed = await hashPassword(password)
    const user = await createUser({ name, email, password: hashed })

    const sessionId = await createSession({ id: user.id, name: user.name, email: user.email })

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_MAX_AGE,
      path: '/',
      sameSite: 'lax',
    })

    return ok({ id: user.id, name: user.name, email: user.email }, 201)
  } catch (error) {
    return handleError(error)
  }
}
