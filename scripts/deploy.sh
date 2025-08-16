#!/bin/bash

# CRM Admin System Deployment Script
# Automates deployment to production servers

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_ENV=${1:-production}
BACKUP_DIR="backups"
DEPLOY_DIR="/var/www/crm-admin"
SERVICE_NAME="crm-admin"

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check if running as root
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        warning "Running as root. Consider using a dedicated user for deployment."
    fi
}

# Backup current deployment
backup_current() {
    log "Creating backup of current deployment..."
    
    if [ -d "$DEPLOY_DIR" ]; then
        timestamp=$(date +%Y%m%d_%H%M%S)
        backup_path="${BACKUP_DIR}/deployment_backup_${timestamp}.tar.gz"
        
        mkdir -p "$BACKUP_DIR"
        tar -czf "$backup_path" -C "$(dirname $DEPLOY_DIR)" "$(basename $DEPLOY_DIR)" 2>/dev/null || true
        
        success "Backup created: $backup_path"
    else
        warning "No existing deployment found to backup"
    fi
}

# Build application
build_application() {
    log "Building application..."
    
    npm ci --production=false
    npm run build
    
    success "Application built successfully"
}

# Deploy with Docker
deploy_docker() {
    log "Deploying with Docker..."
    
    # Stop existing containers
    docker-compose down 2>/dev/null || true
    
    # Build and start new containers
    docker-compose up --build -d
    
    # Wait for services to be ready
    log "Waiting for services to start..."
    sleep 10
    
    # Health check
    if curl -f http://localhost:3000/api/chat > /dev/null 2>&1; then
        success "Docker deployment successful"
    else
        error "Docker deployment failed - health check failed"
    fi
}

# Deploy manually
deploy_manual() {
    log "Deploying manually..."
    
    # Stop existing service
    sudo systemctl stop "$SERVICE_NAME" 2>/dev/null || true
    
    # Copy files
    sudo mkdir -p "$DEPLOY_DIR"
    sudo cp -r .next "$DEPLOY_DIR/"
    sudo cp -r public "$DEPLOY_DIR/"
    sudo cp -r node_modules "$DEPLOY_DIR/"
    sudo cp package.json "$DEPLOY_DIR/"
    sudo cp .env "$DEPLOY_DIR/"
    
    # Set permissions
    sudo chown -R www-data:www-data "$DEPLOY_DIR"
    
    # Start service
    sudo systemctl start "$SERVICE_NAME"
    sudo systemctl enable "$SERVICE_NAME"
    
    success "Manual deployment successful"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    node scripts/migrate.js
    
    success "Database migrations completed"
}

# Health check
health_check() {
    log "Running post-deployment health check..."
    
    # Wait a moment for services to fully start
    sleep 5
    
    # Check application health
    if curl -f http://localhost:3000/api/chat > /dev/null 2>&1; then
        success "Application is healthy"
    else
        error "Health check failed - application may not be running correctly"
    fi
    
    # Run full health check script
    node scripts/health-check.js
}

# Rollback function
rollback() {
    warning "Rolling back deployment..."
    
    # Find latest backup
    latest_backup=$(ls -t ${BACKUP_DIR}/deployment_backup_*.tar.gz 2>/dev/null | head -n1)
    
    if [ -n "$latest_backup" ]; then
        log "Restoring from backup: $latest_backup"
        
        # Stop current deployment
        docker-compose down 2>/dev/null || sudo systemctl stop "$SERVICE_NAME" 2>/dev/null || true
        
        # Restore backup
        sudo rm -rf "$DEPLOY_DIR"
        sudo tar -xzf "$latest_backup" -C "$(dirname $DEPLOY_DIR)"
        
        # Restart service
        if [ -f "docker-compose.yml" ]; then
            docker-compose up -d
        else
            sudo systemctl start "$SERVICE_NAME"
        fi
        
        success "Rollback completed"
    else
        error "No backup found for rollback"
    fi
}

# Main deployment function
main() {
    log "Starting deployment to $DEPLOY_ENV environment..."
    
    # Pre-deployment checks
    check_permissions
    
    # Create backup
    backup_current
    
    # Build application
    build_application
    
    # Run migrations
    run_migrations
    
    # Deploy based on method
    if [ -f "docker-compose.yml" ]; then
        deploy_docker
    else
        deploy_manual
    fi
    
    # Post-deployment health check
    health_check
    
    success "Deployment completed successfully!"
    log "Application is running at: http://localhost:3000"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback
        ;;
    "health")
        health_check
        ;;
    *)
        echo "Usage: $0 [deploy|rollback|health]"
        echo ""
        echo "Commands:"
        echo "  deploy   - Deploy the application (default)"
        echo "  rollback - Rollback to previous deployment"
        echo "  health   - Run health check only"
        exit 1
        ;;
esac
