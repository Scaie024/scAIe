import type { ChatMessage, AgentConfig } from "@/types"
import { createClient } from "@/lib/supabase/client"

export interface TaskHandoff {
  fromAgent: string
  toAgent: string
  reason: string
  context: Record<string, any>
  priority: "low" | "medium" | "high"
}

export class AgentOrchestrator {
  private supabase = createClient()
  private activeAgents = new Map<string, AgentConfig>()

  constructor() {
    this.initializeAgents()
  }

  private initializeAgents() {
    const defaultAgents: AgentConfig[] = [
      {
        id: "sales-001",
        name: "Sales Specialist",
        type: "sales",
        description: "Expert in lead qualification and conversion",
        active: true,
        capabilities: ["lead_scoring", "objection_handling", "closing_techniques"],
        model: "qwen-plus",
      },
      {
        id: "support-001",
        name: "Customer Success",
        type: "support",
        description: "Focused on customer satisfaction and retention",
        active: true,
        capabilities: ["issue_resolution", "escalation_management", "retention_strategies"],
        model: "qwen-turbo",
      },
      {
        id: "analytics-001",
        name: "Data Analyst",
        type: "planning",
        description: "Business intelligence and process optimization",
        active: true,
        capabilities: ["data_analysis", "trend_forecasting", "process_optimization"],
        model: "qwen-max",
      },
      {
        id: "scaie-001",
        name: "SCAIE Specialist",
        type: "scaie",
        description: "Handles inquiries for SCAIE services and quote requests",
        active: true,
        capabilities: ["lead_generation", "quote_requests", "customer_engagement"],
        model: "qwen-turbo",
      },
    ]

    defaultAgents.forEach((agent) => {
      this.activeAgents.set(agent.id, agent)
    })
  }

  async routeMessage(
    messages: ChatMessage[],
    currentAgent: string,
    sessionId: string,
  ): Promise<{ agentId: string; shouldHandoff: boolean; reason?: string }> {
    const lastMessage = messages[messages.length - 1]?.content || ""

    // Analyze message intent
    const intent = await this.analyzeIntent(lastMessage)

    // Determine if handoff is needed
    const currentAgentConfig = this.activeAgents.get(currentAgent)
    if (!currentAgentConfig) {
      return { agentId: "sales-001", shouldHandoff: true, reason: "Invalid current agent" }
    }

    // Check if current agent can handle the request
    const canHandle = this.canAgentHandle(currentAgentConfig, intent)

    if (canHandle) {
      return { agentId: currentAgent, shouldHandoff: false }
    }

    // Find best agent for the task
    const bestAgent = this.findBestAgent(intent)

    if (bestAgent && bestAgent.id !== currentAgent) {
      await this.logHandoff({
        fromAgent: currentAgent,
        toAgent: bestAgent.id,
        reason: `Intent requires ${intent.category} expertise`,
        context: { intent, sessionId },
        priority: intent.urgency as any,
      })

      return {
        agentId: bestAgent.id,
        shouldHandoff: true,
        reason: `Transferring to ${bestAgent.name} for ${intent.category} expertise`,
      }
    }

    return { agentId: currentAgent, shouldHandoff: false }
  }

  private async analyzeIntent(message: string): Promise<{
    category: string
    confidence: number
    urgency: string
    keywords: string[]
  }> {
    const patterns = {
      sales: {
        keywords: ["lead", "prospect", "quote", "price", "buy", "purchase", "deal", "close", "cost"],
        urgency: "medium",
      },
      support: {
        keywords: ["problem", "issue", "error", "help", "broken", "not working", "urgent", "bug", "fix"],
        urgency: "high",
      },
      analytics: {
        keywords: ["report", "data", "analysis", "metrics", "dashboard", "trend", "performance", "statistics"],
        urgency: "low",
      },
      scaie: {
        keywords: ["scaie", "www.scaie.com.mx", "quote", "pricing", "services", "company", "information", "5535913417"],
        urgency: "medium",
      },
    }

    let bestMatch = { category: "general", confidence: 0, urgency: "low", keywords: [] as string[] }

    for (const [category, config] of Object.entries(patterns)) {
      const matches = config.keywords.filter((keyword) => 
        message.toLowerCase().includes(keyword.toLowerCase())
      )

      const confidence = matches.length / config.keywords.length

      if (confidence > bestMatch.confidence) {
        bestMatch = {
          category,
          confidence,
          urgency: config.urgency,
          keywords: matches,
        }
      }
    }

    // Special case for SCAIE - even low confidence should route to SCAIE agent if relevant
    const isScaieRelated = message.toLowerCase().includes('scaie') || 
                          message.toLowerCase().includes('5535913417') ||
                          message.toLowerCase().includes('www.scaie.com.mx');
    
    if (isScaieRelated && bestMatch.category !== "scaie") {
      bestMatch = {
        category: "scaie",
        confidence: 0.6, // Set a moderate confidence
        urgency: "medium",
        keywords: ["scaie"],
      };
    }

    return bestMatch
  }

  private canAgentHandle(agent: AgentConfig, intent: any): boolean {
    if (intent.confidence < 0.3) return true // Low confidence, current agent can try

    const agentCapabilities = {
      sales: ["lead_scoring", "objection_handling", "closing_techniques"],
      support: ["issue_resolution", "escalation_management", "retention_strategies"],
      planning: ["data_analysis", "trend_forecasting", "process_optimization"],
    }

    const requiredCapabilities = agentCapabilities[intent.category as keyof typeof agentCapabilities] || []

    return requiredCapabilities.some((capability) => agent.capabilities.includes(capability))
  }

  private findBestAgent(intent: any): AgentConfig | null {
    const agentsByType = Array.from(this.activeAgents.values()).filter(
      (agent) => agent.active && agent.type === intent.category,
    )

    if (agentsByType.length === 0) {
      // Fallback to any active agent
      return Array.from(this.activeAgents.values()).find((agent) => agent.active) || null
    }

    // Return the first matching agent (could be enhanced with load balancing)
    return agentsByType[0]
  }

  private async logHandoff(handoff: TaskHandoff) {
    try {
      await this.supabase.from("agent_logs").insert([
        {
          agent_type: "orchestrator",
          action: "task_handoff",
          channel: "internal",
          success: true,
          metadata: handoff,
        },
      ])
    } catch (error) {
      console.warn("[AgentOrchestrator] Failed to log handoff:", error)
    }
  }

  async getActiveAgents(): Promise<AgentConfig[]> {
    return Array.from(this.activeAgents.values()).filter((agent) => agent.active)
  }
  
  getActiveAgentsSync(): AgentConfig[] {
    return Array.from(this.activeAgents.values()).filter((agent) => agent.active)
  }

  async updateAgentStatus(agentId: string, active: boolean): Promise<boolean> {
    const agent = this.activeAgents.get(agentId)
    if (agent) {
      agent.active = active
      return true
    }
    return false
  }
}

export const agentOrchestrator = new AgentOrchestrator()
