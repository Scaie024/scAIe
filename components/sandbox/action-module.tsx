"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Zap, Database, Mail, ExternalLink, TestTube } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ActionModule() {
  const [testEmail, setTestEmail] = useState("")
  const [testMessage, setTestMessage] = useState("")
  const { toast } = useToast()

  const actions = [
    {
      id: "db-crud",
      name: "Database Operations",
      description: "Create, read, update, delete contacts",
      icon: Database,
      status: "active",
    },
    {
      id: "email-send",
      name: "Email Sending",
      description: "Send automated emails via Nodemailer",
      icon: Mail,
      status: "placeholder",
    },
    {
      id: "api-calls",
      name: "External APIs",
      description: "Integration with third-party services",
      icon: ExternalLink,
      status: "placeholder",
    },
  ]

  const handleTestAction = async (actionId: string) => {
    switch (actionId) {
      case "db-crud":
        toast({
          title: "Database Test",
          description: "Successfully connected to Supabase database",
        })
        break
      case "email-send":
        toast({
          title: "Email Test",
          description: "Email sending feature coming soon",
        })
        break
      case "api-calls":
        toast({
          title: "API Test",
          description: "External API integration coming soon",
        })
        break
    }
  }

  return (
    <Card className="bg-stone-200 border-gray-500">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Action Module
        </CardTitle>
        <CardDescription className="text-gray-600">Execute actions and integrate with external systems</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Available Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Available Actions</h3>
          <div className="space-y-3">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <div key={action.id} className="bg-white border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{action.name}</h4>
                        <p className="text-xs text-gray-600">{action.description}</p>
                      </div>
                    </div>
                    <Badge variant={action.status === "active" ? "default" : "secondary"}>
                      {action.status === "active" ? "Active" : "Coming Soon"}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleTestAction(action.id)}
                    disabled={action.status !== "active"}
                    className="bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-300"
                  >
                    <TestTube className="h-4 w-4 mr-1" />
                    Test Action
                  </Button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Database Operations Test */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Database Operations Test</h3>
          <div className="bg-white border border-gray-300 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Test Name" className="bg-white border-gray-300" />
              <Input placeholder="test@example.com" type="email" className="bg-white border-gray-300" />
            </div>
            <Input placeholder="Test Company" className="bg-white border-gray-300" />
            <Button className="bg-gray-900 hover:bg-gray-800 text-white" onClick={() => handleTestAction("db-crud")}>
              Create Test Contact
            </Button>
          </div>
        </div>

        {/* Email Test */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Email Sending Test</h3>
          <div className="bg-white border border-gray-300 rounded-lg p-4 space-y-3">
            <Input
              placeholder="recipient@example.com"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="bg-white border-gray-300"
            />
            <Textarea
              placeholder="Test email message..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="bg-white border-gray-300"
              rows={3}
            />
            <Button disabled className="bg-gray-300 text-gray-500 cursor-not-allowed">
              Send Test Email (Coming Soon)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
