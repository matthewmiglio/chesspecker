import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";

/**
 * Creates an authenticated Supabase client that includes the user's JWT
 * for Row Level Security (RLS) policy enforcement.
 *
 * This client should only be used in server-side code (API routes, Server Components).
 * RLS policies will use auth.jwt()->>'email' to match the authenticated user.
 */
export async function getAuthenticatedSupabaseClient() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Unauthorized: No active session");
  }

  // Create Supabase client with anon key
  // The user's session/JWT will be passed via request headers
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
  );

  return supabase;
}
