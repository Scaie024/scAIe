export const env = {
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },

  // AI Configuration
  ai: {
    qwenApiKey: process.env.QWEN_API_KEY || "",
    openaiApiKey: process.env.OPENAI_API_KEY || "",
  },

  // Database Configuration
  database: {
    url: process.env.POSTGRES_URL || "",
    prismaUrl: process.env.POSTGRES_PRISMA_URL || "",
    nonPoolingUrl: process.env.POSTGRES_URL_NON_POOLING || "",
  },

  // Application Configuration
  app: {
    nodeEnv: process.env.NODE_ENV || "development",
    port: process.env.PORT || "3000",
    hostname: process.env.HOSTNAME || "localhost",
  },

  // Feature Flags
  features: {
    enableAnalytics: process.env.ENABLE_ANALYTICS !== "false",
    enableAI: process.env.ENABLE_AI !== "false",
    enableDebug: process.env.NODE_ENV === "development",
  },
} as const

// Validation functions
export const validateEnvironment = () => {
  const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "QWEN_API_KEY"]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}

export const isProduction = () => env.app.nodeEnv === "production"
export const isDevelopment = () => env.app.nodeEnv === "development"
export const isSupabaseConfigured = () => env.supabase.url && env.supabase.anonKey
