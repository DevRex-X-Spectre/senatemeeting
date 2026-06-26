"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached: SupabaseClient | undefined;

/**
 * Memoized browser Supabase client.
 * Singleton per browser session — safe across re-renders.
 */
export function createClient(): SupabaseClient {
  if (!cached) {
    cached = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ) as SupabaseClient;
  }
  return cached;
}