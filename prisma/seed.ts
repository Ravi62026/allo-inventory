import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Warehouses
  const mumbai = await prisma.warehouse.upsert({
    where: { id: 'wh-mumbai' },
    update: {},
    create: { id: 'wh-mumbai', name: 'Mumbai Fulfilment Centre', location: 'Andheri East, Mumbai 400069' },
  })

  const delhi = await prisma.warehouse.upsert({
    where: { id: 'wh-delhi' },
    update: {},
    create: { id: 'wh-delhi', name: 'Delhi Distribution Hub', location: 'Okhla Phase II, New Delhi 110020' },
  })

  const bangalore = await prisma.warehouse.upsert({
    where: { id: 'wh-blr' },
    update: {},
    create: { id: 'wh-blr', name: 'Bengaluru Dispatch Centre', location: 'Whitefield, Bengaluru 560066' },
  })

  // Products
  const products = [
    { id: 'prod-1', name: 'Testosterone Support Kit', category: 'Wellness', price: 2499, description: 'Complete hormonal health support pack' },
    { id: 'prod-2', name: 'Sleep & Recovery Bundle', category: 'Wellness', price: 1799, description: 'Melatonin + Ashwagandha sleep formula' },
    { id: 'prod-3', name: 'Performance Whey Protein', category: 'Nutrition', price: 3299, description: '2kg premium whey isolate blend' },
    { id: 'prod-4', name: 'Vitamin D3 + K2 Drops', category: 'Supplements', price: 899, description: 'High-absorption liquid formula' },
    { id: 'prod-5', name: 'Gut Health Probiotic', category: 'Supplements', price: 1299, description: '50 billion CFU multi-strain blend' },
    { id: 'prod-6', name: 'Daily Multivitamin Pack', category: 'Supplements', price: 649, description: '30-day comprehensive nutrition support' },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p, price: p.price },
    })
  }

  // Stock per product per warehouse
  const stockConfig = [
    { productId: 'prod-1', warehouseId: mumbai.id, total: 8 },
    { productId: 'prod-1', warehouseId: delhi.id, total: 2 },
    { productId: 'prod-2', warehouseId: mumbai.id, total: 15 },
    { productId: 'prod-2', warehouseId: bangalore.id, total: 4 },
    { productId: 'prod-3', warehouseId: delhi.id, total: 20 },
    { productId: 'prod-3', warehouseId: bangalore.id, total: 0 },
    { productId: 'prod-4', warehouseId: mumbai.id, total: 50 },
    { productId: 'prod-4', warehouseId: delhi.id, total: 50 },
    { productId: 'prod-4', warehouseId: bangalore.id, total: 50 },
    { productId: 'prod-5', warehouseId: mumbai.id, total: 3 },
    { productId: 'prod-5', warehouseId: delhi.id, total: 0 },
    { productId: 'prod-6', warehouseId: bangalore.id, total: 0 },
    { productId: 'prod-6', warehouseId: delhi.id, total: 0 },
  ]

  for (const s of stockConfig) {
    await prisma.stock.upsert({
      where: { productId_warehouseId: { productId: s.productId, warehouseId: s.warehouseId } },
      update: {},
      create: { productId: s.productId, warehouseId: s.warehouseId, totalUnits: s.total, reservedUnits: 0 },
    })
  }

  console.log('Seed complete.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
