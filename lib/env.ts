function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  SUPABASE_URL: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
  SUPABASE_ANON_KEY: getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.5-flash",
} as const;
