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
- ✅ **Pending vs Confirmed Tracking**: Only PENDING (temporary) reservations show as "held"; CONFIRMED orders don't

### Authentication & User Features
- ✅ **Optional Authentication**: Entire app works as guest; auth only in reserve modal (Sign In / Sign Up / Skip)
- ✅ **User Dashboard**: Reservation stats, recent orders, spend tracking, top categories
- ✅ **Per-User Filter Preferences**: Saved to Redis (30-day TTL) — fast product list next visit
- ✅ **Session Management**: Redis-based httpOnly cookies, 7-day TTL
- ✅ **Password Security**: bcryptjs hashing (12 rounds)

### Advanced Features
- ✅ **Idempotency**: Redis-backed `Idempotency-Key` support prevents duplicate charges on retries
- ✅ **Transaction Safety**: All multi-step operations atomic in Prisma transactions
- ✅ **Type Safety**: Full TypeScript end-to-end with Zod validation
- ✅ **Docker**: Multi-stage builds, Alpine base, health checks
- ✅ **API Validation**: Request/response validation with proper HTTP status codes
- ✅ **Manifest Export**: Export reservation details as JSON on order confirmation

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

### Authentication
```
POST /api/auth/signup
→ User created + session set | 409 (duplicate email)

POST /api/auth/login
→ Session created | 401 (invalid credentials)

POST /api/auth/logout
→ Session deleted

GET /api/auth/me
→ User | null (guest)

GET /api/auth/prefs
→ Saved filters (category, warehouseId, inStockOnly) | null (guest)

PUT /api/auth/prefs
→ Filters saved to Redis (30-day TTL)
```

### Products
```
GET /api/products?category=Wellness&warehouseId=wh-mumbai&inStockOnly=true
→ ProductListing[] with availability + pendingUnits per warehouse
```

### Warehouses
```
GET /api/warehouses
→ WarehouseWithStocks[]
```

### Reservations
```
POST /api/reservations
→ Reservation (PENDING) | 409 (insufficient stock)

GET /api/reservations/:id
→ Reservation | 404 (not found)

POST /api/reservations/:id/confirm
→ Reservation (status=CONFIRMED) | 410 (expired) | 409 (invalid state)

POST /api/reservations/:id/release
→ Reservation (status=RELEASED)

POST /api/reservations/:id/extend
→ Reservation (expiresAt extended by 10min)
```

### Dashboard
```
GET /api/dashboard
→ User stats, recent reservations (auth required)
```

### Cron
```
POST /api/cron/expire
→ Expired reservations auto-released (Vercel Cron, protected by CRON_SECRET)
```

---

## 🌐 Frontend Pages

| Page | Route | Features |
|------|-------|----------|
| **Landing** | `/` | Hero + Features + CTA |
| **Sign In** | `/login` | Email/password form, remember me, redirects |
| **Sign Up** | `/signup` | Email/password/name form, validation |
| **Dashboard** | `/dashboard` | Stats cards, recent reservations, quick links (auth required) |
| **Products** | `/products` | 2-column grid, per-warehouse stock table, demand bars, filters (guest-friendly) |
| **Reserve Modal** | Modal | Warehouse select, quantity picker, auth prompt with guest skip option |
| **Checkout** | `/checkout/[id]` | Timer, system verification, allocation log, confirm/cancel (guest-friendly) |
| **Allocation Confirmed** | `/checkout/[id]` | Success page, manifest export, manage fulfillment, browse products |

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
Users
├── id, name, email (unique), password (bcrypt)
├── createdAt, updatedAt
└── relations: reservations[]

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
├── id, stockId, userId (optional), units, status (PENDING/CONFIRMED/RELEASED)
├── expiresAt, confirmedAt, releasedAt
├── index: (status, expiresAt) for expiry queries
├── index: userId for dashboard queries
└── relations: stock with product & warehouse, user
```

### Redis Keys
```
session:{sessionId} → User object (7-day TTL)
user:{userId}:prefs → {category, warehouseId, inStockOnly} (30-day TTL)
user:{userId}:dashboard → {stats, recent reservations} (60s TTL)
idempotency:{scope}:{key} → Response body (24-hour TTL)
products:{query} → ProductListing[] (30s TTL)
```

---

## 📝 Example Workflows

### As Guest (No Auth Required)
```
1. Visit http://localhost:3000
2. Click "Start Shopping" → /products
3. Browse products, click "Reserve"
4. Select warehouse, quantity → click "Confirm & Hold Units"
5. See auth prompt (optional: can skip)
6. Click "Skip — continue as guest"
7. Redirected to /checkout/[reservationId]
8. See 10-minute countdown timer
9. Click "Commit & Fulfill" before timer expires
10. See allocation confirmed page with manifest export
11. Done! ✅
```

### With Authentication
```
1. Visit http://localhost:3000
2. Click "Get Started" → /signup
3. Enter name, email, password → create account
4. Redirected to /dashboard
5. See reservation stats + recent orders
6. Click "Browse Products"
7. Browse products (filters auto-saved for next visit)
8. Click "Reserve" → modal opens
9. In auth prompt, click "Sign In" (already logged in)
10. Confirm warehouse selection
11. Redirected to /checkout/[reservationId]
12. Click "Commit & Fulfill"
13. See allocation confirmed page + manifest export
14. Dashboard now shows updated stats
15. Done! ✅
```

---

## 🎓 Key Learnings

1. **Race conditions require deep thinking** - Timeline analysis essential
2. **Pessimistic locking is elegant** - `SELECT FOR UPDATE` solves overselling
3. **Idempotency matters for payments** - Always retry-safe
4. **Multiple strategies beat single points of failure** - Cron + lazy cleanup
5. **Type safety catches errors early** - TypeScript + Zod invaluable

---

## ✅ Feature Checklist

### Core Requirements
- [x] Backend: Race-condition free logic with `SELECT FOR UPDATE`
- [x] Backend: All required API endpoints (reserve, confirm, release)
- [x] Backend: Idempotency with Redis (bonus)
- [x] Backend: Vercel Cron for expiry
- [x] Frontend: Product listing with per-warehouse inventory
- [x] Frontend: Checkout with countdown timer
- [x] Frontend: Error handling (409 conflict, 410 expired)
- [x] Frontend: Real-time stock updates
- [x] Database: PostgreSQL + Prisma ORM
- [x] Cache: Redis with multiple key strategies
- [x] Docker: Multi-stage build + Compose
- [x] Deployment: Vercel + Neon + Upstash instructions

### Authentication & User Features
- [x] User signup with name/email/password
- [x] User login with email/password
- [x] Session management (httpOnly cookies, 7-day TTL)
- [x] Password hashing (bcryptjs, 12 rounds)
- [x] User dashboard with stats & reservation tracking
- [x] Per-user filter preferences (Redis, 30-day TTL)
- [x] Optional auth in reserve modal (sign in / create account / skip as guest)
- [x] Entire flow accessible without authentication

### Advanced Features
- [x] Differentiate PENDING vs CONFIRMED reservations
- [x] Only PENDING reservations show as "units held"
- [x] 2-column product grid with enterprise UI
- [x] Colored category badges + accent bars
- [x] Demand bars showing reservation pressure
- [x] Per-warehouse stock breakdown with progress bars
- [x] Reserve modal with warehouse selection + quantity picker
- [x] Allocation confirmed page with manifest export
- [x] Manage fulfillment navigation to warehouses
- [x] Navbar with user menu (avatar, dashboard, sign out)

### Documentation
- [x] Comprehensive README with examples
- [x] API endpoint documentation
- [x] Database schema documentation
- [x] Workflow examples (guest & authenticated)
- [x] Troubleshooting guide
- [x] Design decision trade-offs

---

**Built with ❤️ for the Allo Engineering assignment**
 
