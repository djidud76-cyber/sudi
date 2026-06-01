import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseStorageUrl = import.meta.env.VITE_SUPABASE_STORAGE_URL || '';
const supabaseRegion = import.meta.env.VITE_SUPABASE_REGION || '';
const supabaseGoogleClientId = import.meta.env.VITE_SUPABASE_GOOGLE_CLIENT_ID || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const storageEndpoint = supabaseStorageUrl;
export const storageRegion = supabaseRegion;
export const googleClientId = supabaseGoogleClientId;
