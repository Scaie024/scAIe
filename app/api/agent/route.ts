import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { message, channel = "web", metadata = {} } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Log the interaction
    const supabase = createClient()
    const startTime = Date.now()

    // Simulate agent processing
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))

    const responseTime = Date.now() - startTime
    const success = Math.random() > 0.1 // 90% success rate

    // Log to database
    await supabase.from("agent_logs").insert({
      agent_type: "multi-agent",
      action: "process_message",
      input_data: { message, channel, metadata },
      output_data: { processed: true, response_time: responseTime },
      success,
      response_time_ms: responseTime,
      channel,
    })

    return NextResponse.json({
      success,
      response: success
        ? "Message processed successfully by multi-agent system"
        : "Processing failed, please try again",
      responseTime,
      agent: "orchestrator",
    })
  } catch (error) {
    console.error("Agent API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
