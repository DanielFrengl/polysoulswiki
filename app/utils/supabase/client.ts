import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true, // Ensures the session persists across page reloads
      autoRefreshToken: true, // Automatically refreshes session tokens
      detectSessionInUrl: true, // Handles OAuth redirects
    },
  }
);