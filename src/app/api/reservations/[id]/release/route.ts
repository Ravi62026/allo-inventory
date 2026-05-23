import { NextRequest } from 'next/server'
import { ok, handleError } from '@/lib/api-response'
import { releaseReservation } from '@/services/reservation.service'

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const reservation = await releaseReservation(params.id)
    return ok(reservation)
  } catch (error) {
    return handleError(error)
  }
}
