const { createOpenAI } = require("@ai-sdk/openai");
const { generateText } = require("ai");
require("dotenv").config();

async function test() {
  console.log("Testing Qwen API connectivity and authentication...");
  console.log("API Key:", process.env.QWEN_API_KEY?.substring(0, 10) + "...");
  
  const qwen = createOpenAI({
    apiKey: process.env.QWEN_API_KEY || "",
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  });

  try {
    console.log("Creating model reference...");
    const model = qwen("qwen-turbo");
    console.log("Model created successfully");
    
    console.log("Attempting to generate text...");
    const response = await generateText({
      model,
      messages: [{ role: "user", content: "Hello, this is a test. Respond with 'Test successful' if you receive this message." }],
      maxTokens: 50,
      temperature: 0.7,
    });
    
    console.log("API Response:", response.text);
    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Error details:");
    console.error("- Message:", error.message);
    console.error("- Name:", error.name);
    console.error("- Stack:", error.stack);
    
    // Additional error information if available
    if (error.response) {
      console.error("- Response status:", error.response.status);
      console.error("- Response data:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

test();