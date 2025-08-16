"use client"

import React, { useEffect, useState } from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Evitar hidratación hasta que el componente esté montado en el cliente
  if (!mounted) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <style>{`
            html {
              font-family: ${GeistSans.style.fontFamily};
              --font-sans: ${GeistSans.variable};
              --font-mono: ${GeistMono.variable};
            }
          `}</style>
        </head>
        <body>
          <div className="flex h-screen items-center justify-center bg-stone-100">
            <div className="animate-pulse">Cargando...</div>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
      </head>
      <body className="bg-stone-100">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  )
}
