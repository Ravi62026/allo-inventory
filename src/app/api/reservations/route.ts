import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { ok, handleError } from '@/lib/api-response'
import { createReservation } from '@/services/reservation.service'
import { CreateReservationSchema } from '@/schemas/reservation.schema'
import { getIdempotentResponse, saveIdempotentResponse } from '@/repositories/idempotency.repository'
import { getSession, COOKIE_NAME } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const idempotencyKey = request.headers.get('Idempotency-Key')

    if (idempotencyKey) {
      const cached = await getIdempotentResponse(idempotencyKey, 'reservations')
      if (cached) return Response.json(cached.body, { status: cached.statusCode })
    }

    // Attach userId if logged in
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(COOKIE_NAME)?.value
    const sessionUser = sessionId ? await getSession(sessionId) : null

    const body = await request.json()
    const { stockId, units } = CreateReservationSchema.parse(body)
    const reservation = await createReservation(stockId, units, sessionUser?.id)
    const response = ok(reservation, 201)

    if (idempotencyKey) {
      await saveIdempotentResponse(idempotencyKey, 'reservations', 201, await response.clone().json())
    }

    return response
  } catch (error) {
    return handleError(error)
  }
}
