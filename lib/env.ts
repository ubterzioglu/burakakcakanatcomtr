import { z } from "zod";

const envShape = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  ADMIN_PASS: z.string().min(8),
  ADMIN_SESSION_SECRET: z.string().min(16).optional()
});

export type AppEnv = z.infer<typeof envShape>;

export function normalizeEnv(source: Record<string, string | undefined>): AppEnv {
  return envShape.parse(source);
}

export function getEnv() {
  return normalizeEnv(process.env);
}
