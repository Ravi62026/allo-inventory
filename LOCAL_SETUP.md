# Local Development Setup (Without Docker)

## Prerequisites

Make sure you have installed:
- **Node.js 20+** → Download from https://nodejs.org
- **npm** → Comes with Node.js

## Step 1: Create `.env.local` file

Create file named `.env.local` in project root:

```env
# PostgreSQL (use cloud service - easier than local)
DATABASE_URL="postgresql://user:password@host:5432/allo_inventory"
DIRECT_URL="postgresql://user:password@host:5432/allo_inventory"

# Redis (use Upstash free tier)
UPSTASH_REDIS_REST_URL="https://your-upstash-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# Security
CRON_SECRET="dev_cron_secret_minimum_32_characters_long!!"

# Node
NODE_ENV="development"
```

## Step 2: Get PostgreSQL & Redis (Easiest Way)

### Option A: Cloud Services (Recommended - No Setup Needed)

**PostgreSQL** - Use Neon (free tier, no credit card):
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create new project
4. Copy connection string to `.env.local` as `DATABASE_URL`
5. Also set `DIRECT_URL` to same string

**Redis** - Use Upstash (free tier):
1. Go to https://upstash.com
2. Sign up
3. Create Redis database
4. Copy REST API URL → `UPSTASH_REDIS_REST_URL`
5. Copy REST API Token → `UPSTASH_REDIS_REST_TOKEN`

Total time: 5 minutes, zero local setup.

### Option B: Local PostgreSQL (Advanced)

If you want local PostgreSQL:

**Windows:**
1. Download PostgreSQL installer: https://www.postgresql.org/download/windows/
2. Install (remember password for `postgres` user)
3. Set connection string:
   ```
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/allo_inventory"
   DIRECT_URL="postgresql://postgres:your_password@localhost:5432/allo_inventory"
   ```

**Mac:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

For Redis locally, it's more complex. **Recommend using Upstash instead** (free, easier).

## Step 3: Install Dependencies

```bash
npm install
```

Takes ~2 minutes.

## Step 4: Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Create tables (migrations)
npm run db:migrate

# Seed sample data
npm run db:seed
```

You should see:
```
Seed complete.
```

## Step 5: Start Development Server

```bash
npm run dev
```

You should see:
```
> next dev
  ▲ Next.js 16.2.6
  - Local:        http://localhost:3000
```

## Step 6: Open in Browser

Visit: **http://localhost:3000**

You should see the landing page with "AlloStock" title.

---

## 🧪 Test Everything Works

### Test 1: Landing Page
```
✓ Visit http://localhost:3000
✓ See hero section with "AlloStock"
✓ See feature cards
✓ Click "Start Shopping" → Goes to /products
```

### Test 2: Products Page
```
✓ Visit http://localhost:3000/products
✓ See product list (should see 6 products)
✓ See filters (Category, Warehouse, In Stock)
✓ Click on a product card
```

### Test 3: Make a Reservation
```
✓ Click "Reserve Now" on any product
✓ Redirected to /checkout/[id]
✓ See countdown timer (10 minutes)
✓ See product details and price
✓ Click "Confirm Purchase" or "Cancel"
```

If all 3 tests pass ✅ - You're good to go!

---

## 📝 Common Environment Variables Explained

| Variable | What It Is | Where To Get |
|----------|-----------|--------------|
| `DATABASE_URL` | PostgreSQL connection | Neon dashboard |
| `DIRECT_URL` | PostgreSQL direct connection (migrations) | Same as DATABASE_URL |
| `UPSTASH_REDIS_REST_URL` | Redis REST API endpoint | Upstash dashboard |
| `UPSTASH_REDIS_REST_TOKEN` | Redis authentication token | Upstash dashboard |
| `CRON_SECRET` | Secret for cron job protection | Make it random, 32+ chars |
| `NODE_ENV` | Environment mode | "development" for local |

---

## 🔴 Troubleshooting

### Error: "Cannot find module '@prisma/client'"
```bash
Solution:
npm install
npm run db:generate
```

### Error: "P1000 - Authentication failed"
- Database URL is wrong
- Check username/password in `.env.local`
- For Neon: Copy full connection string exactly

### Error: "Could not connect to Redis"
- Upstash token is wrong
- Check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Try updating to latest: `npm update @upstash/redis`

### Products page shows "No products found"
```bash
Solution: Reseed the database
npm run db:seed
```

### Countdown timer not updating
- Check browser console (F12) for errors
- Network tab: verify `/api/reservations/[id]` responds
- Might need page refresh

### "Failed to fetch products" error
- Start backend: `npm run dev`
- Check if running on http://localhost:3000
- Check `.env.local` is correct

---

## 📊 Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Database commands
npm run db:generate          # Generate Prisma client
npm run db:migrate          # Run migrations
npm run db:push             # Push schema to DB (alternative to migrate)
npm run db:seed             # Seed sample data
npm run db:studio           # Open Prisma Studio UI (visual DB editor)
```

---

## 🔍 Check If Everything Is Running

### Test API Health
```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{"status":"ok","db":"connected","timestamp":"2026-05-23T..."}
```

### Test Get Products
```bash
curl http://localhost:3000/api/products
```

Should return array of products.

### Test Get Warehouses
```bash
curl http://localhost:3000/api/warehouses
```

Should return 3 warehouses (Mumbai, Delhi, Bangalore).

---

## 💡 Tips

1. **Keep dev server running** - Open new terminal for other commands
2. **Hot reload** - Changes auto-reload, no need to restart
3. **Database Studio** - See your data visually:
   ```bash
   npm run db:studio
   # Opens http://localhost:5555 with visual DB editor
   ```
4. **Check logs** - Terminal where you ran `npm run dev` shows errors

---

## 📱 Next: Test End-to-End Flow

```
1. npm run dev
   ↓
2. Open http://localhost:3000
   ↓
3. Click "Start Shopping"
   ↓
4. Click "Reserve Now" on a product
   ↓
5. See countdown timer
   ↓
6. Click "Confirm Purchase"
   ↓
7. See success message ✅
```

If all works → You're ready to deploy!
