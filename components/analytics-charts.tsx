"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useMemo } from "react"

interface AgentLog {
  id: string
  agent_type: string
  action: string
  success: boolean
  response_time_ms: number | null
  channel: string
  created_at: string
}

interface AnalyticsChartsProps {
  logs: AgentLog[]
}

const COLORS = ["#374151", "#6B7280", "#9CA3AF", "#D1D5DB"]

export function AnalyticsCharts({ logs }: AnalyticsChartsProps) {
  // Process data for activity chart (last 7 days)
  const activityData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split("T")[0]
    })

    return last7Days.map((date) => {
      const dayLogs = logs.filter((log) => log.created_at.startsWith(date))
      const successful = dayLogs.filter((log) => log.success).length
      const failed = dayLogs.filter((log) => !log.success).length

      return {
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        successful,
        failed,
        total: successful + failed,
      }
    })
  }, [logs])

  // Process data for channel distribution
  const channelData = useMemo(() => {
    const channelCounts = logs.reduce(
      (acc, log) => {
        acc[log.channel] = (acc[log.channel] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(channelCounts).map(([channel, count]) => ({
      channel: channel.charAt(0).toUpperCase() + channel.slice(1),
      count,
      percentage: ((count / logs.length) * 100).toFixed(1),
    }))
  }, [logs])

  return (
    <>
      <Card className="bg-stone-200 border-gray-500">
        <CardHeader>
          <CardTitle className="text-gray-900">Agent Activity (Last 7 Days)</CardTitle>
          <CardDescription className="text-gray-600">Daily interaction volume and success rate</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#9CA3AF" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#F5F5F4",
                  border: "1px solid #6B7280",
                  borderRadius: "6px",
                }}
              />
              <Line type="monotone" dataKey="successful" stroke="#374151" strokeWidth={2} name="Successful" />
              <Line type="monotone" dataKey="failed" stroke="#9CA3AF" strokeWidth={2} name="Failed" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-stone-200 border-gray-500">
        <CardHeader>
          <CardTitle className="text-gray-900">Channel Distribution</CardTitle>
          <CardDescription className="text-gray-600">Interaction volume by communication channel</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={channelData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ channel, percentage }) => `${channel} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {channelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#F5F5F4",
                  border: "1px solid #6B7280",
                  borderRadius: "6px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  )
}
