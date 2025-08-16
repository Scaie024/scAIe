import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Please check your environment variables.")
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    db: {
      schema: "public",
    },
    global: {
      headers: {
        "X-Client-Info": "crm-admin-system",
      },
    },
  })
}

// Create a singleton instance of the Supabase client for Client Components
export const supabase = createClientComponentClient()

export async function testConnection() {
  try {
    const client = createClient()
    const { data, error } = await client.from("contacts").select("count").limit(1)

    if (error) {
      throw error
    }

    return { success: true, message: "Connection successful" }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown connection error",
    }
  }
}

export function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    configured: isSupabaseConfigured,
  }
}
