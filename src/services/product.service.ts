import { findAllProducts } from '@/repositories/product.repository'
import type { ProductQuery } from '@/schemas/product.schema'
import type { ProductListing } from '@/types'
import { Decimal } from '@prisma/client/runtime/library'

export async function listProducts(query: ProductQuery): Promise<ProductListing[]> {
  const products = await findAllProducts(query)

  return products
    .map((product) => {
      const availability = product.stocks.map((stock) => ({
        stockId: stock.id,
        warehouseId: stock.warehouseId,
        warehouseName: stock.warehouse.name,
        warehouseLocation: stock.warehouse.location,
        totalUnits: stock.totalUnits,
        reservedUnits: stock.reservedUnits,
        availableUnits: stock.totalUnits - stock.reservedUnits,
      }))

      if (query.inStockOnly && availability.every((a) => a.availableUnits <= 0)) {
        return null
      }

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: (product.price as unknown as Decimal).toFixed(2),
        category: product.category,
        imageUrl: product.imageUrl,
        availability,
      }
    })
    .filter(Boolean) as ProductListing[]
}
