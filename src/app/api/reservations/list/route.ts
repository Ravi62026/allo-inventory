import { NextRequest } from 'next/server'
import { ok, handleError } from '@/lib/api-response'
import { listReservations } from '@/services/reservation.service'
import { ReservationStatusSchema } from '@/schemas/reservation.schema'

export async function GET(request: NextRequest) {
  try {
    const statusParam = request.nextUrl.searchParams.get('status')
    const status = statusParam ? ReservationStatusSchema.parse(statusParam) : undefined
    const reservations = await listReservations(status)
    return ok(reservations)
  } catch (error) {
    return handleError(error)
  }
}
