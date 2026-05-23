import { NextRequest } from 'next/server'
import { ok, handleError } from '@/lib/api-response'
import { confirmReservation } from '@/services/reservation.service'
import { getIdempotentResponse, saveIdempotentResponse } from '@/repositories/idempotency.repository'
import { IdParamSchema } from '@/schemas/common.schema'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = IdParamSchema.parse(await params)
    const idempotencyKey = request.headers.get('Idempotency-Key')

    if (idempotencyKey) {
      const cached = await getIdempotentResponse(idempotencyKey, `reservations:${id}:confirm`)
      if (cached) return Response.json(cached.body, { status: cached.statusCode })
    }

    const reservation = await confirmReservation(id)
    const response = ok(reservation)

    if (idempotencyKey) {
      await saveIdempotentResponse(idempotencyKey, `reservations:${id}:confirm`, 200, await response.clone().json())
    }

    return response
  } catch (error) {
    return handleError(error)
  }
}
