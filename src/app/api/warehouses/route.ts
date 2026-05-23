import { ok, handleError } from '@/lib/api-response'
import { listWarehouses } from '@/services/warehouse.service'

export async function GET() {
  try {
    const warehouses = await listWarehouses()
    return ok(warehouses)
  } catch (error) {
    return handleError(error)
  }
}
