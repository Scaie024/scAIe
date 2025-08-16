"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Star, Bot, AlertCircle } from "lucide-react"

export function ChatPreview() {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "user",
      content: "Hi, I'm interested in your CRM solution",
      timestamp: "10:30 AM",
    },
    {
      id: 2,
      type: "agent",
      content:
        "Hello! I'd be happy to help you learn about our CRM. Could you share your name and email so I can provide personalized information?",
      timestamp: "10:30 AM",
      agent: "Sales Agent",
      action: "Lead qualification initiated",
    },
    {
      id: 3,
      type: "user",
      content: "Sure, I'm John Smith from TechCorp. My email is john@techcorp.com",
      timestamp: "10:31 AM",
    },
    {
      id: 4,
      type: "agent",
      content:
        "Thank you John! I've registered you in our system. Based on TechCorp's size, I think our Enterprise plan would be perfect. Would you like to schedule a demo?",
      timestamp: "10:31 AM",
      agent: "Sales Agent",
      action: "Contact created in database",
    },
    {
      id: 5,
      type: "handoff",
      content: "Task handed off to Support Agent for technical questions",
      timestamp: "10:32 AM",
      from: "Sales Agent",
      to: "Support Agent",
    },
  ])

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return

    const newMessage = {
      id: messages.length + 1,
      type: "user" as const,
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, newMessage])
    setMessage("")
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Sending message to chat API")

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: newMessage.content }],
          agentType: "general",
        }),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] API error response:", errorText)
        throw new Error(errorText || `HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let aiResponse = ""

      if (reader) {
        console.log("[v0] Starting to read stream")
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            console.log("[v0] Stream reading completed")
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const data = JSON.parse(line.slice(2))
                if (data.content) {
                  aiResponse += data.content
                }
              } catch (parseError) {
                console.warn("[v0] Failed to parse stream line:", line)
              }
            }
          }
        }
      }

      console.log("[v0] Final AI response:", aiResponse)

      const agentResponse = {
        id: messages.length + 2,
        type: "agent" as const,
        content: aiResponse || "I understand your question. Let me help you with that.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        agent: "Qwen AI Agent",
        action: "Processed with Qwen AI",
      }

      setMessages((prev) => [...prev, agentResponse])
    } catch (error: any) {
      console.error("[v0] Chat error:", error)
      setError(error.message || "Failed to get response")

      const errorResponse = {
        id: messages.length + 2,
        type: "agent" as const,
        content: "I apologize, but I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        agent: "System",
        action: "Error occurred",
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-stone-200 border-gray-500 h-fit">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Qwen AI Chat Preview
        </CardTitle>
        <CardDescription className="text-gray-600">
          Test Qwen AI integration and multi-agent interactions
        </CardDescription>
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <div className="bg-white border border-gray-300 rounded-lg p-4 h-96 overflow-y-auto space-y-3">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.type === "user" && (
                <div className="flex justify-end">
                  <div className="bg-gray-900 text-white rounded-lg p-3 max-w-xs">
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                  </div>
                </div>
              )}

              {msg.type === "agent" && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {msg.agent}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-900">{msg.content}</p>
                    <p className="text-xs text-gray-600 mt-1">{msg.timestamp}</p>
                    {msg.action && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">Action: {msg.action}</div>
                    )}
                  </div>
                </div>
              )}

              {msg.type === "handoff" && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                    <Badge variant="outline" className="text-xs">
                      {msg.from}
                    </Badge>
                    <span className="text-xs">→</span>
                    <Badge variant="outline" className="text-xs">
                      {msg.to}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{msg.content}</p>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    Qwen AI Agent
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <p className="text-sm text-gray-600">Thinking...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Test message with Qwen AI..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
            className="flex-1 bg-white border-gray-300"
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} className="bg-gray-900 hover:bg-gray-800 text-white" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Feedback */}
        <div className="space-y-2">
          <p className="text-xs text-gray-600">Rate this interaction:</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                size="sm"
                variant="outline"
                className="w-8 h-8 p-0 bg-white border-gray-300 hover:bg-yellow-50"
              >
                <Star className="h-3 w-3" />
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
