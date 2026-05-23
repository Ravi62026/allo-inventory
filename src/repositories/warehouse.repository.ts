import { prisma } from '@/lib/prisma'

export async function findAllWarehouses() {
  return prisma.warehouse.findMany({
    where: { isActive: true },
    include: {
      stocks: {
        include: { product: true },
      },
    },
    orderBy: { name: 'asc' },
  })
}
