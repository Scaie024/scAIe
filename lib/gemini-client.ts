import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { env } from "@/config/environment"

// Create Google Gemini client using the Google Generative AI provider
export const google = createGoogleGenerativeAI({
  apiKey: env.ai.geminiApiKey, // Use only the environment variable
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
export const geminiModels = {
  "gemini-1.5-pro": {
    model: google("gemini-1.5-pro"),
    modelId: "gemini-1.5-pro",
    maxTokens: 1000000,
    costPerToken: 0.0015,
    description: "Advanced model with breakthrough reasoning across modalities",
  },
  "gemini-1.5-flash": {
    model: google("gemini-1.5-flash"),
    modelId: "gemini-1.5-flash",
    maxTokens: 1000000,
    costPerToken: 0.00015,
    description: "Fast and efficient multimodal model for high-volume tasks",
  },
  "gemini-2.0-flash": {
    model: google("gemini-2.0-flash"),
    modelId: "gemini-2.0-flash",
    maxTokens: 1000000,
    costPerToken: 0.000075,
    description: "Latest generation fast model",
  },
} as const

// Default model
export const geminiDefaultModel = geminiModels["gemini-1.5-pro"].model

export async function queryGemini(prompt: string): Promise<string> {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt,
          }],
        }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle quota exceeded error with fallback mechanism
      if (response.status === 429 || errorData.error?.message.includes('quota')) {
        console.warn('Gemini API quota exceeded, falling back to Qwen API');
        
        // Fallback to Qwen API
        const qwenResponse = await queryQwen(prompt);
        return qwenResponse;
      }
      
      throw new Error(`Gemini API request failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error querying Gemini API:', error);
    
    // Try fallback providers if available
    try {
      console.log('Trying Qwen API as fallback...');
      return await queryQwen(prompt);
    } catch (qwenError) {
      console.error('Qwen API fallback failed:', qwenError);
      throw new Error('All AI services are currently unavailable. Please try again later.');
    }
  }
}
