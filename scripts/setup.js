#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")
const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset}`, resolve)
  })
}

async function checkPrerequisites() {
  log("\n🔍 Checking prerequisites...", "blue")

  const requirements = [
    { name: "Node.js", command: "node --version", minVersion: "18.0.0" },
    { name: "npm", command: "npm --version", minVersion: "8.0.0" },
    { name: "Docker", command: "docker --version", optional: true },
    { name: "Docker Compose", command: "docker-compose --version", optional: true },
  ]

  for (const req of requirements) {
    try {
      const version = execSync(req.command, { encoding: "utf8" }).trim()
      log(`✅ ${req.name}: ${version}`, "green")
    } catch (error) {
      if (req.optional) {
        log(`⚠️  ${req.name}: Not installed (optional)`, "yellow")
      } else {
        log(`❌ ${req.name}: Not found`, "red")
        log(`Please install ${req.name} version ${req.minVersion} or higher`, "red")
        process.exit(1)
      }
    }
  }
}

async function setupEnvironment() {
  log("\n🔧 Setting up environment...", "blue")

  const envPath = path.join(process.cwd(), ".env")
  const envExamplePath = path.join(process.cwd(), ".env.example")

  if (fs.existsSync(envPath)) {
    const overwrite = await question("⚠️  .env file already exists. Overwrite? (y/N): ")
    if (overwrite.toLowerCase() !== "y") {
      log("Skipping environment setup", "yellow")
      return
    }
  }

  if (!fs.existsSync(envExamplePath)) {
    log("❌ .env.example not found", "red")
    return
  }

  // Copy .env.example to .env
  fs.copyFileSync(envExamplePath, envPath)
  log("✅ Created .env file from template", "green")

  // Interactive configuration
  log("\n📝 Let's configure your environment variables:", "magenta")

  const config = {}

  // Supabase configuration
  log("\n🗄️  Supabase Configuration:", "cyan")
  config.NEXT_PUBLIC_SUPABASE_URL = await question("Enter your Supabase URL: ")
  config.NEXT_PUBLIC_SUPABASE_ANON_KEY = await question("Enter your Supabase Anon Key: ")
  config.SUPABASE_SERVICE_ROLE_KEY = await question("Enter your Supabase Service Role Key: ")

  // AI configuration
  log("\n🤖 AI Configuration:", "cyan")
  config.QWEN_API_KEY = await question("Enter your Qwen API Key: ")

  // Update .env file
  let envContent = fs.readFileSync(envPath, "utf8")

  for (const [key, value] of Object.entries(config)) {
    if (value) {
      const regex = new RegExp(`^${key}=.*$`, "m")
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`)
      } else {
        envContent += `\n${key}=${value}`
      }
    }
  }

  fs.writeFileSync(envPath, envContent)
  log("✅ Environment variables configured", "green")
}

async function installDependencies() {
  log("\n📦 Installing dependencies...", "blue")

  try {
    execSync("npm install", { stdio: "inherit" })
    log("✅ Dependencies installed successfully", "green")
  } catch (error) {
    log("❌ Failed to install dependencies", "red")
    process.exit(1)
  }
}

async function setupDatabase() {
  log("\n🗄️  Setting up database...", "blue")

  const setupDb = await question("Do you want to set up the database now? (Y/n): ")
  if (setupDb.toLowerCase() === "n") {
    log("Skipping database setup", "yellow")
    return
  }

  try {
    // Run database migrations
    log("Running database migrations...", "cyan")
    execSync("node scripts/migrate.js", { stdio: "inherit" })

    // Seed database
    const seedDb = await question("Do you want to seed the database with sample data? (Y/n): ")
    if (seedDb.toLowerCase() !== "n") {
      log("Seeding database...", "cyan")
      execSync("node scripts/seed.js", { stdio: "inherit" })
    }

    log("✅ Database setup completed", "green")
  } catch (error) {
    log("❌ Database setup failed", "red")
    log("You can run database setup later with: npm run db:migrate && npm run db:seed", "yellow")
  }
}

async function buildProject() {
  log("\n🏗️  Building project...", "blue")

  try {
    execSync("npm run build", { stdio: "inherit" })
    log("✅ Project built successfully", "green")
  } catch (error) {
    log("❌ Build failed", "red")
    log("You can build later with: npm run build", "yellow")
  }
}

async function runHealthCheck() {
  log("\n🏥 Running health check...", "blue")

  try {
    execSync("node scripts/health-check.js", { stdio: "inherit" })
  } catch (error) {
    log("⚠️  Health check completed with warnings", "yellow")
  }
}

async function showNextSteps() {
  log("\n🎉 Setup completed!", "green")
  log("\n📋 Next steps:", "magenta")
  log("1. Start development server: npm run dev", "cyan")
  log("2. Open http://localhost:3000 in your browser", "cyan")
  log("3. Check the documentation in the docs/ folder", "cyan")
  log("4. For Docker deployment: docker-compose up --build", "cyan")
  log("\n💡 Useful commands:", "magenta")
  log("- npm run dev          # Start development server", "cyan")
  log("- npm run build        # Build for production", "cyan")
  log("- npm run start        # Start production server", "cyan")
  log("- npm run db:migrate   # Run database migrations", "cyan")
  log("- npm run db:seed      # Seed database with sample data", "cyan")
  log("- npm run docker:dev   # Start with Docker (development)", "cyan")
  log("- npm run docker:prod  # Start with Docker (production)", "cyan")
}

async function main() {
  log("🚀 CRM Admin System Setup", "bright")
  log("==========================", "bright")

  try {
    await checkPrerequisites()
    await setupEnvironment()
    await installDependencies()
    await setupDatabase()
    await buildProject()
    await runHealthCheck()
    await showNextSteps()
  } catch (error) {
    log(`\n❌ Setup failed: ${error.message}`, "red")
    process.exit(1)
  } finally {
    rl.close()
  }
}

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  log("\n\n👋 Setup cancelled by user", "yellow")
  rl.close()
  process.exit(0)
})

if (require.main === module) {
  main()
}

module.exports = { main }
