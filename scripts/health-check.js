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
    // Use the local PostgreSQL connection instead of Supabase
    const { Client } = require('pg');
    
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
    });

    await client.connect();
    log("✅ Database: Connection successful", "green");

    // Check tables
    const tables = ["contacts", "agent_logs"];
    for (const table of tables) {
      try {
        const res = await client.query(`SELECT 1 FROM ${table} LIMIT 1`);
        log(`✅ Table '${table}': Available`, "green");
      } catch (error) {
        log(`❌ Table '${table}': ${error.message}`, "red");
      }
    }

    await client.end();
    return true;
  } catch (error) {
    log(`❌ Database: ${error.message}`, "red");
    return false;
  }
}

async function checkAI() {
  log("\n🤖 Checking AI service...", "blue")

  try {
    // Check which AI service is configured
    const qwenApiKey = process.env.QWEN_API_KEY
    const openaiApiKey = process.env.OPENAI_API_KEY
    const geminiApiKey = process.env.GEMINI_API_KEY

    if (geminiApiKey) {
      log("🔍 Testing Gemini API...", "cyan")
      
      // Test Gemini API connection with a valid model
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" + geminiApiKey, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Hello, this is a test. Respond with 'Test successful' if you receive this message."
            }]
          }]
        })
      })

      if (response.ok) {
        log("✅ Gemini API: Connection successful", "green")
        return true
      } else {
        const errorData = await response.json()
        log(`❌ Gemini API: Connection failed - ${errorData.error?.message || response.status}`, "red")
        return false
      }
    } else if (qwenApiKey) {
      log("🔍 Testing Qwen API...", "cyan")
      
      // Test Qwen API connection
      const response = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/models", {
        headers: {
          Authorization: `Bearer ${qwenApiKey}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        log("✅ Qwen API: Connection successful", "green")
        return true
      } else {
        log(`❌ Qwen API: Connection failed - ${response.status}`, "red")
        return false
      }
    } else if (openaiApiKey) {
      log("🔍 Testing OpenAI API...", "cyan")
      
      // Test OpenAI API connection
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        log("✅ OpenAI API: Connection successful", "green")
        return true
      } else {
        log(`❌ OpenAI API: Connection failed - ${response.status}`, "red")
        return false
      }
    } else {
      log("❌ AI: No API key configured", "red")
      return false
    }
  } catch (error) {
    log(`❌ AI: ${error.message}`, "red")
    return false
  }
}

async function checkFiles() {
  log("\n📁 Checking required files...", "blue")

  const requiredFiles = ["package.json", "next.config.mjs", "tailwind.config.ts", "tsconfig.json", ".env"]

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

  try {
    for (const port of ports) {
      // Check if port is in use
      try {
        await execAsync(`lsof -i :${port} | grep LISTEN`)
        log(`⚠️  Port ${port}: In use`, "yellow")
      } catch (error) {
        log(`✅ Port ${port}: Available`, "green")
      }
    }
    return true
  } catch (error) {
    log(`⚠️  Ports: Could not check availability`, "yellow")
    return true // Not a critical error
  }
}

async function main() {
  log("🏥 CRM System Health Check", "cyan")
  log("========================\n", "cyan")

  const checks = [
    { name: "Environment", fn: checkEnvironment },
    { name: "Database", fn: checkDatabase },
    { name: "AI Service", fn: checkAI },
    { name: "Files", fn: checkFiles },
    { name: "Dependencies", fn: checkDependencies },
    { name: "Ports", fn: checkPorts },
  ]

  let allPassed = true

  for (const check of checks) {
    try {
      const result = await check.fn()
      if (!result) allPassed = false
    } catch (error) {
      log(`❌ ${check.name}: Failed with error - ${error.message}`, "red")
      allPassed = false
    }
  }

  log("\n" + "=".repeat(24), "cyan")
  if (allPassed) {
    log("🎉 All systems operational!", "green")
  } else {
    log("⚠️  Some checks failed. Please review.", "yellow")
  }
}

if (require.main === module) {
  main().catch(console.error)
}