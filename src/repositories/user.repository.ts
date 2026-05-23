import { prisma } from '@/lib/prisma'

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, createdAt: true },
  })
}

export async function createUser(data: { name: string; email: string; password: string }) {
  return prisma.user.create({ data })
}

export async function getUserReservations(userId: string) {
  return prisma.reservation.findMany({
    where: { userId },
    include: { stock: { include: { product: true, warehouse: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
}
