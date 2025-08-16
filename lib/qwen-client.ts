import { createOpenAI } from "@ai-sdk/openai"
import { env } from "@/config/environment"

// Create Qwen client using OpenAI-compatible interface with environment variable
export const qwen = createOpenAI({
  apiKey: env.ai.qwenApiKey, // Use only the environment variable
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
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
export const qwenModels = {
  turbo: {
    model: qwen("qwen-turbo"),
    modelId: "qwen-turbo",
    maxTokens: 2000,
    costPerToken: 0.0001,
    description: "Fast and efficient for general queries",
  },
  plus: {
    model: qwen("qwen-plus"),
    modelId: "qwen-plus",
    maxTokens: 4000,
    costPerToken: 0.0002,
    description: "Balanced performance for complex tasks",
  },
  max: {
    model: qwen("qwen-max"),
    modelId: "qwen-max",
    maxTokens: 8000,
    costPerToken: 0.0005,
    description: "Most capable model for advanced reasoning",
  },
} as const

// Default model (backward compatibility)
export const qwenDefaultModel = qwenModels.plus.model