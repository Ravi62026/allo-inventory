import { prisma } from '@/lib/prisma'
import {
  InsufficientStockError,
  ReservationExpiredError,
  ReservationNotFoundError,
  InvalidStatusTransitionError,
} from '@/lib/errors'

const RESERVATION_TTL_MINUTES = 10

export async function createReservation(stockId: string, units: number) {
  // SELECT FOR UPDATE acquires a row-level lock on the stock row.
  // Concurrent requests block here until the first transaction commits,
  // ensuring exactly one reservation succeeds when stock is limited.
  return prisma.$transaction(async (tx) => {
    const [stock] = await tx.$queryRaw<
      Array<{ id: string; totalUnits: number; reservedUnits: number }>
    >`
      SELECT id, "totalUnits", "reservedUnits"
      FROM stocks
      WHERE id = ${stockId}
      FOR UPDATE
    `

    if (!stock) throw new ReservationNotFoundError()

    const available = stock.totalUnits - stock.reservedUnits
    if (available < units) throw new InsufficientStockError()

    await tx.stock.update({
      where: { id: stockId },
      data: { reservedUnits: { increment: units } },
    })

    const expiresAt = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60_000)

    return tx.reservation.create({
      data: { stockId, units, status: 'PENDING', expiresAt },
      include: { stock: { include: { product: true, warehouse: true } } },
    })
  })
}

export async function getReservation(id: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { stock: { include: { product: true, warehouse: true } } },
  })
  if (!reservation) throw new ReservationNotFoundError()
  return reservation
}

export async function confirmReservation(id: string) {
  return prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({ where: { id } })

    if (!reservation) throw new ReservationNotFoundError()
    if (reservation.status !== 'PENDING') {
      throw new InvalidStatusTransitionError(reservation.status, 'CONFIRMED')
    }

    if (reservation.expiresAt < new Date()) {
      // Lazy cleanup: release on the spot rather than waiting for cron
      await tx.stock.update({
        where: { id: reservation.stockId },
        data: { reservedUnits: { decrement: reservation.units } },
      })
      await tx.reservation.update({
        where: { id },
        data: { status: 'RELEASED', releasedAt: new Date() },
      })
      throw new ReservationExpiredError()
    }

    return tx.reservation.update({
      where: { id },
      data: { status: 'CONFIRMED', confirmedAt: new Date() },
      include: { stock: { include: { product: true, warehouse: true } } },
    })
  })
}

export async function releaseReservation(id: string) {
  return prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({ where: { id } })

    if (!reservation) throw new ReservationNotFoundError()
    if (reservation.status !== 'PENDING') {
      throw new InvalidStatusTransitionError(reservation.status, 'RELEASED')
    }

    await tx.stock.update({
      where: { id: reservation.stockId },
      data: { reservedUnits: { decrement: reservation.units } },
    })

    return tx.reservation.update({
      where: { id },
      data: { status: 'RELEASED', releasedAt: new Date() },
      include: { stock: { include: { product: true, warehouse: true } } },
    })
  })
}

export async function expireStaleReservations() {
  const expired = await prisma.reservation.findMany({
    where: { status: 'PENDING', expiresAt: { lt: new Date() } },
  })

  if (expired.length === 0) return { released: 0 }

  await prisma.$transaction([
    ...expired.map((r) =>
      prisma.stock.update({
        where: { id: r.stockId },
        data: { reservedUnits: { decrement: r.units } },
      })
    ),
    prisma.reservation.updateMany({
      where: { id: { in: expired.map((r) => r.id) } },
      data: { status: 'RELEASED', releasedAt: new Date() },
    }),
  ])

  return { released: expired.length }
}

// BONUS APIs

export async function validateReservation(stockId: string, units: number) {
  const stock = await prisma.stock.findUnique({
    where: { id: stockId },
    include: { product: true, warehouse: true },
  })

  if (!stock) throw new ReservationNotFoundError()

  const available = stock.totalUnits - stock.reservedUnits
  return {
    stockId,
    units,
    available,
    canReserve: available >= units,
    message: available >= units ? 'Stock available' : 'Insufficient stock',
  }
}

export async function listReservations(status?: string) {
  return prisma.reservation.findMany({
    where: status ? { status: status as any } : undefined,
    include: { stock: { include: { product: true, warehouse: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function extendReservation(id: string) {
  const reservation = await prisma.reservation.findUnique({ where: { id } })

  if (!reservation) throw new ReservationNotFoundError()
  if (reservation.status !== 'PENDING') {
    throw new InvalidStatusTransitionError(reservation.status, 'EXTENDED')
  }

  const newExpiresAt = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60_000)

  return prisma.reservation.update({
    where: { id },
    data: { expiresAt: newExpiresAt },
    include: { stock: { include: { product: true, warehouse: true } } },
  })
}
