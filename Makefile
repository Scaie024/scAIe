# CRM Admin System Makefile
# Provides convenient commands for development and deployment

.PHONY: help install setup dev build start test clean docker-dev docker-prod deploy health

# Default target
help:
	@echo "CRM Admin System - Available Commands"
	@echo "====================================="
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make install     - Install dependencies"
	@echo "  make setup       - Run full system setup"
	@echo "  make health      - Run health check"
	@echo ""
	@echo "Development:"
	@echo "  make dev         - Start development server"
	@echo "  make build       - Build for production"
	@echo "  make start       - Start production server"
	@echo "  make test        - Run tests"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate  - Run database migrations"
	@echo "  make db-seed     - Seed database with sample data"
	@echo "  make db-reset    - Reset database (migrate + seed)"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-dev  - Start with Docker (development)"
	@echo "  make docker-prod - Start with Docker (production)"
	@echo "  make docker-stop - Stop Docker containers"
	@echo "  make docker-clean- Clean Docker containers and images"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make logs        - View application logs"
	@echo "  make backup      - Backup database"
	@echo "  make deploy      - Deploy to production"

# Installation and Setup
install:
	@echo "📦 Installing dependencies..."
	npm install

setup:
	@echo "🚀 Running system setup..."
	node scripts/setup.js

health:
	@echo "🏥 Running health check..."
	node scripts/health-check.js

# Development
dev:
	@echo "🔧 Starting development server..."
	npm run dev

build:
	@echo "🏗️  Building for production..."
	npm run build

start:
	@echo "🚀 Starting production server..."
	npm run start

test:
	@echo "🧪 Running tests..."
	npm test

# Database
db-migrate:
	@echo "🗄️  Running database migrations..."
	node scripts/migrate.js

db-seed:
	@echo "🌱 Seeding database..."
	node scripts/seed.js

db-reset: db-migrate db-seed
	@echo "✅ Database reset complete"

# Docker
docker-dev:
	@echo "🐳 Starting Docker development environment..."
	docker-compose -f docker-compose.dev.yml up --build

docker-prod:
	@echo "🐳 Starting Docker production environment..."
	docker-compose up --build -d

docker-stop:
	@echo "🛑 Stopping Docker containers..."
	docker-compose down

docker-clean:
	@echo "🧹 Cleaning Docker containers and images..."
	docker-compose down --rmi all --volumes --remove-orphans

# Maintenance
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf .next
	rm -rf node_modules/.cache
	rm -rf dist

logs:
	@echo "📋 Viewing application logs..."
	@if [ -f docker-compose.yml ]; then \
		docker-compose logs -f crm-app; \
	else \
		echo "No Docker containers running. Check your development server logs."; \
	fi

backup:
	@echo "💾 Creating database backup..."
	@mkdir -p backups
	@timestamp=$$(date +%Y%m%d_%H%M%S); \
	echo "Creating backup: backups/backup_$$timestamp.sql"; \
	node scripts/backup.js "backups/backup_$$timestamp.sql"

deploy:
	@echo "🚀 Deploying to production..."
	@echo "⚠️  Make sure you have configured your production environment!"
	@read -p "Continue with deployment? (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		make build && \
		make docker-prod && \
		echo "✅ Deployment complete!"; \
	else \
		echo "Deployment cancelled."; \
	fi

# Development helpers
lint:
	@echo "🔍 Running linter..."
	npm run lint

format:
	@echo "✨ Formatting code..."
	npm run format

type-check:
	@echo "🔍 Running type check..."
	npm run type-check

# Quick start for new developers
quick-start: install setup health
	@echo ""
	@echo "🎉 Quick start complete!"
	@echo "Run 'make dev' to start development server"

# Production deployment
prod-deploy: build docker-prod
	@echo "✅ Production deployment complete!"

# Full reset (use with caution)
reset: clean install db-reset
	@echo "⚠️  Full system reset complete!"
