export const APP_CONFIG = {
  name: "CRM Admin System",
  version: "2.0.0",
  description: "Modern CRM Admin Interface with AI Agent Capabilities",
  author: "CRM Admin Team",
} as const

export const DATABASE_CONFIG = {
  tables: {
    CONTACTS: "contacts",
    AGENT_LOGS: "agent_logs",
  },
  maxRetries: 3,
  timeout: 10000,
} as const

export const AI_CONFIG = {
  models: {
    QWEN: "qwen-turbo",
    FALLBACK: "gpt-3.5-turbo",
  },
  maxTokens: 2000,
  temperature: 0.7,
  streamTimeout: 30000,
} as const

export const UI_CONFIG = {
  colors: {
    primary: "stone",
    accent: "gray",
    success: "green",
    error: "red",
    warning: "yellow",
  },
  animations: {
    duration: 200,
    easing: "ease-in-out",
  },
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
  },
} as const

export const AGENT_TYPES = [
  { id: "sales", name: "Sales Agent", icon: "TrendingUp" },
  { id: "support", name: "Support Agent", icon: "HeadphonesIcon" },
  { id: "planning", name: "Planning Agent", icon: "Calendar" },
  { id: "orchestrator", name: "Orchestrator", icon: "Settings" },
  { id: "scaie", name: "SCAIE Specialist", icon: "Briefcase" },
] as const

export const CONTACT_STATUSES = [
  { value: "Prospect", label: "Prospect", color: "blue" },
  { value: "Client", label: "Client", color: "green" },
  { value: "Inactive", label: "Inactive", color: "gray" },
] as const

export const COMMUNICATION_CHANNELS = [
  { value: "whatsapp", label: "WhatsApp", icon: "MessageCircle" },
  { value: "telegram", label: "Telegram", icon: "Send" },
  { value: "email", label: "Email", icon: "Mail" },
  { value: "slack", label: "Slack", icon: "Hash" },
  { value: "web", label: "Web Chat", icon: "Globe" },
] as const
