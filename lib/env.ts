"use server";

const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_PASSWORD",
];

export function validateEnv(): { valid: boolean; missing: string[] } {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  return {
    valid: missing.length === 0,
    missing,
  };
}

// Validate on module load (server-side only)
if (typeof process !== "undefined" && process.env.NEXT_RUNTIME === "nodejs") {
  const result = validateEnv();
  if (!result.valid) {
    console.error(
      `[InternBD] Missing required environment variables: ${result.missing.join(", ")}`
    );
    console.error(
      "[InternBD] Please set these in your .env.local or environment before starting the server."
    );
  }
}
