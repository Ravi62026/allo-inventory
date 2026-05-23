import { findAllWarehouses } from '@/repositories/warehouse.repository'
import type { WarehouseWithStocks } from '@/types'

export async function listWarehouses(): Promise<WarehouseWithStocks[]> {
  return findAllWarehouses()
}
