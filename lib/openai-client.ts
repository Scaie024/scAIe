import { createOpenAI } from "@ai-sdk/openai"
import { env } from "@/config/environment"

// Create OpenAI client
export const openai = createOpenAI({
  apiKey: env.ai.openaiApiKey, // Use only the environment variable
  fetch: async (url, options) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  },
})

// Enhanced model configuration with metadata
export const openaiModels = {
  "gpt-3.5-turbo": {
    model: openai("gpt-3.5-turbo"),
    modelId: "gpt-3.5-turbo",
    maxTokens: 4096,
    costPerToken: 0.0002,
    description: "Fast and cost-effective for general queries",
  },
  "gpt-4": {
    model: openai("gpt-4"),
    modelId: "gpt-4",
    maxTokens: 8192,
    costPerToken: 0.0004,
    description: "More capable model for complex tasks",
  },
  "gpt-4-turbo": {
    model: openai("gpt-4-turbo"),
    modelId: "gpt-4-turbo",
    maxTokens: 128000,
    costPerToken: 0.0006,
    description: "Most capable model with large context window",
  },
} as const

// Default model
export const openaiDefaultModel = openaiModels["gpt-3.5-turbo"].model