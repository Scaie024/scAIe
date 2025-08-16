"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"

interface AgentLog {
  id: string
  agent_type: string
  action: string
  success: boolean
  response_time_ms: number | null
  channel: string
  created_at: string
}

interface AgentLogsTableProps {
  logs: AgentLog[]
}

export function AgentLogsTable({ logs }: AgentLogsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [agentFilter, setAgentFilter] = useState("all")
  const [channelFilter, setChannelFilter] = useState("all")

  // Get unique agent types and channels for filters
  const agentTypes = useMemo(() => {
    const types = [...new Set(logs.map((log) => log.agent_type))]
    return types.sort()
  }, [logs])

  const channels = useMemo(() => {
    const channelList = [...new Set(logs.map((log) => log.channel))]
    return channelList.sort()
  }, [logs])

  // Filter logs based on search and filters
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        searchTerm === "" ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.agent_type.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesAgent = agentFilter === "all" || log.agent_type === agentFilter
      const matchesChannel = channelFilter === "all" || log.channel === channelFilter

      return matchesSearch && matchesAgent && matchesChannel
    })
  }, [logs, searchTerm, agentFilter, channelFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setAgentFilter("all")
    setChannelFilter("all")
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search actions or agent types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-gray-300"
          />
        </div>

        <Select value={agentFilter} onValueChange={setAgentFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white border-gray-300">
            <SelectValue placeholder="Filter by agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {agentTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white border-gray-300">
            <SelectValue placeholder="Filter by channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            {channels.map((channel) => (
              <SelectItem key={channel} value={channel}>
                {channel.charAt(0).toUpperCase() + channel.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={clearFilters} className="bg-white border-gray-300 hover:bg-stone-50">
          <Filter className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredLogs.length} of {logs.length} logs
      </div>

      {/* Table */}
      <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50">
              <TableHead className="text-gray-900 font-medium">Agent</TableHead>
              <TableHead className="text-gray-900 font-medium">Action</TableHead>
              <TableHead className="text-gray-900 font-medium">Channel</TableHead>
              <TableHead className="text-gray-900 font-medium">Status</TableHead>
              <TableHead className="text-gray-900 font-medium">Response Time</TableHead>
              <TableHead className="text-gray-900 font-medium">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.slice(0, 50).map((log) => (
              <TableRow key={log.id} className="hover:bg-stone-50">
                <TableCell className="font-medium text-gray-900">
                  {log.agent_type.charAt(0).toUpperCase() + log.agent_type.slice(1)}
                </TableCell>
                <TableCell className="text-gray-700">{log.action}</TableCell>
                <TableCell className="text-gray-700">
                  {log.channel.charAt(0).toUpperCase() + log.channel.slice(1)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={log.success ? "default" : "destructive"}
                    className={log.success ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                  >
                    {log.success ? "Success" : "Failed"}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-700">
                  {log.response_time_ms ? `${log.response_time_ms}ms` : "N/A"}
                </TableCell>
                <TableCell className="text-gray-700">{new Date(log.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredLogs.length > 50 && (
        <div className="text-center text-sm text-gray-600">
          Showing first 50 results. Use filters to narrow down the search.
        </div>
      )}
    </div>
  )
}
