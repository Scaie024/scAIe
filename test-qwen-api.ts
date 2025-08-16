import { createOpenAI } from "@ai-sdk/openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testQwenAPI() {
  console.log("Testing Qwen API with provided key...");
  
  // Check if API key is set
  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) {
    console.error("QWEN_API_KEY is not set in environment variables");
    return;
  }
  
  console.log("API Key found, creating Qwen client...");
  
  // Create Qwen client using OpenAI-compatible interface
  const qwen = createOpenAI({
    apiKey: apiKey,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  });
  
  try {
    console.log("Attempting to call Qwen API...");
    
    // Try to use the qwen-turbo model
    const model = qwen("qwen-turbo");
    
    // Simple test - generate text
    const response = await model.doGenerate({
      inputFormat: 'prompt',
      prompt: 'Hello, this is a test. Respond with "Test successful" if you receive this message.',
      maxTokens: 50,
    });
    
    console.log("API Response:", response);
    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Error testing Qwen API:", error);
  }
}

// Run the test
testQwenAPI();