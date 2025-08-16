import { streamText, generateText } from "ai"
import { qwenModels } from "@/lib/qwen-client"
import { openaiModels } from "@/lib/openai-client"
import { geminiModels } from "@/lib/gemini-client"
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
    streamResponse = false,
  ): Promise<ReadableStream | AgentResponse> {
    const startTime = Date.now()
    const modelConfig = this.selectModel(context)
    const model = modelConfig.model

    // Prepare messages for the AI model
    const preparedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    try {
      if (streamResponse) {
        const result = await streamText({
          model,
          messages: preparedMessages,
          system: this.systemPrompts[context.agentType as keyof typeof this.systemPrompts] || this.systemPrompts.general,
          maxTokens: modelConfig.maxTokens,
          temperature: AI_CONFIG.temperature,
        })

        return result.toAIStream()
      } else {
        const result = await generateText({
          model,
          messages: preparedMessages,
          system: this.systemPrompts[context.agentType as keyof typeof this.systemPrompts] || this.systemPrompts.general,
          maxTokens: modelConfig.maxTokens,
          temperature: AI_CONFIG.temperature,
        })

        return {
          content: result.text,
          success: true,
          agentType: context.agentType,
          processingTime: Date.now() - startTime,
          model: modelConfig.modelId,
        }
      }
    } catch (error: any) {
      console.error("AgentManager error:", error)

      // Log error to database
      await this.logAgentInteraction({
        agent_type: context.agentType,
        action: "process_message",
        channel: "web_chat",
        success: false,
        error: error.message,
        processing_time_ms: Date.now() - startTime,
        metadata: {
          model: modelConfig.modelId,
          messages_count: messages.length,
        },
      })

      // Return error response
      return {
        content: `I apologize, but I encountered an error while processing your request: ${error.message}`,
        success: false,
        agentType: context.agentType,
        processingTime: Date.now() - startTime,
        model: modelConfig.modelId,
        error: error.message,
      }
    }
  }


  // Model selection with priority order
  private selectModel(context: AgentContext) {
    const agentType = context.agentType;
    
    // Try Gemini first, then Qwen, then OpenAI
    const geminiApiKey = process.env.GEMINI_API_KEY
    const qwenApiKey = process.env.QWEN_API_KEY
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (geminiApiKey) {
      // Select appropriate Gemini model based on agent type
      switch (agentType) {
        case "sales":
          return geminiModels["gemini-1.5-pro"]
        case "support":
          return geminiModels["gemini-1.5-pro"]
        case "planning":
          return geminiModels["gemini-1.5-pro"]
        case "scaie":
          return geminiModels["gemini-1.5-flash"]
        default:
          return geminiModels["gemini-1.5-flash"]
      }
    } else if (qwenApiKey) {
      // Select appropriate Qwen model based on agent type
      switch (agentType) {
        case "sales":
          return qwenModels.plus
        case "support":
          return qwenModels.plus
        case "planning":
          return qwenModels.max
        case "scaie":
          return qwenModels.turbo
        default:
          return qwenModels.turbo
      }
    } else if (openaiApiKey) {
      // Select appropriate OpenAI model based on agent type
      // For now, we'll just use GPT-3.5 Turbo as default
      return {
        model: openaiModels["gpt-3.5-turbo"],
        modelId: "gpt-3.5-turbo",
        maxTokens: 4096,
        costPerToken: 0.0002,
        description: "Fast and efficient model for general tasks",
      }
    } else {
      throw new Error("No AI service configured. Please set an API key for Gemini, Qwen, or OpenAI.")
    }
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
    
    // Check Qwen models
    for (const [name, model] of Object.entries(qwenModels)) {
      try {
        await generateText({
          model,
          messages: [{ role: "user", content: "Hello" }],
          maxTokens: 10,
        })
        modelStatus[`qwen-${name}`] = true
      } catch {
        modelStatus[`qwen-${name}`] = false
      }
    }
    
    // Check OpenAI models if API key is configured
    const isOpenAIConfigured = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0;
    if (isOpenAIConfigured) {
      for (const [name, model] of Object.entries(openaiModels)) {
        try {
          await generateText({
            model,
            messages: [{ role: "user", content: "Hello" }],
            maxTokens: 10,
          })
          modelStatus[`openai-${name}`] = true
        } catch {
          modelStatus[`openai-${name}`] = false
        }
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