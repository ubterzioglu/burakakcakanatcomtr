import { createClient } from "@supabase/supabase-js";

import { getEnv } from "@/lib/env";

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type GenericRow = {
  id?: string;
  key?: string;
  slug?: string | null;
  order_index?: number | null;
  published?: boolean | null;
  featured?: boolean | null;
  published_at?: string | null;
  payload?: Json;
  created_at?: string | null;
  updated_at?: string | null;
};

export function createPublicSupabaseClient() {
  const env = getEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function createServiceRoleSupabaseClient() {
  const env = getEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
