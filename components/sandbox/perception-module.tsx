"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Mail, Phone, Slack, Settings } from "lucide-react"

export function PerceptionModule() {
  const [activeChannel, setActiveChannel] = useState("web")
  const [testMessage, setTestMessage] = useState("")

  const channels = [
    { id: "web", name: "Web Chat", icon: MessageSquare, status: "active" },
    { id: "email", name: "Email", icon: Mail, status: "placeholder" },
    { id: "whatsapp", name: "WhatsApp", icon: Phone, status: "placeholder" },
    { id: "slack", name: "Slack", icon: Slack, status: "placeholder" },
  ]

  return (
    <Card className="bg-stone-200 border-gray-500">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Perception Module
        </CardTitle>
        <CardDescription className="text-gray-600">Multi-channel input processing and message routing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Channel Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Input Channels</h3>
          <div className="grid grid-cols-2 gap-3">
            {channels.map((channel) => {
              const Icon = channel.icon
              return (
                <Button
                  key={channel.id}
                  variant={activeChannel === channel.id ? "default" : "outline"}
                  className={`justify-start h-auto p-3 ${
                    activeChannel === channel.id
                      ? "bg-gray-900 text-white"
                      : "bg-white border-gray-300 hover:bg-stone-50"
                  }`}
                  onClick={() => setActiveChannel(channel.id)}
                  disabled={channel.status === "placeholder"}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Icon className="h-4 w-4" />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{channel.name}</div>
                      <Badge variant={channel.status === "active" ? "default" : "secondary"} className="text-xs mt-1">
                        {channel.status === "active" ? "Active" : "Coming Soon"}
                      </Badge>
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Channel Configuration */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Channel Configuration</h3>
          <div className="bg-white border border-gray-300 rounded-lg p-4 space-y-3">
            {activeChannel === "web" && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Webhook URL</label>
                  <Input value="/api/agent/perception" readOnly className="bg-gray-50 border-gray-300 text-gray-600" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Message Format</label>
                  <Textarea
                    value='{"message": "user input", "channel": "web", "metadata": {}}'
                    readOnly
                    className="bg-gray-50 border-gray-300 text-gray-600 text-xs"
                    rows={3}
                  />
                </div>
              </div>
            )}
            {activeChannel !== "web" && (
              <div className="text-center py-6 text-gray-500">
                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  Configuration coming soon for {channels.find((c) => c.id === activeChannel)?.name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Test Input */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Test Input Processing</h3>
          <div className="space-y-3">
            <Textarea
              placeholder="Enter a test message to process..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="bg-white border-gray-300"
              rows={3}
            />
            <Button className="bg-gray-900 hover:bg-gray-800 text-white" disabled={!testMessage.trim()}>
              Process Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
