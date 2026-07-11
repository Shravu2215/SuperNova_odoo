/**
 * Validate all required environment variables on startup
 * Fail fast if config is invalid
 */

export function validateEnv() {
  const required = ["DATABASE_URL", "JWT_SECRET", "PORT", "CLIENT_URL"];
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(`\n❌ Missing required environment variables:`);
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error(`\n📝 Check your .env file\n`);
    process.exit(1);
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET!.length < 32) {
    console.error("❌ JWT_SECRET must be at least 32 characters long");
    process.exit(1);
  }

  console.log("✅ Environment validation passed");
}
