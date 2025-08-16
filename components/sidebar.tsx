"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Database, Bot, BarChart3 } from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Base de Datos",
    href: "/database",
    icon: Database,
  },
  {
    name: "Sandbox del Agente",
    href: "/sandbox",
    icon: Bot,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-stone-200 border-r border-gray-500 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-500">
        <h1 className="text-xl font-semibold text-gray-900">CRM Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-stone-300 hover:text-gray-900",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-500">
        <p className="text-xs text-gray-600">CRM v2.0 - Sistema de Gestión</p>
      </div>
    </div>
  )
}
