# Installation Guide

This guide provides detailed instructions for installing and configuring the CRM Admin System.

## System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 10GB free space
- **Network**: Stable internet connection

### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 20GB+ SSD
- **Network**: High-speed internet for AI operations

## Installation Methods

### Method 1: Docker Installation (Recommended)

Docker provides the easiest and most reliable installation method.

#### Prerequisites
\`\`\`bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
\`\`\`

#### Installation Steps

1. **Clone Repository**
   \`\`\`bash
   git clone https://github.com/your-org/crm-admin-system.git
   cd crm-admin-system
   \`\`\`

2. **Environment Configuration**
   \`\`\`bash
   cp .env.example .env
   \`\`\`

   Edit `.env` with your configuration:
   \`\`\`env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # AI Configuration
   QWEN_API_KEY=sk-your-qwen-api-key

   # Database Configuration
   POSTGRES_URL=postgresql://postgres:postgres@postgres:5432/crm_db
   \`\`\`

3. **Start Services**
   \`\`\`bash
   # Development mode
   docker-compose -f docker-compose.dev.yml up --build

   # Production mode
   docker-compose up --build -d
   \`\`\`

4. **Verify Installation**
   - Development: http://localhost:3000
   - Production: http://localhost

### Method 2: Local Development Installation

For developers who want to run the system locally without Docker.

#### Prerequisites
\`\`\`bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
\`\`\`

#### Installation Steps

1. **Clone and Setup**
   \`\`\`bash
   git clone https://github.com/your-org/crm-admin-system.git
   cd crm-admin-system
   npm install
   \`\`\`

2. **Environment Configuration**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

3. **Database Setup**
   \`\`\`bash
   # If using local PostgreSQL
   createdb crm_db
   
   # Run migrations
   npm run db:migrate
   npm run db:seed
   \`\`\`

4. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

### Method 3: Production Server Installation

For production deployment on a server.

#### Prerequisites
\`\`\`bash
# Install Node.js, Nginx, PostgreSQL
sudo apt update
sudo apt install -y nodejs npm nginx postgresql postgresql-contrib
\`\`\`

#### Installation Steps

1. **Application Setup**
   \`\`\`bash
   # Clone to production directory
   sudo git clone https://github.com/your-org/crm-admin-system.git /var/www/crm-admin
   cd /var/www/crm-admin
   
   # Install dependencies
   sudo npm install --production
   
   # Build application
   sudo npm run build
   \`\`\`

2. **Database Configuration**
   \`\`\`bash
   # Create database and user
   sudo -u postgres psql
   CREATE DATABASE crm_db;
   CREATE USER crm_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;
   \q
   \`\`\`

3. **Nginx Configuration**
   ```nginx
   # /etc/nginx/sites-available/crm-admin
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   \`\`\`

4. **Process Management**
   \`\`\`bash
   # Install PM2
   sudo npm install -g pm2
   
   # Start application
   pm2 start npm --name "crm-admin" -- start
   pm2 startup
   pm2 save
   \`\`\`

## Configuration

### Supabase Setup

1. **Create Project**
   - Go to [Supabase Dashboard](https://app.supabase.com/)
   - Create new project
   - Note the project URL and API keys

2. **Database Schema**
   \`\`\`bash
   # Run SQL scripts in order
   psql -h your-supabase-host -U postgres -d postgres -f scripts/01-create-tables.sql
   psql -h your-supabase-host -U postgres -d postgres -f scripts/02-seed-data.sql
   psql -h your-supabase-host -U postgres -d postgres -f scripts/08-final-system-setup.sql
   \`\`\`

3. **Row Level Security**
   - RLS policies are automatically created by the scripts
   - Verify in Supabase Dashboard > Authentication > Policies

### AI Configuration

1. **Qwen API Setup**
   - Sign up at [Alibaba Cloud DashScope](https://dashscope.aliyuncs.com/)
   - Create API key
   - Add to environment variables

2. **Model Configuration**
   \`\`\`typescript
   // config/constants.ts
   export const AI_CONFIG = {
     models: {
       QWEN: "qwen-turbo",
       FALLBACK: "qwen-plus",
     },
     maxTokens: 2000,
     temperature: 0.7,
   }
   \`\`\`

### SSL Configuration (Production)

1. **Install Certbot**
   \`\`\`bash
   sudo apt install certbot python3-certbot-nginx
   \`\`\`

2. **Generate Certificate**
   \`\`\`bash
   sudo certbot --nginx -d your-domain.com
   \`\`\`

3. **Auto-renewal**
   \`\`\`bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   \`\`\`

## Verification

### Health Checks

1. **Application Health**
   \`\`\`bash
   curl http://localhost:3000/api/chat
   \`\`\`

2. **Database Connection**
   \`\`\`bash
   # Check Supabase connection
   curl -H "apikey: your_anon_key" \
        -H "Authorization: Bearer your_anon_key" \
        https://your-project.supabase.co/rest/v1/contacts
   \`\`\`

3. **AI Service**
   \`\`\`bash
   # Test chat endpoint
   curl -X POST http://localhost:3000/api/chat \
        -H "Content-Type: application/json" \
        -d '{"messages":[{"role":"user","content":"Hello"}],"sessionId":"test"}'
   \`\`\`

### Monitoring

1. **Application Logs**
   \`\`\`bash
   # Docker
   docker-compose logs -f crm-app
   
   # PM2
   pm2 logs crm-admin
   \`\`\`

2. **Database Monitoring**
   \`\`\`bash
   # Check connections
   SELECT * FROM pg_stat_activity WHERE datname = 'crm_db';
   \`\`\`

3. **Performance Metrics**
   - Monitor response times in browser dev tools
   - Check Supabase dashboard for query performance
   - Review AI agent logs in the analytics dashboard

## Troubleshooting

### Common Installation Issues

1. **Port Conflicts**
   \`\`\`bash
   # Check port usage
   sudo netstat -tulpn | grep :3000
   
   # Kill process if needed
   sudo kill -9 $(lsof -t -i:3000)
   \`\`\`

2. **Permission Issues**
   \`\`\`bash
   # Fix file permissions
   sudo chown -R $USER:$USER /var/www/crm-admin
   sudo chmod -R 755 /var/www/crm-admin
   \`\`\`

3. **Database Connection**
   \`\`\`bash
   # Test PostgreSQL connection
   pg_isready -h localhost -p 5432
   
   # Check Supabase connectivity
   ping your-project.supabase.co
   \`\`\`

4. **Memory Issues**
   \`\`\`bash
   # Increase Node.js memory limit
   export NODE_OPTIONS="--max-old-space-size=4096"
   \`\`\`

### Getting Help

- Check the [main README](../README.md)
- Review [API documentation](./API.md)
- Create an issue on GitHub
- Check system logs for error details

## Next Steps

After successful installation:

1. **Configure User Access**: Set up authentication if needed
2. **Import Data**: Use the database management interface
3. **Customize Agents**: Configure AI agents for your use case
4. **Set Up Monitoring**: Implement logging and alerting
5. **Backup Strategy**: Configure automated backups

---

For additional help, see the [troubleshooting guide](./TROUBLESHOOTING.md) or [API documentation](./API.md).
