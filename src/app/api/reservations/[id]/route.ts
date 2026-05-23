import { NextRequest } from 'next/server'
import { ok, handleError } from '@/lib/api-response'
import { getReservation } from '@/services/reservation.service'
import { IdParamSchema } from '@/schemas/common.schema'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = IdParamSchema.parse(await params)
    const reservation = await getReservation(id)
    return ok(reservation)
  } catch (error) {
    return handleError(error)
  }
}
