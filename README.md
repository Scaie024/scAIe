# CRM Admin System

A modern, AI-powered Customer Relationship Management (CRM) admin interface built with Next.js, Supabase, and advanced AI agents.

## 🚀 Features

### Core CRM Functionality
- **Contact Management**: Full CRUD operations with real-time updates
- **Advanced Analytics**: Interactive dashboards with charts and metrics
- **Multi-Agent AI System**: Specialized AI agents for sales, support, analytics, and custom business agents
- **Real-time Data**: Live updates using Supabase subscriptions
- **Responsive Design**: Optimized for desktop, tablet, and mobile

### AI Agent Capabilities
- **Intelligent Routing**: Automatic handoff between specialized agents
- **Multi-Model Support**: Qwen Turbo, Plus, and Max models
- **Context Awareness**: Maintains conversation history and business context
- **Error Recovery**: Automatic retries and fallback mechanisms
- **Performance Monitoring**: Real-time health checks and logging
- **Human-like Interactions**: Natural, conversational responses without excessive emojis or informal language

### Technical Features
- **Docker Support**: Complete containerization for easy deployment
- **TypeScript**: Full type safety and developer experience
- **Modern UI**: Built with Tailwind CSS and Shadcn/UI components
- **Database Integration**: Supabase with Row Level Security
- **API Architecture**: RESTful endpoints with streaming support

## 📋 Prerequisites

- Node.js 18+ 
- Docker and Docker Compose (for containerized deployment)
- Supabase account (for database and authentication)
- Qwen API key (for AI functionality)

## 🛠️ Quick Start

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crm-admin-system
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   # Development
   docker-compose -f docker-compose.dev.yml up --build

   # Production
   docker-compose up --build -d
   ```

4. **Access the application**
   - Development: http://localhost:3000
   - Production: http://localhost (with Nginx)

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase and API keys
   ```

3. **Run database setup**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Configuration
QWEN_API_KEY=your_qwen_api_key

# Database (for local development)
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/crm_db

# Application
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
```

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL scripts in the `scripts/` directory:
   - `01-create-tables.sql` - Creates the database schema
   - `02-seed-data.sql` - Adds sample data
   - `08-final-system-setup.sql` - Complete setup with permissions

3. Configure Row Level Security policies (handled by scripts)

### AI Configuration

The system supports multiple Qwen models:
- **qwen-turbo**: Fast responses for general queries
- **qwen-plus**: Balanced performance for complex tasks  
- **qwen-max**: Advanced reasoning for sophisticated requests

## 📖 Usage Guide

### Dashboard
- View key metrics and performance indicators
- Interactive charts showing weekly activity
- Recent agent interactions and system status

### Database Management
- Add, edit, and delete contacts
- Real-time search and filtering
- CSV export functionality
- Inline editing with validation

### Analytics
- Comprehensive business intelligence
- Agent performance metrics
- Channel distribution analysis
- Trend forecasting and insights

### AI Sandbox
- Multi-agent chat interface
- Specialized agents for different tasks
- Automatic agent handoffs
- Context-aware conversations
- **SCAIE Agent**: Specialized agent for handling inquiries about www.scaie.com.mx

## 🏗️ Architecture

### Project Structure
```
crm-admin-system/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── database/          # Database management pages
│   ├── analytics/         # Analytics dashboard
│   └── sandbox/           # AI agent interface
├── components/            # React components
│   ├── ui/               # Base UI components
│   └── sandbox/          # AI-specific components
├── lib/                   # Core libraries
│   ├── ai/               # AI agent system
│   ├── supabase/         # Database client
│   └── validations/      # Input validation
├── types/                 # TypeScript definitions
├── config/               # Configuration files
├── utils/                # Utility functions
├── hooks/                # Custom React hooks
├── scripts/              # Database scripts
└── docs/                 # Documentation
```

### AI Agent System

The system uses a sophisticated multi-agent architecture:

1. **Agent Manager**: Handles message processing, retries, and model selection
2. **Agent Orchestrator**: Routes messages and manages agent handoffs
3. **Specialized Agents**: Sales, Support, Analytics, Planning, and custom business agents
4. **Context Management**: Maintains conversation history and business context

#### SCAIE Agent (New in v6.0)
A specialized agent designed to handle inquiries about SCAIE services (www.scaie.com.mx). Features include:
- Natural, human-like responses without excessive emojis or informal language
- Direct routing for SCAIE-related keywords
- Consistent provision of contact information (5535913417) for quote requests
- Professional business development specialist persona (Rocío García)

### Database Schema

- **contacts**: Customer and prospect information
- **agent_logs**: AI interaction logging and analytics
- **RLS Policies**: Row-level security for data protection

## 🚀 Deployment

### Docker Production Deployment

1. **Build production image**
   ```bash
   docker build -t crm-admin .
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose --profile production up -d
   ```

3. **Configure Nginx** (included in docker-compose.yml)
   - SSL termination
   - Gzip compression
   - Security headers

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Environment-Specific Configurations

- **Development**: Hot reload, debug logging, development database
- **Production**: Optimized builds, error tracking, production database
- **Docker**: Containerized with Nginx, PostgreSQL, and Redis

## 🔍 API Reference

### Chat API
```
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Hello, I need help with my contacts"
    }
  ],
  "agentType": "sales",
  "sessionId": "unique-session-id",
  "metadata": {}
}
```

### Health Check
```
GET /api/health
Response: {
  "status": "healthy",
  "models": {
    "turbo": true,
    "plus": true,
    "max": true
  },
  "activeAgents": 4
}
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks
- `npm run docker:dev` - Start with Docker (development)
- `npm run docker:prod` - Start with Docker (production)

### Code Style

- TypeScript for type safety
- ESLint and Prettier for code formatting
- Conventional commits for version control
- Component-driven development

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify Supabase credentials in `.env`
   - Verify Supabase credentials in `.env`
   - Check network connectivity
   - Ensure RLS policies are configured

2. **AI Agent Not Responding**
   - Verify Qwen API key
   - Check API rate limits
   - Review agent health status at `/api/health`

3. **Docker Issues**
   - Ensure Docker daemon is running
   - Check port availability (3000, 5432, 6379)
   - Verify environment variables in docker-compose

### Debug Mode

Enable debug logging:
```env
NODE_ENV=development
DEBUG=crm:*
```

### Performance Optimization

- Use Redis for caching (included in Docker setup)
- Enable Nginx gzip compression
- Optimize database queries with indexes
- Monitor agent response times

## 🔄 Version 6.0 Updates

### Major Features
- **SCAIE Agent**: New specialized agent for handling inquiries about www.scaie.com.mx
- **Enhanced Agent Personality**: Agents now have more human-like personalities without excessive emojis
- **Improved Routing**: Better intent analysis and agent routing logic
- **Direct Qwen Integration**: Agents now use Qwen LLM directly without fallbacks

### Technical Improvements
- **Agent Manager Refactor**: Improved model selection and context handling
- **Orchestrator Enhancements**: Better synchronous agent access methods
- **Chat Preview Improvements**: More realistic agent interactions in sandbox
- **Dependency Updates**: Updated to latest versions of core libraries

### UI/UX Enhancements
- **Agent Type Indicators**: Visual indicators showing which agent is responding
- **Contact Information Highlighting**: Special display for phone numbers and contact info
- **Test Functionality**: Easy testing of SCAIE agent with dedicated button

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation for new features
- Ensure Docker compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Shadcn/UI](https://ui.shadcn.com/) - Component library
- [Qwen AI](https://dashscope.aliyuncs.com/) - AI language models

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the [documentation](./docs/)
- Review the [troubleshooting guide](#troubleshooting)

---

**Built with ❤️ for modern CRM management**