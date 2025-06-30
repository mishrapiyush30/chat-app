import { createClient } from '@supabase/supabase-js';

// Try to get variables from import.meta.env first (for development)
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// If not found, try to get from window.ENV (for production)
if (typeof window !== 'undefined' && window.ENV) {
  supabaseUrl = supabaseUrl || window.ENV.VITE_SUPABASE_URL;
  supabaseAnonKey = supabaseAnonKey || window.ENV.VITE_SUPABASE_ANON_KEY;
}

// Hardcode as a last resort (not recommended for production)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables, falling back to hardcoded values');
  supabaseUrl = "https://wcxuyqwujclrozlqkhok.supabase.co";
  supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjeHV5cXd1amNsc" +
    "m96bHFraG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMjUwMzcsImV4cCI6MjA2NjcwMTAzN30.V9Br0jW3nZUBaW8VTRIezMlH77UaXh" +
    "ziPcTBA5w66x4";
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
