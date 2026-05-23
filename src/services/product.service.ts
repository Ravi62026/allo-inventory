import { findAllProducts } from '@/repositories/product.repository'
import type { ProductQuery } from '@/schemas/product.schema'
import type { ProductListing } from '@/types'
import { Decimal } from '@prisma/client/runtime/library'
import { withCache } from '@/lib/cache'

const PRODUCTS_CACHE_TTL = 30

function buildCacheKey(query: ProductQuery): string {
  const parts = [
    'products',
    query.warehouseId ?? 'all',
    query.category ?? 'all',
    query.inStockOnly ? 'instock' : 'any',
  ]
  return parts.join(':')
}

export async function listProducts(query: ProductQuery): Promise<ProductListing[]> {
  return withCache(
    buildCacheKey(query),
    async () => {
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
    },
    PRODUCTS_CACHE_TTL
  )
}
