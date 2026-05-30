import { createClient, SupabaseClient } from '@supabase/supabase-js';

let anonClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://quxjwgptooyohtdulggh.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

export function getSupabase(): SupabaseClient {
  if (!anonClient) {
    anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return anonClient;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return adminClient;
}
