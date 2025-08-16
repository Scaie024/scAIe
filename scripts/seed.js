#!/usr/bin/env node

const { Client } = require('pg');

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
  const postgresUrl = process.env.POSTGRES_URL

  if (!postgresUrl) {
    log("❌ Missing PostgreSQL configuration in .env file", "red")
    process.exit(1)
  }

  // Initialize PostgreSQL client
  const client = new Client({
    connectionString: postgresUrl,
  })

  try {
    await client.connect()
    log("✅ Connected to database", "green")

    // Check if data already exists
    const contactsRes = await client.query('SELECT id FROM contacts LIMIT 1')
    
    if (contactsRes.rows.length > 0) {
      log("⚠️  Database already contains data", "yellow")
      const readline = require("readline")
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      rl.question("Do you want to clear existing data and re-seed? (y/N): ", async (answer) => {
        if (answer.toLowerCase() === 'y') {
          log("🗑️  Clearing existing data...", "yellow")
          await client.query('DELETE FROM agent_logs')
          await client.query('DELETE FROM contacts')
          rl.close()
          await insertData(client)
        } else {
          log("⏭️  Skipping data seeding", "yellow")
          rl.close()
          await client.end()
          process.exit(0)
        }
      })
    } else {
      await insertData(client)
    }

    log("📇 Seeding contacts...", "cyan")
    
    // Insert contacts
    for (const contact of sampleContacts) {
      await client.query(
        `INSERT INTO contacts (name, email, phone, company, status, notes, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [contact.name, contact.email, contact.phone, contact.company, contact.status, contact.notes || '']
      )
    }
    log(`✅ Inserted ${sampleContacts.length} contacts`, "green")

    log("🤖 Seeding agent logs...", "cyan")
    
    // Insert agent logs
    for (const log of sampleAgentLogs) {
      await client.query(
        `INSERT INTO agent_logs (agent_type, action, input_data, output_data, success, response_time_ms, channel, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [log.agent_type, log.action, log.metadata || {}, log.metadata || {}, log.success, Math.floor(Math.random() * 1000), log.channel]
      )
    }
    log(`✅ Inserted ${sampleAgentLogs.length} agent logs`, "green")

    await client.end()
    log("🎉 Database seeding completed successfully!", "green")
    process.exit(0)

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


async function main() {
  try {
    await seedDatabase()
  } catch (error) {
    log(`❌ Seeding failed: ${error.message}`, "red")
    process.exit(1)
  }
}

if (require.main === module) {
  seedDatabase().catch(console.error)
}
