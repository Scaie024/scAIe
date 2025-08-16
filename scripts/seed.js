#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js")

// Load environment variables
require("dotenv").config()

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
}

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Sample data
const sampleContacts = [
  {
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1-555-0101",
    company: "Tech Solutions Inc",
    status: "Client",
  },
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "+1-555-0102",
    company: "Marketing Pro",
    status: "Prospect",
  },
  {
    name: "Michael Brown",
    email: "michael.brown@example.com",
    phone: "+1-555-0103",
    company: "Design Studio",
    status: "Client",
  },
  {
    name: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "+1-555-0104",
    company: "Consulting Group",
    status: "Prospect",
  },
  {
    name: "David Wilson",
    email: "david.wilson@example.com",
    phone: "+1-555-0105",
    company: "Software Corp",
    status: "Inactive",
  },
]

const sampleAgentLogs = [
  {
    agent_type: "sales",
    action: "lead_qualification",
    channel: "email",
    success: true,
    metadata: { lead_score: 85, follow_up_date: "2024-01-20" },
  },
  {
    agent_type: "support",
    action: "issue_resolution",
    channel: "web_chat",
    success: true,
    metadata: { issue_type: "technical", resolution_time: 15 },
  },
  {
    agent_type: "analytics",
    action: "report_generation",
    channel: "internal",
    success: true,
    metadata: { report_type: "monthly_summary", records_processed: 150 },
  },
  {
    agent_type: "sales",
    action: "follow_up_call",
    channel: "phone",
    success: false,
    metadata: { reason: "no_answer", retry_scheduled: true },
  },
  {
    agent_type: "planning",
    action: "process_optimization",
    channel: "internal",
    success: true,
    metadata: { process: "lead_nurturing", improvement: "25%" },
  },
]

async function seedDatabase() {
  log("🌱 Starting database seeding...", "blue")

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    log("❌ Missing Supabase configuration in .env file", "red")
    process.exit(1)
  }

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Check if data already exists
    const { data: existingContacts } = await supabase.from("contacts").select("id").limit(1)

    if (existingContacts && existingContacts.length > 0) {
      log("⚠️  Database already contains data", "yellow")
      const readline = require("readline")
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      const answer = await new Promise((resolve) => {
        rl.question("Do you want to add sample data anyway? (y/N): ", resolve)
      })
      rl.close()

      if (answer.toLowerCase() !== "y") {
        log("Seeding cancelled", "yellow")
        return
      }
    }

    // Seed contacts
    log("📇 Seeding contacts...", "cyan")
    const { data: contacts, error: contactsError } = await supabase.from("contacts").insert(sampleContacts).select()

    if (contactsError) {
      throw contactsError
    }

    log(`✅ Inserted ${contacts.length} contacts`, "green")

    // Seed agent logs
    log("📊 Seeding agent logs...", "cyan")
    const { data: logs, error: logsError } = await supabase.from("agent_logs").insert(sampleAgentLogs).select()

    if (logsError) {
      throw logsError
    }

    log(`✅ Inserted ${logs.length} agent logs`, "green")

    // Generate additional historical data
    log("📈 Generating historical data...", "cyan")
    await generateHistoricalData(supabase)

    log("✅ Database seeding completed successfully!", "green")
    log("\n📋 Summary:", "blue")
    log(`- ${contacts.length} contacts added`, "cyan")
    log(`- ${logs.length} agent logs added`, "cyan")
    log("- Historical data generated for analytics", "cyan")
  } catch (error) {
    log("❌ Seeding failed", "red")
    console.error(error)
    process.exit(1)
  }
}

async function generateHistoricalData(supabase) {
  const historicalLogs = []
  const agentTypes = ["sales", "support", "analytics", "planning"]
  const channels = ["email", "web_chat", "phone", "whatsapp", "slack"]
  const actions = [
    "lead_qualification",
    "follow_up_call",
    "issue_resolution",
    "report_generation",
    "process_optimization",
    "customer_onboarding",
    "data_analysis",
    "strategy_planning",
  ]

  // Generate data for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    // Generate 3-8 logs per day
    const logsPerDay = Math.floor(Math.random() * 6) + 3

    for (let j = 0; j < logsPerDay; j++) {
      const logDate = new Date(date)
      logDate.setHours(
        Math.floor(Math.random() * 16) + 8, // 8 AM to 11 PM
        Math.floor(Math.random() * 60),
        Math.floor(Math.random() * 60),
      )

      historicalLogs.push({
        agent_type: agentTypes[Math.floor(Math.random() * agentTypes.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        channel: channels[Math.floor(Math.random() * channels.length)],
        success: Math.random() > 0.2, // 80% success rate
        metadata: {
          generated: true,
          score: Math.floor(Math.random() * 100),
          duration: Math.floor(Math.random() * 300) + 30,
        },
        created_at: logDate.toISOString(),
      })
    }
  }

  // Insert historical data in batches
  const batchSize = 50
  for (let i = 0; i < historicalLogs.length; i += batchSize) {
    const batch = historicalLogs.slice(i, i + batchSize)
    const { error } = await supabase.from("agent_logs").insert(batch)

    if (error) {
      throw error
    }
  }

  log(`✅ Generated ${historicalLogs.length} historical log entries`, "green")
}

async function main() {
  try {
    await seedDatabase()
  } catch (error) {
    log(`❌ Seeding failed: ${error.message}`, "red")
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { seedDatabase }
