import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Validation schema for incrementing stats
const incrementStatsSchema = z.object({
  puzzle_starts: z.number().int().nonnegative("Puzzle starts must be 0 or greater").max(1000, "Increment too large").optional().default(0),
  correct_puzzles: z.number().int().nonnegative("Correct puzzles must be 0 or greater").max(1000, "Increment too large").optional().default(0),
  incorrect_puzzles: z.number().int().nonnegative("Incorrect puzzles must be 0 or greater").max(1000, "Increment too large").optional().default(0),
  set_creates: z.number().int().nonnegative("Set creates must be 0 or greater").max(100, "Increment too large").optional().default(0),
  hints: z.number().int().nonnegative("Hints must be 0 or greater").max(1000, "Increment too large").optional().default(0),
  puzzle_requests: z.number().int().nonnegative("Puzzle requests must be 0 or greater").max(1000, "Increment too large").optional().default(0),
});

/**
 * GET /api/user/stats
 *
 * Returns the authenticated user's stats, creating a row if it doesn't exist.
 * Calls ensure_user_stats() RPC function which handles get-or-create logic.
 *
 * Authentication: Requires valid NextAuth session (OAuth via Google)
 * Authorization: Session email validated before RPC call
 */
export async function GET() {
  console.log('[API GET /user/stats] Request received');

  // Validate session server-side
  const session = await getServerSession(authOptions);
  console.log('[API GET /user/stats] Session:', session?.user?.email || 'No session');

  if (!session?.user?.email) {
    console.error('[API GET /user/stats] Unauthorized - no session');
    return NextResponse.json(
      { error: "Unauthorized" },
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

    console.log('[API GET /user/stats] Calling ensure_user_stats RPC for:', session.user.email);

    // Call ensure_user_stats() RPC function
    // This will create stats if they don't exist, or return existing ones
    const { data, error } = await supabase
      .rpc('ensure_user_stats', { p_user_email: session.user.email });

    if (error) {
      console.error("[API GET /user/stats] RPC error:", {
        code: error.code,
        message: error.message,
        email: session.user.email
      });
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('[API GET /user/stats] Stats retrieved:', data);

    // RPC returns TABLE(...), so data is an array; get first row
    const stats = Array.isArray(data) && data.length > 0 ? data[0] : null;

    return NextResponse.json({ stats });
  } catch (err) {
    console.error("[API GET /user/stats] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/stats
 *
 * Increments user stats counters.
 *
 * Body: {
 *   puzzle_starts?: number;
 *   correct_puzzles?: number;
 *   incorrect_puzzles?: number;
 *   set_creates?: number;
 *   hints?: number;
 *   puzzle_requests?: number;
 * }
 *
 * All fields are optional and default to 0.
 *
 * Calls increment_user_stats() RPC function.
 *
 * Authentication: Requires valid NextAuth session (OAuth via Google)
 * Authorization: Session email validated before RPC call
 */
export async function POST(request: NextRequest) {
  console.log('[API POST /user/stats] Request received');

  // Validate session server-side
  const session = await getServerSession(authOptions);
  console.log('[API POST /user/stats] Session:', session?.user?.email || 'No session');

  if (!session?.user?.email) {
    console.error('[API POST /user/stats] Unauthorized - no session');
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    console.log('[API POST /user/stats] Request body:', body);

    // Validate input with Zod
    const validation = incrementStatsSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const deltas = validation.data;
    console.log('[API POST /user/stats] Validated deltas:', deltas);

    // Create Supabase client with SERVICE ROLE key to bypass RLS
    // This is secure because we've already validated the NextAuth session above
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('[API POST /user/stats] Calling increment_user_stats RPC');

    // Call increment_user_stats RPC
    const { data, error } = await supabase.rpc('increment_user_stats', {
      p_user_email: session.user.email,
      d_puzzle_starts: deltas.puzzle_starts,
      d_correct_puzzles: deltas.correct_puzzles,
      d_incorrect_puzzles: deltas.incorrect_puzzles,
      d_set_creates: deltas.set_creates,
      d_hints: deltas.hints,
      d_puzzle_requests: deltas.puzzle_requests,
    });

    if (error) {
      console.error("[API POST /user/stats] RPC error:", {
        code: error.code,
        message: error.message,
        email: session.user.email,
        deltas
      });
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('[API POST /user/stats] Stats updated:', data);

    // RPC returns TABLE(...), so data is an array; get first row
    const stats = Array.isArray(data) && data.length > 0 ? data[0] : null;

    return NextResponse.json({ stats });
  } catch (err) {
    console.error("[API POST /user/stats] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
