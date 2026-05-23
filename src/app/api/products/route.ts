import { NextRequest } from 'next/server'
import { ok, handleError } from '@/lib/api-response'
import { listProducts } from '@/services/product.service'
import { ProductQuerySchema } from '@/schemas/product.schema'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const query = ProductQuerySchema.parse({
      warehouseId: searchParams.get('warehouseId') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      inStockOnly: searchParams.get('inStockOnly') ?? undefined,
    })
    const products = await listProducts(query)
    return ok(products)
  } catch (error) {
    return handleError(error)
  }
}
