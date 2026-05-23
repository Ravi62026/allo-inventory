.PHONY: help docker-build docker-up docker-down docker-logs docker-seed docker-clean docker-reset

help:
	@echo "AlloStock Docker Commands:"
	@echo ""
	@echo "  make docker-build     - Build Docker images"
	@echo "  make docker-up        - Start all services (postgres, redis, app)"
	@echo "  make docker-down      - Stop all services"
	@echo "  make docker-logs      - View container logs"
	@echo "  make docker-seed      - Seed database with sample data"
	@echo "  make docker-clean     - Remove containers and volumes (keep images)"
	@echo "  make docker-reset     - Full reset: remove everything and rebuild"
	@echo ""
	@echo "Quick Start:"
	@echo "  make docker-build && make docker-up && make docker-seed"
	@echo "  Then visit: http://localhost:3000"

docker-build:
	@echo "🐳 Building Docker images..."
	docker-compose build --no-cache

docker-up:
	@echo "🚀 Starting services..."
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "   App: http://localhost:3000"
	@echo "   Postgres: localhost:5432"
	@echo "   Redis: localhost:6379"

docker-down:
	@echo "🛑 Stopping services..."
	docker-compose down

docker-logs:
	docker-compose logs -f app

docker-logs-all:
	docker-compose logs -f

docker-seed:
	@echo "🌱 Seeding database..."
	docker-compose exec app npx prisma migrate deploy
	docker-compose exec app npm run db:seed
	@echo "✅ Database seeded with sample data!"

docker-clean:
	@echo "🧹 Cleaning up containers and volumes..."
	docker-compose down -v
	@echo "✅ Cleanup complete!"

docker-reset:
	@echo "🔄 Full reset: removing everything..."
	docker-compose down -v
	docker system prune -f
	@echo "🏗️  Rebuilding..."
	docker-compose build --no-cache
	@echo "🚀 Starting..."
	docker-compose up -d
	@echo "⏳ Waiting for services to be healthy..."
	sleep 5
	@echo "🌱 Seeding..."
	docker-compose exec app npx prisma migrate deploy
	docker-compose exec app npm run db:seed
	@echo "✅ Full reset complete!"
	@echo "   App: http://localhost:3000"

docker-shell:
	@echo "📦 Opening shell in app container..."
	docker-compose exec app sh

docker-db-shell:
	@echo "🐘 Opening PostgreSQL shell..."
	docker-compose exec postgres psql -U allo -d allo_inventory

docker-redis-shell:
	@echo "🔴 Opening Redis CLI..."
	docker-compose exec redis redis-cli

docker-ps:
	@echo "📊 Running containers:"
	docker-compose ps

docker-stats:
	@echo "📈 Container resource usage:"
	docker stats --no-stream
