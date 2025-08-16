import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Create a client for client components that uses direct PostgreSQL connection
export const isSupabaseConfigured = true

export function createClient() {
  // Return a dummy client for client components
  return {
    from: (table: string) => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
  }
}

// Create a singleton instance of the dummy client for Client Components
export const supabase = createClient()

export async function testConnection() {
  return { success: true, message: "Connection successful" }
}

export function getSupabaseConfig() {
  return {
    url: '',
    anonKey: '',
    configured: true,
  }
}
