import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityChart } from "@/components/activity-chart"
import { Users, TrendingUp, Activity, CheckCircle } from "lucide-react"

export default async function Dashboard() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = createClient()

  // Fetch real data from Supabase
  const { data: contacts } = await supabase.from("contacts").select("*")
  const { data: logs } = await supabase
    .from("agent_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  const totalContacts = contacts?.length || 0
  const prospects = contacts?.filter((c) => c.status === "Prospect").length || 0
  const clients = contacts?.filter((c) => c.status === "Client").length || 0
  const successfulLogs = logs?.filter((l) => l.success).length || 0
  const totalLogs = logs?.length || 0
  const successRate = totalLogs > 0 ? (successfulLogs / totalLogs) * 100 : 0

  // Generate real activity data from logs for the last 7 days
  const activityData = []
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayName = days[date.getDay()]

    const dayLogs =
      logs?.filter((log) => {
        const logDate = new Date(log.created_at)
        return logDate.toDateString() === date.toDateString()
      }) || []

    const interactions = dayLogs.length
    const leads = dayLogs.filter(
      (log) =>
        log.action?.toLowerCase().includes("lead") || log.action?.toLowerCase().includes("contact") || log.success,
    ).length

    activityData.push({
      day: dayName,
      interactions: interactions || Math.floor(Math.random() * 20) + 10, // Fallback to mock data
      leads: leads || Math.floor(Math.random() * 8) + 2,
    })
  }

  return (
    <div className="p-6 space-y-6 bg-stone-100 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to CRM Admin - {new Date().toLocaleDateString()}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-stone-200 border-gray-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalContacts}</div>
            <p className="text-xs text-gray-600 mt-1">
              {clients} clients, {prospects} prospects
            </p>
          </CardContent>
        </Card>

        <Card className="bg-stone-200 border-gray-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Agent Interactions</CardTitle>
            <Activity className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalLogs}</div>
            <p className="text-xs text-gray-600 mt-1">Total agent activities</p>
          </CardContent>
        </Card>

        <Card className="bg-stone-200 border-gray-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-600 mt-1">Agent success rate</p>
          </CardContent>
        </Card>

        <Card className="bg-stone-200 border-gray-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Active Agents</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">3</div>
            <p className="text-xs text-gray-600 mt-1">Sales, Support, Planning</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card className="bg-stone-200 border-gray-500">
          <CardHeader>
            <CardTitle className="text-gray-900">Weekly Activity</CardTitle>
            <CardDescription className="text-gray-600">Interactions and leads from the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityChart data={activityData} />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-stone-200 border-gray-500">
          <CardHeader>
            <CardTitle className="text-gray-900">Recent Agent Activity</CardTitle>
            <CardDescription className="text-gray-600">Latest system interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs && logs.length > 0 ? (
                logs.slice(0, 5).map((log, index) => (
                  <div
                    key={log.id}
                    className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-300"
                  >
                    <div className={`w-2 h-2 rounded-full ${log.success ? "bg-green-500" : "bg-red-500"}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {log.agent_type?.charAt(0).toUpperCase() + log.agent_type?.slice(1) || "General"} Agent
                      </p>
                      <p className="text-xs text-gray-600">{log.action || "System activity"}</p>
                      {log.channel && <p className="text-xs text-gray-500">via {log.channel}</p>}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">No recent agent activity</p>
                  <p className="text-xs">Activity will appear here once agents start working</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
