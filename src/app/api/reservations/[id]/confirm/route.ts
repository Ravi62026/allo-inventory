import { NextRequest } from 'next/server'
import { ok, handleError } from '@/lib/api-response'
import { confirmReservation } from '@/services/reservation.service'
import { getIdempotentResponse, saveIdempotentResponse } from '@/repositories/idempotency.repository'

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const idempotencyKey = request.headers.get('Idempotency-Key')

    if (idempotencyKey) {
      const cached = await getIdempotentResponse(idempotencyKey, 'reservations')
      if (cached) return Response.json(cached.body, { status: cached.statusCode })
    }

    const reservation = await confirmReservation(params.id)
    const response = ok(reservation)

    if (idempotencyKey) {
      await saveIdempotentResponse(idempotencyKey, 'reservations', 200, await response.clone().json())
    }

    return response
  } catch (error) {
    return handleError(error)
  }
}
