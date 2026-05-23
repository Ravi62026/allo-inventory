import { findAllWarehouses } from '@/repositories/warehouse.repository'
import type { WarehouseWithStocks } from '@/types'
import { withCache } from '@/lib/cache'

const WAREHOUSES_CACHE_TTL = 300

export async function listWarehouses(): Promise<WarehouseWithStocks[]> {
  return withCache('warehouses:all', () => findAllWarehouses(), WAREHOUSES_CACHE_TTL)
}
