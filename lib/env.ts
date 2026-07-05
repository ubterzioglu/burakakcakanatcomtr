import { z } from "zod";

const envShape = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  ADMIN_PASS: z.string().min(8),
  ADMIN_SESSION_SECRET: z.string().min(16).optional()
});

const publicEnvShape = envShape.pick({
  NEXT_PUBLIC_SUPABASE_URL: true,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: true
});

const serviceRoleEnvShape = envShape.pick({
  NEXT_PUBLIC_SUPABASE_URL: true,
  SUPABASE_SERVICE_ROLE_KEY: true
});

const adminEnvShape = envShape.pick({
  ADMIN_PASS: true,
  ADMIN_SESSION_SECRET: true,
  SUPABASE_SERVICE_ROLE_KEY: true
});

export type AppEnv = z.infer<typeof envShape>;
export type PublicAppEnv = z.infer<typeof publicEnvShape>;
export type ServiceRoleAppEnv = z.infer<typeof serviceRoleEnvShape>;
export type AdminAppEnv = z.infer<typeof adminEnvShape>;

export function normalizeEnv(source: Record<string, string | undefined>): AppEnv {
  return envShape.parse(source);
}

export function getEnv() {
  return normalizeEnv(process.env);
}

export function getPublicEnv(): PublicAppEnv {
  return publicEnvShape.parse(process.env);
}

export function getServiceRoleEnv(): ServiceRoleAppEnv {
  return serviceRoleEnvShape.parse(process.env);
}

export function getAdminEnv(): AdminAppEnv {
  return adminEnvShape.parse(process.env);
}
