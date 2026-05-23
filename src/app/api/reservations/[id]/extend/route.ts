import { NextRequest } from 'next/server'
import { ok, handleError } from '@/lib/api-response'
import { extendReservation } from '@/services/reservation.service'
import { IdParamSchema } from '@/schemas/common.schema'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = IdParamSchema.parse(await params)
    const reservation = await extendReservation(id)
    return ok(reservation)
  } catch (error) {
    return handleError(error)
  }
}
