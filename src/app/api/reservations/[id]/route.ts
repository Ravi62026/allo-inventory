import { NextRequest } from 'next/server'
import { ok, handleError } from '@/lib/api-response'
import { getReservation } from '@/services/reservation.service'

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const reservation = await getReservation(params.id)
    return ok(reservation)
  } catch (error) {
    return handleError(error)
  }
}
