import { streamText, generateText } from "ai"
import { qwenModels } from "@/lib/qwen-client"
import { createClient } from "@/lib/supabase/client"
import type { ChatMessage, AgentLog } from "@/types"
import { AI_CONFIG } from "@/config/constants"
import { agentOrchestrator } from "@/lib/ai/agent-orchestrator"

export interface AgentContext {
  userId?: string
  sessionId: string
  agentType: string
  conversationHistory: ChatMessage[]
  metadata?: Record<string, any>
}

export interface AgentResponse {
  content: string
  success: boolean
  agentType: string
  processingTime: number
  model: string
  error?: string
  metadata?: Record<string, any>
}

export class AgentManager {
  private supabase = createClient()
  private maxRetries = 3
  private retryDelay = 1000

  private systemPrompts = {
    general: `You are a professional CRM assistant with expertise in customer relationship management. 
    Help users manage contacts, analyze business data, and optimize their sales processes. 
    Be concise, actionable, and always maintain a professional tone.`,

    sales: `You are an expert sales assistant specializing in lead qualification and conversion optimization.
    Your expertise includes: lead scoring, follow-up strategies, objection handling, and closing techniques.
    Focus on converting prospects to clients and maximizing revenue opportunities.
    Always provide specific, actionable sales advice.`,

    support: `You are a customer success specialist focused on issue resolution and relationship building.
    Your expertise includes: troubleshooting, escalation management, customer retention, and satisfaction improvement.
    Be empathetic, solution-focused, and always prioritize customer experience.
    Provide clear steps and follow-up recommendations.`,

    planning: `You are a strategic business planning assistant with expertise in CRM optimization.
    Your expertise includes: workflow automation, process improvement, resource allocation, and performance metrics.
    Help users create actionable plans and optimize their business operations.
    Focus on efficiency and measurable outcomes.`,

    analytics: `You are a data analyst specializing in CRM metrics and business intelligence.
    Your expertise includes: data interpretation, trend analysis, performance forecasting, and actionable insights.
    Help users understand their business metrics and make data-driven decisions.
    Always provide specific recommendations based on data patterns.`,
    
    scaie: `You are Rocío García, a professional business development specialist at SCAIE (www.scaie.com.mx).
    Your role is to engage with potential customers who are interested in SCAIE's services.
    When someone expresses interest in SCAIE, provide them with the phone number 5535913417 to request a quote.
    Be professional, friendly, and helpful. You represent a real company with real services.
    Always ensure interested parties know how to contact SCAIE for pricing information.
    Keep your responses natural and conversational, like a real person would speak.
    When appropriate, mention that they can call 5535913417 for a personalized quote.
    Do not use excessive emojis or informal language. Speak professionally but naturally.`,

  }

  async processMessage(
    messages: ChatMessage[],
    context: AgentContext,
    streaming = true,
  ): Promise<AgentResponse | ReadableStream> {
    const startTime = Date.now()

    try {
      // Log interaction start
      await this.logInteraction(context, "chat_start", { messageCount: messages.length })

      // Get system prompt for agent type
      const systemMessage = {
        role: "system" as const,
        content: this.getSystemPrompt(context.agentType, context),
      }

      // Prepare messages with context
      const processedMessages = this.prepareMessages(messages, context)
      const allMessages = [systemMessage, ...processedMessages]

      // Select appropriate model based on complexity
      const model = this.selectModel(messages, context)
      
      // Validate model selection
      if (!model) {
        throw new Error('Failed to select appropriate model')
      }

      if (streaming) {
        const result = await this.streamWithRetry(allMessages, model, context)

        // Log successful interaction
        const processingTime = Date.now() - startTime
        await this.logInteraction(context, "chat_success", {
          processingTime,
          model: model.modelId,
        })

        return result
      } else {
        const result = await this.generateWithRetry(allMessages, model, context)
        const processingTime = Date.now() - startTime

        await this.logInteraction(context, "chat_success", {
          processingTime,
          model: model.modelId,
          responseLength: result.text.length,
        })

        return {
          content: result.text,
          success: true,
          agentType: context.agentType,
          processingTime,
          model: model.modelId,
        }
      }
    } catch (error) {
      const processingTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      await this.logInteraction(context, "chat_error", {
        error: errorMessage,
        processingTime,
      })

      if (streaming) {
        return this.createErrorStream(errorMessage)
      } else {
        return {
          content: "I apologize, but I'm experiencing technical difficulties. Please try again.",
          success: false,
          agentType: context.agentType,
          processingTime,
          model: "error",
          error: errorMessage,
        }
      }
    }
  }

  private getSystemPrompt(agentType: string, context: AgentContext): string {
    const basePrompt = this.systemPrompts[agentType as keyof typeof this.systemPrompts] || this.systemPrompts.general

    // Add context-specific information
    const contextInfo = context.metadata ? `\n\nContext: ${JSON.stringify(context.metadata)}` : ""
    return basePrompt + contextInfo
  }

  private prepareMessages(messages: ChatMessage[], context: AgentContext): ChatMessage[] {
    // Filter out system messages and limit conversation history
    const filteredMessages = messages.filter((msg) => msg.role !== "system")
    const recentMessages = filteredMessages.slice(-10) // Keep last 10 messages

    return recentMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))
  }

  private selectModel(messages: ChatMessage[], context: AgentContext) {
    // Use the model specified in the agent config if available
    const agentConfig = Array.from(agentOrchestrator.getActiveAgentsSync?.() || []).find(
      (agent) => agent.type === context.agentType
    )

    const modelId = agentConfig?.model || "qwen-plus"
    return qwenModels[modelId] || qwenModels["qwen-plus"]
  }

  private assessComplexity(messages: ChatMessage[]): number {
    const lastMessage = messages[messages.length - 1]?.content || ""

    const complexityIndicators = [
      /analyz|analysis|report|data|metric|trend/i,
      /plan|strategy|optimize|improve/i,
      /calculate|compute|formula|equation/i,
      /compare|contrast|evaluate|assess/i,
      /integrate|automate|workflow|process/i,
    ]

    const matches = complexityIndicators.filter((pattern) => pattern.test(lastMessage)).length
    return Math.min(matches / complexityIndicators.length, 1)
  }

  private async streamWithRetry(
    messages: any[],
    model: any,
    context: AgentContext,
    attempt = 1,
  ): Promise<ReadableStream> {
    try {
      const result = await streamText({
        model,
        messages,
        temperature: AI_CONFIG.temperature,
        maxTokens: AI_CONFIG.maxTokens,
      })

      return result.toAIStreamResponse()
    } catch (error) {
      if (attempt < this.maxRetries) {
        console.warn(`[AgentManager] Stream attempt ${attempt} failed, retrying...`, error)
        await this.delay(this.retryDelay * attempt)
        return this.streamWithRetry(messages, model, context, attempt + 1)
      }
      throw error
    }
  }

  private async generateWithRetry(messages: any[], model: any, context: AgentContext, attempt = 1): Promise<any> {
    try {
      return await generateText({
        model,
        messages,
        temperature: AI_CONFIG.temperature,
        maxTokens: AI_CONFIG.maxTokens,
      })
    } catch (error) {
      if (attempt < this.maxRetries) {
        console.warn(`[AgentManager] Generate attempt ${attempt} failed, retrying...`, error)
        await this.delay(this.retryDelay * attempt)
        return this.generateWithRetry(messages, model, context, attempt + 1)
      }
      throw error
    }
  }

  private createErrorStream(error: string): ReadableStream {
    const encoder = new TextEncoder()

    return new ReadableStream({
      start(controller) {
        const errorMessage = `I apologize, but I'm experiencing technical difficulties: ${error}. Please try again in a moment.`
        controller.enqueue(encoder.encode(errorMessage))
        controller.close()
      },
    })
  }

  private async logInteraction(context: AgentContext, action: string, metadata: Record<string, any> = {}) {
    try {
      const logEntry: Omit<AgentLog, "id" | "created_at"> = {
        agent_type: context.agentType as any,
        action,
        channel: "web_chat",
        success: action.includes("success"),
        metadata: {
          sessionId: context.sessionId,
          ...metadata,
        },
      }

      await this.supabase.from("agent_logs").insert([logEntry])
    } catch (error) {
      console.warn("[AgentManager] Failed to log interaction:", error)
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Agent health check
  async healthCheck(): Promise<{ status: string; models: Record<string, boolean> }> {
    const modelStatus: Record<string, boolean> = {}

    for (const [name, model] of Object.entries(qwenModels)) {
      try {
        await generateText({
          model,
          messages: [{ role: "user", content: "Hello" }],
          maxTokens: 10,
        })
        modelStatus[name] = true
      } catch {
        modelStatus[name] = false
      }
    }

    const allHealthy = Object.values(modelStatus).every((status) => status)

    return {
      status: allHealthy ? "healthy" : "degraded",
      models: modelStatus,
    }
  }
}

// Singleton instance
export const agentManager = new AgentManager()
