"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Send, User, Phone } from "lucide-react"
import type { ChatMessage } from "@/types"
import { agentManager, type AgentContext } from "@/lib/ai/agent-manager"
import { agentOrchestrator } from "@/lib/ai/agent-orchestrator"

export function ChatPreview() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your CRM assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<null | HTMLDivElement>(null)
  const sessionId = useRef<string>(`session_${Date.now()}`)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Create context for the agent
      const context: AgentContext = {
        sessionId: sessionId.current,
        agentType: "general",
        conversationHistory: [...messages, userMessage],
      }

      // Let the orchestrator decide which agent to use
      const routing = await agentOrchestrator.routeMessage(
        [...messages, userMessage],
        "general",
        sessionId.current
      )

      if (routing.shouldHandoff) {
        // Extract agent type from agent ID (e.g., "scaie-001" -> "scaie")
        const agentType = routing.agentId.split('-')[0];
        context.agentType = agentType;
      }

      // Process message with the agent manager
      const result = await agentManager.processMessage(
        [...messages, userMessage],
        context,
        false
      ) as any

      let response = "";
      
      if (result && result.content) {
        response = result.content
      } else {
        // Fallback response if something goes wrong
        response = "Thank you for your inquiry. For specific information about SCAIE services, please contact us at 5535913417."
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        metadata: {
          agent_type: context.agentType,
        }
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble processing your request. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Add a test function to simulate SCAIE-related query
  const testScaieQuery = () => {
    setInput("I'm interested in SCAIE services, how can I get a quote?")
  }

  return (
    <Card className="bg-stone-200 border-gray-500">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Chat Preview
        </CardTitle>
        <CardDescription className="text-gray-600">
          Test the multi-agent conversation system
        </CardDescription>
        <Button onClick={testScaieQuery} size="sm" className="w-fit">
          Test SCAIE Query
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 h-80 overflow-y-auto p-4 bg-white rounded-lg border border-gray-300">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex gap-2 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === "user" ? "bg-gray-900" : "bg-stone-200 border border-gray-300"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-gray-900 text-white"
                      : "bg-stone-100 border border-gray-300 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.role === "assistant" && message.content.includes("5535913417") && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Call 5535913417 for a quote</span>
                    </div>
                  )}
                  {message.metadata?.agent_type && (
                    <div className="mt-1 text-xs text-gray-500">
                      Agent: {message.metadata.agent_type}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-stone-200 border border-gray-300">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-stone-100 border border-gray-300 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="bg-white border-gray-300"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            className="bg-gray-900 hover:bg-gray-800 text-white"
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}