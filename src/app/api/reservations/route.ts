import { NextRequest } from 'next/server'
import { ok, handleError } from '@/lib/api-response'
import { createReservation } from '@/services/reservation.service'
import { CreateReservationSchema } from '@/schemas/reservation.schema'
import { getIdempotentResponse, saveIdempotentResponse } from '@/repositories/idempotency.repository'

export async function POST(request: NextRequest) {
  try {
    const idempotencyKey = request.headers.get('Idempotency-Key')

    if (idempotencyKey) {
      const cached = await getIdempotentResponse(idempotencyKey, 'reservations')
      if (cached) return Response.json(cached.body, { status: cached.statusCode })
    }

    const body = await request.json()
    const { stockId, units } = CreateReservationSchema.parse(body)
    const reservation = await createReservation(stockId, units)
    const response = ok(reservation, 201)

    if (idempotencyKey) {
      await saveIdempotentResponse(idempotencyKey, 'reservations', 201, await response.clone().json())
    }

    return response
  } catch (error) {
    return handleError(error)
  }
}
