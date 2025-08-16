"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Contact, AgentLog, ApiResponse } from "@/types"

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setContacts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch contacts")
    } finally {
      setLoading(false)
    }
  }

  const addContact = async (
    contact: Omit<Contact, "id" | "created_at" | "updated_at">,
  ): Promise<ApiResponse<Contact>> => {
    try {
      const { data, error } = await supabase.from("contacts").insert([contact]).select().single()

      if (error) throw error

      setContacts((prev) => [data, ...prev])
      return { data, success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add contact"
      return { error: { message }, success: false }
    }
  }

  const updateContact = async (id: string, updates: Partial<Contact>): Promise<ApiResponse<Contact>> => {
    try {
      const { data, error } = await supabase.from("contacts").update(updates).eq("id", id).select().single()

      if (error) throw error

      setContacts((prev) => prev.map((c) => (c.id === id ? data : c)))
      return { data, success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update contact"
      return { error: { message }, success: false }
    }
  }

  const deleteContact = async (id: string): Promise<ApiResponse> => {
    try {
      const { error } = await supabase.from("contacts").delete().eq("id", id)

      if (error) throw error

      setContacts((prev) => prev.filter((c) => c.id !== id))
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete contact"
      return { error: { message }, success: false }
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  return {
    contacts,
    loading,
    error,
    addContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts,
  }
}

export const useAgentLogs = (limit = 50) => {
  const [logs, setLogs] = useState<AgentLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("agent_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      setLogs(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch logs")
    } finally {
      setLoading(false)
    }
  }

  const addLog = async (log: Omit<AgentLog, "id" | "created_at">): Promise<ApiResponse<AgentLog>> => {
    try {
      const { data, error } = await supabase.from("agent_logs").insert([log]).select().single()

      if (error) throw error

      setLogs((prev) => [data, ...prev.slice(0, limit - 1)])
      return { data, success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add log"
      return { error: { message }, success: false }
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  return {
    logs,
    loading,
    error,
    addLog,
    refetch: fetchLogs,
  }
}
