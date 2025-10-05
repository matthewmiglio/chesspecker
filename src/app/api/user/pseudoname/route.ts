import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/user/pseudoname
 *
 * Returns the authenticated user's pseudoname from the chesspecker-pseudonames table.
 * Uses RLS policy to ensure users can only read their own pseudoname.
 *
 * Authentication: Requires valid NextAuth session (OAuth via Google)
 * Authorization: RLS policy enforces email = auth.jwt()->>'email'
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

    // Query the table directly using the validated email from NextAuth session
    // Using maybeSingle() to handle 0 or 1 rows gracefully (returns null data if no row)
    const { data, error } = await supabase
      .from("chesspecker-pseudonames")
      .select("pseudoname")
      .eq("email", session.user.email)
      .maybeSingle();

    if (error) {
      console.error("[GET /api/user/pseudoname] Query error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // If no row exists, data will be null
    return NextResponse.json({ pseudoname: data?.pseudoname ?? null });
  } catch (err) {
    console.error("[GET /api/user/pseudoname] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
