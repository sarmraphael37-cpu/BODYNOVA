"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/env";
import type { Database } from "@/types/supabase";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (client) return client;
  const { url, anonKey } = getSupabaseConfig();
  client = createBrowserClient<Database>(url, anonKey);
  return client;
}
