import { prisma } from '@/lib/prisma'

export async function findReservationById(id: string) {
  return prisma.reservation.findUnique({
    where: { id },
    include: {
      stock: { include: { product: true, warehouse: true } },
    },
  })
}

export async function findExpiredPendingReservations() {
  return prisma.reservation.findMany({
    where: {
      status: 'PENDING',
      expiresAt: { lt: new Date() },
    },
  })
}
