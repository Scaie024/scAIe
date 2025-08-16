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

async function checkEnvironment() {
  log("🔍 Checking environment configuration...", "blue")

  const requiredVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "QWEN_API_KEY",
  ]

  const optionalVars = ["POSTGRES_URL", "REDIS_URL"]

  let allGood = true

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      log(`✅ ${varName}: Configured`, "green")
    } else {
      log(`❌ ${varName}: Missing`, "red")
      allGood = false
    }
  }

  for (const varName of optionalVars) {
    if (process.env[varName]) {
      log(`✅ ${varName}: Configured`, "green")
    } else {
      log(`⚠️  ${varName}: Not configured (optional)`, "yellow")
    }
  }

  return allGood
}

async function checkDatabase() {
  log("\n🗄️  Checking database connection...", "blue")

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      log("❌ Database: Missing configuration", "red")
      return false
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test connection
    const { data, error } = await supabase.from("contacts").select("count").limit(1)

    if (error) {
      log(`❌ Database: Connection failed - ${error.message}`, "red")
      return false
    }

    log("✅ Database: Connection successful", "green")

    // Check tables
    const tables = ["contacts", "agent_logs"]
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select("*").limit(1)

      if (error) {
        log(`❌ Table '${table}': ${error.message}`, "red")
      } else {
        log(`✅ Table '${table}': Available`, "green")
      }
    }

    return true
  } catch (error) {
    log(`❌ Database: ${error.message}`, "red")
    return false
  }
}

async function checkAI() {
  log("\n🤖 Checking AI service...", "blue")

  try {
    const apiKey = process.env.QWEN_API_KEY

    if (!apiKey) {
      log("❌ AI: Missing API key", "red")
      return false
    }

    // Test API connection
    const response = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      log("✅ AI: API connection successful", "green")
      return true
    } else {
      log(`❌ AI: API connection failed - ${response.status}`, "red")
      return false
    }
  } catch (error) {
    log(`❌ AI: ${error.message}`, "red")
    return false
  }
}

async function checkFiles() {
  log("\n📁 Checking required files...", "blue")

  const requiredFiles = ["package.json", "next.config.mjs", "tailwind.config.js", "tsconfig.json", ".env"]

  const requiredDirs = ["app", "components", "lib", "types", "config"]

  let allGood = true

  for (const file of requiredFiles) {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      log(`✅ ${file}: Found`, "green")
    } else {
      log(`❌ ${file}: Missing`, "red")
      allGood = false
    }
  }

  for (const dir of requiredDirs) {
    if (fs.existsSync(path.join(process.cwd(), dir))) {
      log(`✅ ${dir}/: Found`, "green")
    } else {
      log(`❌ ${dir}/: Missing`, "red")
      allGood = false
    }
  }

  return allGood
}

async function checkDependencies() {
  log("\n📦 Checking dependencies...", "blue")

  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"))

    const criticalDeps = ["next", "react", "react-dom", "@supabase/supabase-js", "ai", "@ai-sdk/openai"]

    let allGood = true

    for (const dep of criticalDeps) {
      if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
        log(`✅ ${dep}: Installed`, "green")
      } else {
        log(`❌ ${dep}: Missing`, "red")
        allGood = false
      }
    }

    // Check if node_modules exists
    if (fs.existsSync(path.join(process.cwd(), "node_modules"))) {
      log("✅ node_modules: Found", "green")
    } else {
      log("❌ node_modules: Missing (run npm install)", "red")
      allGood = false
    }

    return allGood
  } catch (error) {
    log(`❌ Dependencies: ${error.message}`, "red")
    return false
  }
}

async function checkPorts() {
  log("\n🔌 Checking port availability...", "blue")

  const { exec } = require("child_process")
  const util = require("util")
  const execAsync = util.promisify(exec)

  const ports = [3000, 5432, 6379]

  for (const port of ports) {
    try {
      const { stdout } = await execAsync(`lsof -i :${port}`, { encoding: "utf8" })
      if (stdout.trim()) {
        log(`⚠️  Port ${port}: In use`, "yellow")
      } else {
        log(`✅ Port ${port}: Available`, "green")
      }
    } catch (error) {
      // lsof returns non-zero exit code when port is free
      log(`✅ Port ${port}: Available`, "green")
    }
  }
}

async function generateReport(results) {
  log("\n📊 Health Check Report", "blue")
  log("======================", "blue")

  const overallHealth = Object.values(results).every((result) => result)

  if (overallHealth) {
    log("🎉 Overall Status: HEALTHY", "green")
  } else {
    log("⚠️  Overall Status: NEEDS ATTENTION", "yellow")
  }

  log("\nComponent Status:", "cyan")
  for (const [component, status] of Object.entries(results)) {
    const icon = status ? "✅" : "❌"
    const color = status ? "green" : "red"
    log(`${icon} ${component}: ${status ? "OK" : "FAILED"}`, color)
  }

  if (!overallHealth) {
    log("\n🔧 Recommended Actions:", "yellow")
    if (!results.Environment) {
      log("- Configure missing environment variables in .env", "cyan")
    }
    if (!results.Database) {
      log("- Check Supabase configuration and run migrations", "cyan")
    }
    if (!results.AI) {
      log("- Verify Qwen API key and network connectivity", "cyan")
    }
    if (!results.Files) {
      log("- Ensure all required files are present", "cyan")
    }
    if (!results.Dependencies) {
      log("- Run npm install to install missing dependencies", "cyan")
    }
  }

  return overallHealth
}

async function main() {
  log("🏥 CRM Admin System Health Check", "bright")
  log("==================================", "bright")

  const results = {
    Environment: await checkEnvironment(),
    Database: await checkDatabase(),
    AI: await checkAI(),
    Files: await checkFiles(),
    Dependencies: await checkDependencies(),
  }

  await checkPorts()

  const isHealthy = await generateReport(results)

  if (isHealthy) {
    log("\n🚀 System is ready to run!", "green")
    log("Start with: npm run dev", "cyan")
  } else {
    log("\n⚠️  System needs attention before running", "yellow")
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { main }
