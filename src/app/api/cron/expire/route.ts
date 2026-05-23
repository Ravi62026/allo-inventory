import { NextRequest } from 'next/server'
import { ok, handleError } from '@/lib/api-response'
import { expireStaleReservations } from '@/services/reservation.service'

// Called by Vercel Cron every minute — see vercel.json
// Protected by CRON_SECRET to prevent public abuse
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await expireStaleReservations()
    return ok(result)
  } catch (error) {
    return handleError(error)
  }
}
