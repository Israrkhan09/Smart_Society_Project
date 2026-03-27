import { createClient } from "@supabase/supabase-js";

// Ensure you define these environment variables in your .env.local file.
// You can grab them from your Supabase Dashboard > Project Settings > API.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zhmelokgojxlszetmtff.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// In a real Server setup handling Firebase authenticated calls,
// you might pass down the service role key internally for aggressive server actions:
const supbaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Public Supabase Client for client-side queries.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Secured Server/Admin Client that bypasses RLS for Server Actions.
 * (Only construct this inside server components/actions explicitly!)
 */
export const getSupabaseAdmin = () => {
   if (!supbaseServiceKey) throw new Error("Missing Service Role Key!");
   return createClient(supabaseUrl, supbaseServiceKey);
};
