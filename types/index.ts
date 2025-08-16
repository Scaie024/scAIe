export interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  status: "Prospect" | "Client" | "Inactive"
  created_at: string
  updated_at: string
}

export interface AgentLog {
  id: string
  agent_type: "sales" | "support" | "planning" | "general"
  action: string
  channel?: "whatsapp" | "telegram" | "email" | "slack" | "web"
  success: boolean
  metadata?: Record<string, any>
  created_at: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  metadata?: {
    agent_type?: string
    channel?: string
    success?: boolean
  }
}

export interface AgentConfig {
  id: string
  name: string
  type: "sales" | "support" | "planning" | "orchestrator"
  description: string
  active: boolean
  capabilities: string[]
  model?: string
}

export interface AnalyticsData {
  totalContacts: number
  totalInteractions: number
  successRate: number
  activeAgents: number
  weeklyActivity: ActivityDataPoint[]
  channelDistribution: ChannelData[]
}

export interface ActivityDataPoint {
  day: string
  interactions: number
  leads: number
}

export interface ChannelData {
  channel: string
  count: number
  percentage: number
}

export interface DatabaseError {
  message: string
  code?: string
  details?: string
}

export interface ApiResponse<T = any> {
  data?: T
  error?: DatabaseError
  success: boolean
}
