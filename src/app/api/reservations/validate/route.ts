import { NextRequest } from 'next/server'
import { ok, handleError } from '@/lib/api-response'
import { validateReservation } from '@/services/reservation.service'
import { CreateReservationSchema } from '@/schemas/reservation.schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { stockId, units } = CreateReservationSchema.parse(body)
    const validation = await validateReservation(stockId, units)
    return ok(validation)
  } catch (error) {
    return handleError(error)
  }
}
