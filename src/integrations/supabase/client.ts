import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { brokeredPreviewStorage } from './previewAuthStorage';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://pydbvbvsdhrxorjdngdv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZGJ2YnZzZGhyeG9yamRuZ2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MzQ4NTcsImV4cCI6MjA5MzExMDg1N30.hCae6SnTm-CEURlC9J0sVUvHKsBfdKqTBlauCXEH2D4';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: brokeredPreviewStorage(),
    persistSession: true,
    autoRefreshToken: true,
  }
});
