"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GitBranch, Play, Plus, Settings } from "lucide-react"

export function PlanningModule() {
  const [selectedFlow, setSelectedFlow] = useState("lead-qualification")

  const flows = [
    {
      id: "lead-qualification",
      name: "Lead Qualification",
      description: "Qualify incoming leads and route to appropriate agent",
      status: "active",
      steps: ["Extract Info", "Validate Data", "Score Lead", "Route to Agent"],
    },
    {
      id: "customer-support",
      name: "Customer Support",
      description: "Handle customer inquiries and escalations",
      status: "draft",
      steps: ["Categorize Issue", "Check Knowledge Base", "Provide Solution", "Escalate if Needed"],
    },
    {
      id: "follow-up",
      name: "Follow-up Automation",
      description: "Automated follow-up sequences for prospects",
      status: "active",
      steps: ["Check Last Contact", "Generate Message", "Send Follow-up", "Schedule Next"],
    },
  ]

  return (
    <Card className="bg-stone-200 border-gray-500">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Planning Module
        </CardTitle>
        <CardDescription className="text-gray-600">LangGraph workflow orchestration and decision trees</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Flow Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Workflow Graphs</h3>
            <Button size="sm" variant="outline" className="bg-white border-gray-300 hover:bg-stone-50">
              <Plus className="h-4 w-4 mr-1" />
              New Flow
            </Button>
          </div>
          <div className="space-y-2">
            {flows.map((flow) => (
              <div
                key={flow.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedFlow === flow.id
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white border-gray-300 hover:bg-stone-50"
                }`}
                onClick={() => setSelectedFlow(flow.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium">{flow.name}</h4>
                  <Badge
                    variant={flow.status === "active" ? "default" : "secondary"}
                    className={selectedFlow === flow.id ? "bg-white text-gray-900" : ""}
                  >
                    {flow.status}
                  </Badge>
                </div>
                <p className={`text-xs ${selectedFlow === flow.id ? "text-gray-200" : "text-gray-600"}`}>
                  {flow.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Flow Visualization */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Flow Visualization</h3>
          <div className="bg-white border border-gray-300 rounded-lg p-4">
            <div className="space-y-3">
              {flows
                .find((f) => f.id === selectedFlow)
                ?.steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{step}</div>
                    </div>
                    {index < flows.find((f) => f.id === selectedFlow)!.steps.length - 1 && (
                      <div className="w-px h-6 bg-gray-300 ml-4"></div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Flow Controls */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Flow Controls</h3>
          <div className="flex gap-2">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Play className="h-4 w-4 mr-2" />
              Test Flow
            </Button>
            <Button variant="outline" className="bg-white border-gray-300 hover:bg-stone-50">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
