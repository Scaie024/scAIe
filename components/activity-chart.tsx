"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface ActivityData {
  day: string
  interactions: number
  leads: number
}

interface ActivityChartProps {
  data: ActivityData[]
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" />
          <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#f5f5f4",
              border: "1px solid #6b7280",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#111827" }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", color: "#6b7280" }} />
          <Line
            type="monotone"
            dataKey="interactions"
            stroke="#6b7280"
            strokeWidth={2}
            dot={{ fill: "#6b7280", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: "#111827" }}
            name="Interacciones"
          />
          <Line
            type="monotone"
            dataKey="leads"
            stroke="#111827"
            strokeWidth={2}
            dot={{ fill: "#111827", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: "#6b7280" }}
            name="Leads"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
