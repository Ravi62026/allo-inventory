import { prisma } from '@/lib/prisma'

export async function findStockById(id: string) {
  return prisma.stock.findUnique({
    where: { id },
    include: { product: true, warehouse: true },
  })
}

export async function findStockByProductAndWarehouse(productId: string, warehouseId: string) {
  return prisma.stock.findUnique({
    where: { productId_warehouseId: { productId, warehouseId } },
    include: { product: true, warehouse: true },
  })
}
