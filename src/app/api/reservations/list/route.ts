import { NextRequest } from 'next/server'
import { ok, handleError } from '@/lib/api-response'
import { listReservations } from '@/services/reservation.service'

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status') ?? undefined
    const reservations = await listReservations(status)
    return ok(reservations)
  } catch (error) {
    return handleError(error)
  }
}
