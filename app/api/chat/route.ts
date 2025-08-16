import { agentManager, type AgentContext } from "@/lib/ai/agent-manager"
import { agentOrchestrator } from "@/lib/ai/agent-orchestrator"
import type { ChatMessage } from "@/types"

export async function POST(req: Request) {
  try {
    const { messages, agentType = "general", sessionId, metadata } = await req.json()

    console.log("[v0] Enhanced Chat API called:", {
      messagesCount: messages?.length,
      agentType,
      sessionId,
    })

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Invalid messages format", { status: 400 })
    }

    if (!sessionId) {
      return new Response("Session ID is required", { status: 400 })
    }

    // Create agent context
    const context: AgentContext = {
      sessionId,
      agentType,
      conversationHistory: messages,
      metadata,
    }

    // Check if agent handoff is needed
    const routing = await agentOrchestrator.routeMessage(messages, agentType, sessionId)

    if (routing.shouldHandoff) {
      console.log("[v0] Agent handoff:", routing)
      context.agentType = routing.agentId

      // Add handoff message to context
      const handoffMessage: ChatMessage = {
        id: `handoff-${Date.now()}`,
        role: "system",
        content: routing.reason || "Transferring to specialist agent",
        timestamp: new Date(),
        metadata: { handoff: true, fromAgent: agentType, toAgent: routing.agentId },
      }

      context.conversationHistory = [...messages, handoffMessage]
    }

    // Process message with appropriate agent
    const result = await agentManager.processMessage(messages, context, true)

    if (result instanceof ReadableStream) {
      return new Response(result, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Agent-Type": context.agentType,
          "X-Session-Id": sessionId,
          ...(routing.shouldHandoff && { "X-Agent-Handoff": "true" }),
        },
      })
    }

    return Response.json(result)
  } catch (error: any) {
    console.error("[v0] Enhanced Chat API error:", error)

    // Categorize errors for better handling
    if (error.message?.includes("API key") || error.message?.includes("authentication")) {
      return new Response("Authentication error - please check API configuration", { status: 401 })
    }

    if (error.message?.includes("rate limit") || error.message?.includes("quota")) {
      return new Response("Service temporarily unavailable - please try again later", { status: 429 })
    }

    if (error.message?.includes("network") || error.message?.includes("fetch") || error.message?.includes("timeout")) {
      return new Response("Network error - please check your connection and try again", { status: 503 })
    }

    return new Response(`Service error: ${error.message || "Unknown error occurred"}`, { status: 500 })
  }
}

// Health check endpoint
export async function GET() {
  try {
    const health = await agentManager.healthCheck()
    const activeAgents = await agentOrchestrator.getActiveAgents()

    return Response.json({
      status: health.status,
      timestamp: new Date().toISOString(),
      models: health.models,
      activeAgents: activeAgents.length,
      agents: activeAgents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        type: agent.type,
        active: agent.active,
      })),
    })
  } catch (error) {
    return Response.json({ status: "error", message: "Health check failed" }, { status: 500 })
  }
}
