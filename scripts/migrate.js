#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
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

async function runMigrations() {
  log("🗄️  Starting database migrations...", "blue")

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    log("❌ Missing Supabase configuration in .env file", "red")
    log("Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY", "yellow")
    process.exit(1)
  }

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Get migration files
  const migrationsDir = path.join(__dirname)
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql") && file.match(/^\d+/))
    .sort()

  if (migrationFiles.length === 0) {
    log("⚠️  No migration files found", "yellow")
    return
  }

  log(`Found ${migrationFiles.length} migration files`, "cyan")

  // Create migrations table if it doesn't exist
  const { error: createTableError } = await supabase.rpc("exec", {
    sql: `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
  })

  if (createTableError) {
    log("❌ Failed to create migrations table", "red")
    console.error(createTableError)
    process.exit(1)
  }

  // Get already executed migrations
  const { data: executedMigrations, error: fetchError } = await supabase.from("migrations").select("filename")

  if (fetchError) {
    log("❌ Failed to fetch executed migrations", "red")
    console.error(fetchError)
    process.exit(1)
  }

  const executedFiles = new Set(executedMigrations?.map((m) => m.filename) || [])

  // Run pending migrations
  let executedCount = 0

  for (const filename of migrationFiles) {
    if (executedFiles.has(filename)) {
      log(`⏭️  Skipping ${filename} (already executed)`, "yellow")
      continue
    }

    log(`🔄 Executing ${filename}...`, "cyan")

    try {
      // Read migration file
      const filePath = path.join(migrationsDir, filename)
      const sql = fs.readFileSync(filePath, "utf8")

      // Execute migration
      const { error: execError } = await supabase.rpc("exec", { sql })

      if (execError) {
        throw execError
      }

      // Record migration as executed
      const { error: recordError } = await supabase.from("migrations").insert([{ filename }])

      if (recordError) {
        throw recordError
      }

      log(`✅ Executed ${filename}`, "green")
      executedCount++
    } catch (error) {
      log(`❌ Failed to execute ${filename}`, "red")
      console.error(error)
      process.exit(1)
    }
  }

  if (executedCount === 0) {
    log("✅ All migrations are up to date", "green")
  } else {
    log(`✅ Successfully executed ${executedCount} migrations`, "green")
  }
}

async function main() {
  try {
    await runMigrations()
  } catch (error) {
    log(`❌ Migration failed: ${error.message}`, "red")
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { runMigrations }
