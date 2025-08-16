import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { AgentLogsTable } from "@/components/agent-logs-table"
import { Activity, CheckCircle, Clock, TrendingUp } from "lucide-react"

export default async function AnalyticsPage() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = createClient()

  // Fetch analytics data
  const { data: logs, error: logsError } = await supabase
    .from("agent_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000)

  console.log("[v0] Analytics logs query result:", { count: logs?.length, error: logsError })

  const { count: totalCount } = await supabase.from("agent_logs").select("*", { count: "exact", head: true })

  const { count: successCount } = await supabase
    .from("agent_logs")
    .select("*", { count: "exact", head: true })
    .eq("success", true)

  const { data: responseTimeData } = await supabase
    .from("agent_logs")
    .select("response_time_ms")
    .not("response_time_ms", "is", null)
    .limit(100)

  // Calculate metrics with fallbacks
  const totalInteractions = totalCount || logs?.length || 0
  const successfulInteractions = successCount || logs?.filter((log) => log.success).length || 0
  const successRate = totalInteractions > 0 ? (successfulInteractions / totalInteractions) * 100 : 0

  const avgTime = responseTimeData?.length
    ? responseTimeData.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / responseTimeData.length
    : 0

  const sampleLogs = [
    {
      id: "sample-1",
      agent_type: "sales",
      action: "lead_qualification",
      success: true,
      response_time_ms: 1200,
      channel: "web_chat",
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    {
      id: "sample-2",
      agent_type: "support",
      action: "customer_inquiry",
      success: true,
      response_time_ms: 800,
      channel: "email",
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    },
    {
      id: "sample-3",
      agent_type: "general",
      action: "chat_interaction",
      success: false,
      response_time_ms: 2500,
      channel: "web_chat",
      created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
    },
  ]

  const displayLogs = logs && logs.length > 0 ? logs : sampleLogs
  const displayMetrics = {
    total: totalInteractions > 0 ? totalInteractions : sampleLogs.length,
    successful: successfulInteractions > 0 ? successfulInteractions : sampleLogs.filter((l) => l.success).length,
    avgTime: avgTime > 0 ? avgTime : 1200,
  }

  const displaySuccessRate = displayMetrics.total > 0 ? (displayMetrics.successful / displayMetrics.total) * 100 : 0

  return (
    <div className="p-6 space-y-6 bg-stone-100 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Agent performance metrics and insights - {new Date().toLocaleDateString()}</p>
        {(!logs || logs.length === 0) && (
          <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
            Showing sample data - real analytics will appear as agents interact with the system
          </p>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-stone-200 border-gray-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Interactions</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{displayMetrics.total}</div>
            <p className="text-xs text-gray-600">All agent interactions</p>
          </CardContent>
        </Card>

        <Card className="bg-stone-200 border-gray-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{displaySuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-600">Successful interactions</p>
          </CardContent>
        </Card>

        <Card className="bg-stone-200 border-gray-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{displayMetrics.avgTime.toFixed(0)}ms</div>
            <p className="text-xs text-gray-600">Average processing time</p>
          </CardContent>
        </Card>

        <Card className="bg-stone-200 border-gray-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Active Agents</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">3</div>
            <p className="text-xs text-gray-600">Sales, Support, General</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsCharts logs={displayLogs || []} />
      </div>

      {/* Logs Table */}
      <Card className="bg-stone-200 border-gray-500">
        <CardHeader>
          <CardTitle className="text-gray-900">Agent Activity Logs</CardTitle>
          <CardDescription className="text-gray-600">
            Recent agent interactions and performance data
            {(!logs || logs.length === 0) && " (sample data)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgentLogsTable logs={displayLogs || []} />
        </CardContent>
      </Card>
    </div>
  )
}
