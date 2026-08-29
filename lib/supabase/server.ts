import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { isSupabaseConfigured } from './client';

export function createServerSupabaseClient() {
  const supabaseUrl = isSupabaseConfigured
    ? (process.env.NEXT_PUBLIC_SUPABASE_URL as string)
    : 'https://placeholder.supabase.co';
  const supabaseAnonKey = isSupabaseConfigured
    ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
    : 'placeholder-anon-key';

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createAdminSupabaseClient() {
  const supabaseUrl = isSupabaseConfigured
    ? (process.env.NEXT_PUBLIC_SUPABASE_URL as string)
    : 'https://placeholder.supabase.co';
  const serviceRoleKey = isSupabaseConfigured
    ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key')
    : 'placeholder-service-role-key';

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

