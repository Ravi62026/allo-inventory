import { prisma } from '@/lib/prisma'
import type { ProductQuery } from '@/schemas/product.schema'

export async function findAllProducts(query: ProductQuery) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(query.category ? { category: query.category } : {}),
    },
    include: {
      stocks: {
        where: {
          warehouse: { isActive: true },
          ...(query.warehouseId ? { warehouseId: query.warehouseId } : {}),
        },
        include: { warehouse: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}
