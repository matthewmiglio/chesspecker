import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/user/pseudoname
 *
 * Returns the authenticated user's pseudoname, creating one if it doesn't exist.
 * Calls ensure_user_pseudoname() RPC function which handles get-or-create logic.
 *
 * Authentication: Requires valid NextAuth session (OAuth via Google)
 * Authorization: Session email validated before RPC call
 */
export async function GET() {
  // Validate session server-side
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized: No active session" },
      { status: 401 }
    );
  }

  try {
    // Create Supabase client with SERVICE ROLE key to bypass RLS
    // This is secure because we've already validated the NextAuth session above
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Call ensure_user_pseudoname() RPC function
    // This will create a pseudoname if one doesn't exist, or return existing one
    const { data, error } = await supabase
      .rpc('ensure_user_pseudoname', { user_email: session.user.email });

    if (error) {
      console.error("[GET /api/user/pseudoname] RPC error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // data is the pseudoname string directly (not { pseudoname: "..." })
    return NextResponse.json({ pseudoname: data ?? null });
  } catch (err) {
    console.error("[GET /api/user/pseudoname] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
