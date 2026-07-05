import { createClient } from "@supabase/supabase-js";

import { getPublicEnv, getServiceRoleEnv } from "@/lib/env";

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
  const env = getPublicEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function createServiceRoleSupabaseClient() {
  const env = getServiceRoleEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
