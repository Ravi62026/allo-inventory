import type { Product, Warehouse, Stock, Reservation, ReservationStatus } from '@prisma/client'

// ─── Domain types with relations ───────────────────────────────────────────

export type StockWithRelations = Stock & {
  product: Product
  warehouse: Warehouse
}

export type ReservationWithStock = Reservation & {
  stock: StockWithRelations
}

export type ProductWithStocks = Product & {
  stocks: StockWithRelations[]
}

export type WarehouseWithStocks = Warehouse & {
  stocks: (Stock & { product: Product })[]
}

// ─── Computed / view types ──────────────────────────────────────────────────

export type StockAvailability = {
  stockId: string
  warehouseId: string
  warehouseName: string
  warehouseLocation: string
  totalUnits: number
  reservedUnits: number
  availableUnits: number
}

export type ProductListing = {
  id: string
  name: string
  description: string | null
  price: string
  category: string
  imageUrl: string | null
  availability: StockAvailability[]
}

// Re-export Prisma enum for use across the app
export type { ReservationStatus }
