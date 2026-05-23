import { z } from 'zod'

export const CreateReservationSchema = z.object({
  stockId: z.string().cuid({ message: 'Invalid stock ID' }),
  units: z
    .number()
    .int()
    .positive({ message: 'Units must be a positive integer' })
    .max(100, { message: 'Cannot reserve more than 100 units at once' }),
})

export const ReservationResponseSchema = z.object({
  id: z.string(),
  stockId: z.string(),
  units: z.number(),
  status: z.enum(['PENDING', 'CONFIRMED', 'RELEASED']),
  expiresAt: z.string().datetime(),
  confirmedAt: z.string().datetime().nullable(),
  releasedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
})

export type CreateReservationInput = z.infer<typeof CreateReservationSchema>
export type ReservationResponse = z.infer<typeof ReservationResponseSchema>
