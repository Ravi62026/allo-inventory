import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProduct() {
  try {
    const product = await prisma.product.findFirst({
      where: { name: { contains: 'Probiotic' } },
    })

    if (!product) {
      console.log('Product not found')
      return
    }

    console.log('Product:', product)

    // Find reservations for this product
    const reservations = await prisma.reservation.findMany({
      where: { stock: { productId: product.id } },
      include: { stock: { include: { warehouse: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    console.log('Reservations:', JSON.stringify(reservations, null, 2))

    // Check current time vs expires
    const now = new Date()
    reservations.forEach(r => {
      const expiresIn = Math.round((new Date(r.expiresAt).getTime() - now.getTime()) / 1000 / 60)
      console.log(`Reservation ${r.id}: status=${r.status}, expiresIn=${expiresIn}m`)
    })
  } finally {
    await prisma.$disconnect()
  }
}

checkProduct().catch(console.error)
