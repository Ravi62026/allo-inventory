# AlloStock - Inventory & Reservation Management System

A modern Next.js application for managing multi-warehouse inventory with intelligent time-limited reservations. Prevents overselling through pessimistic locking and provides a seamless checkout experience with real-time countdown timers.

## 🎯 Problem Statement

When customers proceed to checkout, payment can take several minutes (3DS flows, UPI, wallet redirects). During this window:
- If we decrement stock only at payment time: two customers can pay for the same unit (overselling, refunds, bad UX)
- If we decrement at add-to-cart time: inventory looks depleted even though 80% of carts are abandoned (lower conversion)

**Solution**: Hold units temporarily (10 minutes) when customer enters checkout. Confirm reservation on payment success, release on failure or timeout.

---

## ✨ Key Features

### Core Functionality
- ✅ **Race-Condition Free**: `SELECT FOR UPDATE` ensures exactly one request succeeds on last unit
- ✅ **Time-Limited Reservations**: 10-minute expiry window for checkout
- ✅ **Multi-Warehouse Support**: Track inventory across Mumbai, Delhi, Bangalore
- ✅ **Real-Time Stock Updates**: Available units shown per warehouse
- ✅ **Automatic Expiry**: Vercel Cron job runs every minute to release expired reservations
- ✅ **Live Countdown Timer**: Frontend countdown shows time left to confirm
- ✅ **Error Handling**: User-visible messages for 409 (insufficient stock) and 410 (expired)

### Advanced Features
- ✅ **Idempotency**: Redis-backed `Idempotency-Key` support prevents duplicate charges on retries
- ✅ **Transaction Safety**: All multi-step operations atomic in Prisma transactions
- ✅ **Type Safety**: Full TypeScript end-to-end with Zod validation
- ✅ **Docker**: Multi-stage builds, Alpine base, health checks
- ✅ **API Validation**: Request/response validation with proper HTTP status codes

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone repo
cd allo-inventory

# Build and start everything
make docker-build && make docker-up && make docker-seed

# Visit http://localhost:3000
```

**Available commands:**
```bash
make docker-build      # Build images
make docker-up         # Start services
make docker-down       # Stop services
make docker-logs       # View logs
make docker-seed       # Seed database
make docker-reset      # Full reset
```

### Option 2: Local Development

#### 1. Create `.env.local`
```env
DATABASE_URL="postgresql://allo:allo_dev_password@localhost:5432/allo_inventory"
DIRECT_URL="postgresql://allo:allo_dev_password@localhost:5432/allo_inventory"
UPSTASH_REDIS_REST_URL="http://localhost:6379"
UPSTASH_REDIS_REST_TOKEN="dev_token"
CRON_SECRET="dev_cron_secret_minimum_32_characters_long!!"
NODE_ENV="development"
```

#### 2. Install & Setup
```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

#### 3. Run
```bash
npm run dev
# Open http://localhost:3000
```

---

## 🔒 How It Works: Race-Condition Free Reservations

### The Problem
```
Two customers want the last unit:
❌ Without locking: Both requests see 1 available → Both get 201 → OVERSELL
```

### The Solution: Pessimistic Locking
```typescript
prisma.$transaction(async (tx) => {
  // SELECT FOR UPDATE: acquires row-level lock
  const [stock] = await tx.$queryRaw`
    SELECT id, "totalUnits", "reservedUnits"
    FROM stocks
    WHERE id = ${stockId}
    FOR UPDATE
  `
  
  if (available < units) throw new InsufficientStockError() // 409
  
  // Safely decrement reserved units
  await tx.stock.update({...})
  return tx.reservation.create({...})
})
```

### Result: Exactly One Succeeds
```
Request A: Acquires lock → Checks → Decrements → 201 ✅
Request B: Waits for lock → Checks → InsufficientStock → 409 ✅
```

---

## 📊 API Endpoints

### Products
```
GET /api/products?category=Wellness&warehouseId=wh-mumbai&inStockOnly=true
→ ProductListing[] with availability per warehouse
```

### Warehouses
```
GET /api/warehouses
→ WarehouseWithStocks[]
```

### Reservations
```
POST /api/reservations
→ Reservation | 409 (insufficient stock)

GET /api/reservations/:id
→ Reservation | 404 (not found)

POST /api/reservations/:id/confirm
→ Reservation (status=CONFIRMED) | 410 (expired) | 409 (invalid state)

POST /api/reservations/:id/release
→ Reservation (status=RELEASED)

POST /api/reservations/:id/extend
→ Reservation (expiresAt extended by 10min)
```

---

## 🌐 Frontend Pages

| Page | Route | Features |
|------|-------|----------|
| **Landing** | `/` | Hero + Features + CTA |
| **Products** | `/products` | Grid, filters, stock per warehouse |
| **Checkout** | `/checkout/[id]` | Timer, confirm/cancel, error handling |

---

## ⏰ Reservation Expiry Mechanism

### Primary: Vercel Cron (Every 1 Minute)
```json
// vercel.json
{
  "crons": [{"path": "/api/cron/expire", "schedule": "* * * * *"}]
}
```

**Flow**:
1. Cron hits `/api/cron/expire` every minute
2. Finds all PENDING reservations where `expiresAt < now()`
3. Decrements reserved units, updates status to RELEASED
4. All atomic in Prisma transaction

### Backup: Lazy Cleanup
When confirming expired reservation, immediately release:
```typescript
if (reservation.expiresAt < new Date()) {
  await tx.stock.update({...decrement})
  await tx.reservation.update({status: 'RELEASED'})
  throw new ReservationExpiredError() // 410
}
```

**Result**: Reservations released within 1-2 minutes max.

---

## 🔐 Idempotency (Bonus)

**Problem**: Retries can create duplicate reservations
**Solution**: Redis-backed response caching

```bash
# Client sends:
POST /api/reservations
Idempotency-Key: unique-key-123

# Server caches in Redis (24h TTL):
idempotency:reservations:unique-key-123 → {statusCode: 201, body: {...}}

# On retry: Returns cached response instantly (no side effects)
```

**Result**: Payment retries are safe.

---

## 🐳 Docker Setup

### Files
- `Dockerfile` - Multi-stage build
- `docker-compose.yml` - PostgreSQL + Redis + App
- `docker-compose.dev.yml` - Dev with live reload
- `Makefile` - Convenience commands

### Architecture
```
┌─────────────────────┐
│    Next.js App      │
│   (Port 3000)       │
├─────────┬───────────┤
│         │           │
▼         ▼           ▼
Postgres Redis     Cron Job
(5432)   (6379)  (every 1min)
```

---

## 🚀 Deployment

### Recommended Stack
- **App**: Vercel (free tier, Next.js optimized)
- **Database**: Neon or Supabase (PostgreSQL managed)
- **Cache**: Upstash (Redis managed)

### Deployment Steps
```bash
# 1. Push to GitHub
git push origin main

# 2. Set env vars in Vercel dashboard
DATABASE_URL=your_neon_url
DIRECT_URL=your_neon_direct_url
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
CRON_SECRET=random_32_chars

# 3. Vercel auto-deploys on push
# 4. Verify: https://your-domain.vercel.app
```

---

## 🏆 Trade-offs & Design Decisions

| Decision | Choice | Reason | Trade-off |
|----------|--------|--------|-----------|
| Locking | Pessimistic (SELECT FOR UPDATE) | Race-condition free guarantee | Slightly higher latency under load |
| Cache | Redis (Upstash) | Sub-ms idempotency lookups | Extra infrastructure dependency |
| TTL | 10 minutes | Covers most payment flows | Shorter = better accuracy |
| Cron Frequency | 1 minute | Balances load with latency | ~59s max hold past expiry |
| Frontend State | React hooks | Simple, sufficient | Could use React Query later |
| UI Framework | Tailwind CSS | Lightweight, professional | Limited component library |

---

## 🐛 Troubleshooting

### Docker Issues
```bash
# Logs
docker-compose logs app
docker-compose logs postgres
docker-compose logs redis

# Reset
make docker-reset

# Health check
docker-compose ps
```

### API Issues
```bash
# 409 on POST /api/reservations?
→ Stock is unavailable (expected)
→ Check /api/products to see available units

# 410 on POST /api/reservations/:id/confirm?
→ Reservation expired (10 min timeout)
→ Create new reservation
```

### Frontend Issues
```bash
# Countdown not ticking?
→ Check browser console for errors
→ Verify /api/reservations/:id response

# "Confirm" button disabled?
→ Reservation might be expired
→ Try page refresh
```

---

## 📊 Database Schema

```
Products
├── id, name, price, category, imageUrl, isActive
└── relations: stocks[]

Warehouses
├── id, name, location, isActive
└── relations: stocks[]

Stocks (Product × Warehouse)
├── id, productId, warehouseId
├── totalUnits, reservedUnits
├── availableUnits = totalUnits - reservedUnits (computed)
├── unique: (productId, warehouseId)
└── relations: product, warehouse, reservations[]

Reservations
├── id, stockId, units, status (PENDING/CONFIRMED/RELEASED)
├── expiresAt, confirmedAt, releasedAt
├── index: (status, expiresAt) for expiry queries
└── relations: stock with product & warehouse
```

---

## 📝 Example Workflow

```
1. Visit http://localhost:3000
2. Click "Start Shopping"
3. Browse products, click "Reserve Now"
4. Enter quantity, click "Reserve"
5. Redirected to /checkout/[reservationId]
6. See 10-minute countdown timer
7. Click "Confirm Purchase" before timer expires
8. See success message
9. Done! ✅
```

---

## 🎓 Key Learnings

1. **Race conditions require deep thinking** - Timeline analysis essential
2. **Pessimistic locking is elegant** - `SELECT FOR UPDATE` solves overselling
3. **Idempotency matters for payments** - Always retry-safe
4. **Multiple strategies beat single points of failure** - Cron + lazy cleanup
5. **Type safety catches errors early** - TypeScript + Zod invaluable

---

## ✅ Submission Checklist

- [x] Backend: Race-condition free logic
- [x] Backend: All required API endpoints
- [x] Backend: Idempotency (bonus)
- [x] Backend: Vercel Cron
- [x] Frontend: Product listing
- [x] Frontend: Checkout with countdown
- [x] Frontend: Error handling (409, 410)
- [x] Frontend: Real-time updates
- [x] Database: PostgreSQL + Prisma
- [x] Cache: Redis
- [x] Docker: Dockerfile + Compose
- [x] Deployment: Instructions
- [x] Documentation: This README

---

**Built with ❤️ for the Allo Engineering assignment**
