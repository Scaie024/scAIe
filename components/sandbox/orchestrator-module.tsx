"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Crown, Users, ArrowRight, Plus, Settings } from "lucide-react"

export function OrchestratorModule() {
  const [selectedAgent, setSelectedAgent] = useState("")

  const agents = [
    {
      id: "sales-agent",
      name: "Sales Agent",
      description: "Lead qualification and conversion",
      status: "active",
      tasks: ["Qualify leads", "Schedule demos", "Follow up prospects"],
    },
    {
      id: "support-agent",
      name: "Support Agent",
      description: "Customer service and issue resolution",
      status: "active",
      tasks: ["Answer queries", "Resolve issues", "Escalate complex cases"],
    },
    {
      id: "scaie-agent",
      name: "SCAIE Specialist",
      description: "Handles SCAIE inquiries and quote requests",
      status: "active",
      tasks: ["Process quote requests", "Provide company information", "Direct to phone contact"],
    },
    {
      id: "planning-agent",
      name: "Planning Agent",
      description: "Task coordination and workflow management",
      status: "draft",
      tasks: ["Coordinate tasks", "Manage workflows", "Optimize processes"],
    },
  ]

  const handoffRules = [
    {
      from: "Sales Agent",
      to: "Support Agent",
      condition: "Customer has technical questions",
      priority: "high",
    },
    {
      from: "Support Agent",
      to: "Sales Agent",
      condition: "Customer shows upgrade interest",
      priority: "medium",
    },
    {
      from: "Any Agent",
      to: "Planning Agent",
      condition: "Complex multi-step task required",
      priority: "low",
    },
  ]

  return (
    <Card className="bg-stone-200 border-gray-500">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Orchestrator Module
        </CardTitle>
        <CardDescription className="text-gray-600">
          Multi-agent coordination and task handoff management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Agent Management */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Sub-Agents</h3>
            <Button size="sm" variant="outline" className="bg-white border-gray-300 hover:bg-stone-50">
              <Plus className="h-4 w-4 mr-1" />
              Create Agent
            </Button>
          </div>
          <div className="space-y-2">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-white border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-gray-600" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{agent.name}</h4>
                      <p className="text-xs text-gray-600">{agent.description}</p>
                    </div>
                  </div>
                  <Badge variant={agent.status === "active" ? "default" : "secondary"}>{agent.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {agent.tasks.map((task, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {task}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="bg-white border-gray-300 hover:bg-stone-50">
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                    disabled={agent.status !== "active"}
                  >
                    Test Agent
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Handoff Rules */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Handoff Rules</h3>
          <div className="space-y-2">
            {handoffRules.map((rule, index) => (
              <div key={index} className="bg-white border border-gray-300 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {rule.from}
                  </Badge>
                  <ArrowRight className="h-3 w-3 text-gray-500" />
                  <Badge variant="outline" className="text-xs">
                    {rule.to}
                  </Badge>
                  <Badge
                    variant={
                      rule.priority === "high" ? "destructive" : rule.priority === "medium" ? "default" : "secondary"
                    }
                    className="text-xs ml-auto"
                  >
                    {rule.priority}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">{rule.condition}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Task Assignment */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Manual Task Assignment</h3>
          <div className="bg-white border border-gray-300 rounded-lg p-4 space-y-3">
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="Select agent for task" />
              </SelectTrigger>
              <SelectContent>
                {agents
                  .filter((a) => a.status === "active")
                  .map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white" disabled={!selectedAgent}>
              Assign Current Task
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
