# API Documentation

This document provides comprehensive information about the CRM Admin System API endpoints.

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Authentication

The system currently operates without authentication for simplicity. In production, you may want to implement:

- API key authentication
- JWT tokens
- OAuth 2.0

## Endpoints

### Chat API

#### POST /api/chat

Process messages with AI agents and return streaming or static responses.

**Request Body:**
\`\`\`json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, I need help with my contacts"
    }
  ],
  "agentType": "sales",
  "sessionId": "unique-session-id",
  "metadata": {
    "contactCount": 150,
    "recentActivity": "Added 5 new prospects today"
  }
}
\`\`\`

**Parameters:**
- `messages` (required): Array of chat messages
- `agentType` (optional): Type of agent ("sales", "support", "analytics", "planning", "general")
- `sessionId` (required): Unique session identifier
- `metadata` (optional): Additional context for the agent

**Response (Streaming):**
\`\`\`
Content-Type: text/plain; charset=utf-8
X-Agent-Type: sales
X-Session-Id: unique-session-id

Hello! I'd be happy to help you manage your contacts...
\`\`\`

**Response (JSON):**
\`\`\`json
{
  "content": "Hello! I'd be happy to help you manage your contacts...",
  "success": true,
  "agentType": "sales",
  "processingTime": 1250,
  "model": "qwen-turbo"
}
\`\`\`

**Error Responses:**
- `400`: Invalid request format
- `401`: Authentication error
- `429`: Rate limit exceeded
- `503`: Service unavailable

#### GET /api/chat

Health check endpoint for the AI system.

**Response:**
\`\`\`json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "models": {
    "turbo": true,
    "plus": true,
    "max": true
  },
  "activeAgents": 3,
  "agents": [
    {
      "id": "sales-001",
      "name": "Sales Specialist",
      "type": "sales",
      "active": true
    }
  ]
}
\`\`\`

## Agent Types

### Sales Agent
- **Purpose**: Lead qualification and conversion
- **Capabilities**: Lead scoring, objection handling, closing techniques
- **Best for**: Prospect management, deal closing, sales strategy

### Support Agent
- **Purpose**: Customer service and issue resolution
- **Capabilities**: Issue resolution, escalation management, retention strategies
- **Best for**: Customer problems, technical support, satisfaction improvement

### Analytics Agent
- **Purpose**: Data analysis and business intelligence
- **Capabilities**: Data analysis, trend forecasting, process optimization
- **Best for**: Performance metrics, business insights, reporting

### Planning Agent
- **Purpose**: Strategic planning and optimization
- **Capabilities**: Workflow automation, process improvement, resource allocation
- **Best for**: Business planning, process optimization, strategic decisions

### General Agent
- **Purpose**: General CRM assistance
- **Capabilities**: Contact management, basic queries, system navigation
- **Best for**: General questions, system help, basic operations

## Agent Handoffs

The system automatically routes messages to the most appropriate agent based on content analysis.

**Handoff Triggers:**
- Intent analysis (sales, support, analytics keywords)
- Complexity assessment
- Agent capability matching
- User explicit requests

**Handoff Response Headers:**
\`\`\`
X-Agent-Handoff: true
X-Previous-Agent: general
X-Current-Agent: sales
\`\`\`

## Error Handling

### Error Categories

1. **Authentication Errors (401)**
   \`\`\`json
   {
     "error": "Authentication error - please check API configuration",
     "code": "AUTH_ERROR"
   }
   \`\`\`

2. **Rate Limit Errors (429)**
   \`\`\`json
   {
     "error": "Service temporarily unavailable - please try again later",
     "code": "RATE_LIMIT",
     "retryAfter": 60
   }
   \`\`\`

3. **Network Errors (503)**
   \`\`\`json
   {
     "error": "Network error - please check your connection and try again",
     "code": "NETWORK_ERROR"
   }
   \`\`\`

4. **Service Errors (500)**
   \`\`\`json
   {
     "error": "Service error: Model timeout",
     "code": "SERVICE_ERROR"
   }
   \`\`\`

### Retry Logic

The system implements automatic retries with exponential backoff:

- **Max Retries**: 3
- **Base Delay**: 1000ms
- **Backoff Multiplier**: 2x
- **Max Delay**: 8000ms

## Rate Limiting

Current rate limits (per IP):
- **Chat API**: 60 requests per minute
- **Health Check**: 10 requests per minute

Rate limit headers:
\`\`\`
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642248000
\`\`\`

## Model Selection

The system automatically selects the optimal model based on:

1. **Message Complexity**: Keyword analysis and intent detection
2. **Token Count**: Length of conversation history
3. **Agent Type**: Specialized models for different agents

**Model Hierarchy:**
- **qwen-turbo**: Fast responses (&lt; 1500 tokens, low complexity)
- **qwen-plus**: Balanced performance (1500-3000 tokens, medium complexity)
- **qwen-max**: Advanced reasoning (> 3000 tokens, high complexity)

## Logging and Analytics

All interactions are logged to the database for analytics:

\`\`\`sql
-- agent_logs table structure
CREATE TABLE agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL,
  action TEXT NOT NULL,
  channel TEXT DEFAULT 'web_chat',
  success BOOLEAN NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Logged Data:**
- Agent type and action
- Success/failure status
- Processing time
- Model used
- Session information
- Error details (if any)

## WebSocket Support (Future)

Planned WebSocket endpoint for real-time communication:

\`\`\`javascript
// Future implementation
const ws = new WebSocket('ws://localhost:3000/api/chat/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Agent response:', data);
};

ws.send(JSON.stringify({
  type: 'message',
  content: 'Hello',
  sessionId: 'session-123'
}));
\`\`\`

## SDK and Client Libraries

### JavaScript/TypeScript Client

\`\`\`typescript
import { CRMClient } from '@crm-admin/client';

const client = new CRMClient({
  baseURL: 'http://localhost:3000/api',
  timeout: 30000
});

// Send message
const response = await client.chat.send({
  messages: [{ role: 'user', content: 'Hello' }],
  agentType: 'sales',
  sessionId: 'session-123'
});

// Stream response
const stream = await client.chat.stream({
  messages: [{ role: 'user', content: 'Hello' }],
  sessionId: 'session-123'
});

for await (const chunk of stream) {
  console.log(chunk);
}
\`\`\`

### Python Client

```python
import asyncio
from crm_admin_client import CRMClient

client = CRMClient(base_url="http://localhost:3000/api")

async def chat_example():
    response = await client.chat.send(
        messages=[{"role": "user", "content": "Hello"}],
        agent_type="sales",
        session_id="session-123"
    )
    print(response.content)

asyncio.run(chat_example())
